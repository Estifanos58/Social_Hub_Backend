import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { TokenService } from './token/token.service';
import * as cookie from 'cookie';
import { TokenModule } from './token/token.module';
import Redis from 'ioredis';
import { MailModule } from './mail/mail.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { NotificationModule } from './notification/notification.module';
import { MessageModule } from './message/message.module';

const redisClient = new Redis(process.env.REDIS_URL!, {
  tls: {}
});
const pubSub = new RedisPubSub({
  publisher: redisClient,
  subscriber: redisClient,
  connection: {
    retryStrategy: (times) => {
      // retry strategy
      return Math.min(times * 50, 2000);
    },
  },
});

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
    EventEmitterModule.forRoot(),
    GraphQLModule.forRootAsync({
      imports: [ConfigModule, AuthModule, TokenModule],
      inject: [ConfigService, TokenService],
      driver: ApolloDriver,
      useFactory: async (
        configService: ConfigService,
        tokenService: TokenService,
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

                return { user };
              },
            },
            // For Legacy Support
            // 'subscriptions-transport-ws': {
            //   onConnect: async (connectionParams, webSocket, context) => {
            //     const rawCookies = context?.request?.headers?.cookie;
            //     if (!rawCookies) throw new Error('No cookies found');

            //     const parsedCookies = cookie.parse(rawCookies);
            //     const refreshToken =
            //       parsedCookies['refreshToken'] ?? parsedCookies['refresh_token'];
            //     if (!refreshToken) throw new Error('No refresh token found');

            //     const user = await tokenService.validateToken(refreshToken);
            //     console.log('USER FROM SUBSCRIPTION :', user)
            //     if (!user) throw new Error('Invalid token');

            //     return { user };
            //   },
            // },
          },

          context: ({ req, res, connection }) => {
            if (connection) {
              return {
                req,
                res,
                user: connection.context.user,
                pubSub,
              };
            }
            return { req, res, pubSub };
          },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
