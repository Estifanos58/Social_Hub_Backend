import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    app.enableCors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    // all headers that client are allowed to use
    allowedHeaders: [
      'Accept',
      'Authorization',
      'Content-Type',
      'X-Requested-With',
      'apollo-require-preflight',
    ],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  });
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      // makes sure only properties defined in the DTO are accepted
      whitelist: true,
      // converts payloads to be objects typed according to their DTO classes
      transform: true,
      // throw a custom error message on validation errors
      exceptionFactory: (errors) => {
        // errors is an array of ValidationError objects
        // we are taking the array and reduce it to an object where
        // the keys are the properties that failed validation and the value is the error message
        const formattedErrors = errors.reduce((accumulator, error) => {
          accumulator[error.property] = error.constraints
            ? Object.values(error.constraints).join(', ')
            : '';
          return accumulator;
        }, {});

        throw new BadRequestException(formattedErrors);
      },
    }),);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
