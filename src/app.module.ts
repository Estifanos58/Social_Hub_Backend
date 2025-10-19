import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';
import { TokenService } from './token/token.service';
import * as cookie from 'cookie';
import { TokenModule } from './token/token.module';
import { MailModule } from './mail/mail.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { NotificationModule } from './notification/notification.module';
import { MessageModule } from './message/message.module';
import { redisPubSub } from './pubsub';
import { ChatroomModule } from './chatroom/chatroom.module';
import { UserDisconnectedEvent } from './user/event';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    TokenModule,
    MailModule,
    UserModule,
    PostModule,
    CommentModule,
    NotificationModule,
    MessageModule,
    ChatroomModule,
    EventEmitterModule.forRoot(),
    GraphQLModule.forRootAsync({
      imports: [ConfigModule, AuthModule, TokenModule],
      inject: [ConfigService, TokenService, EventEmitter2],
      driver: ApolloDriver,
      useFactory: async (
        configService: ConfigService,
        tokenService: TokenService,
        eventEmitter: EventEmitter2,
      ) => {
        return {
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          sortSchema: true,
          playground: configService.get<string>('NODE_ENV') !== 'production',

          subscriptions: {
            // Enable both if you really need legacy support
            'graphql-ws': {
              onConnect: async (context) => {
                const { extra } = context;
                const req = extra.request; // Upgrade request
                const rawCookies = req?.headers?.cookie;
                if (!rawCookies) throw new Error('No cookies found');

                const parsedCookies = cookie.parse(rawCookies);
                const refreshToken =
                  parsedCookies['refreshToken'] ?? parsedCookies['refresh_token'];
                if (!refreshToken) throw new Error('No refresh token found');

                const user = await tokenService.validateToken(refreshToken);
                // console.log('USER FROM GRAPHQL-WS :', user)
                if (!user) throw new Error('Invalid token');

                const userId = user?.sub ?? user?.id;
                if (!userId) {
                  throw new Error('Authenticated user does not include an id');
                }

                extra.user = user;
                extra.userId = userId;

                await redisPubSub.publish(`userOnline.${userId}`, {
                  userOnline: {
                    userId,
                    isOnline: true,
                    lastSeenAt: null,
                  },
                });

                return { user, userId };
              },
              onDisconnect: async (context) => {
                const { extra } = context as {
                  extra: {
                    user?: { sub?: string; id?: string };
                    userId?: string;
                  };
                };

                const userId = extra?.user?.sub ?? extra?.user?.id ?? extra?.userId;
                if (!userId) {
                  return;
                }

                const disconnectedAt = new Date();

                await redisPubSub.publish(`userDisconnect.${userId}`, {
                  userDisconnect: {
                    userId,
                    isOnline: false,
                    lastSeenAt: disconnectedAt,
                  },
                });

                eventEmitter.emit(
                  'user.disconnected',
                  new UserDisconnectedEvent(userId, disconnectedAt),
                );
              },
            },
          },

          context: ({ req, res, connection }) => {
            if (connection) {
              return {
                req,
                res,
                user: connection.context.user,
                pubSub: redisPubSub,
              };
            }
            return { req, res, pubSub: redisPubSub };
          },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
