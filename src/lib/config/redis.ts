import { createClient } from "redis";

let redisClient: any;

try {
    if (process.env.REDIS_HOST) {
        redisClient = await createClient({
          username: process.env.REDIS_USERNAME,
          password: process.env.REDIS_PASSWORD,
          socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT) || 6379,
          },
          database: Number(process.env.REDIS_DB) || 0,
        })
          .on("error", (err) => console.log("Redis Client Error", err));
          
        await redisClient.connect();
    } else {
        console.warn("Redis env vars missing, using mock/noop client.");
        redisClient = {
            get: async () => null,
            set: async () => "OK",
            hGetAll: async () => ({}),
            hSet: async () => 1,
            zRange: async () => [],
            zAdd: async () => 1,
            zRem: async () => 1,
            multi: () => ({ exec: async () => [], del: () => {}, hSet: () => {}, zAdd: () => {}, zRem: () => {} }),
            del: async () => 1
        };
    }
} catch (e) {
    console.error("Failed to connect to Redis, falling back to no-op", e);
    redisClient = {
            get: async () => null,
            set: async () => "OK",
            hGetAll: async () => ({}),
            hSet: async () => 1,
            zRange: async () => [],
            zAdd: async () => 1,
            zRem: async () => 1,
            multi: () => ({ exec: async () => [], del: () => {}, hSet: () => {}, zAdd: () => {}, zRem: () => {} }),
            del: async () => 1
    };
}

export { redisClient };
