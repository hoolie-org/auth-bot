import Redis from "ioredis";
import config from "../config";

export const $redis = new Redis({
  db: config.REDIS.DB
});

export default $redis;
