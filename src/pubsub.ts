import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis, { RedisOptions } from 'ioredis';

const createRedisClient = () => {
  const options: RedisOptions = {
    tls: {},
    retryStrategy: (times) => {
      return Math.min(times * 50, 2000);
    },
  };

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not set');
  }

  return new Redis(redisUrl, options);
};

const isoDateRegex =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z$/;

const reviveDates = (_key: unknown, value: unknown) => {
  if (typeof value === 'string' && isoDateRegex.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }
  return value;
};

export const redisPubSub = new RedisPubSub({
  publisher: createRedisClient(),
  subscriber: createRedisClient(),
  reviver: reviveDates,
});
