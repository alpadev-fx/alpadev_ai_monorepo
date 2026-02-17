import Redis from "ioredis";
import type { ConnectionOptions } from "bullmq";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * BullMQ connection options.
 * BullMQ creates its own ioredis instances internally — passing config
 * avoids version mismatches between our ioredis and BullMQ's bundled one.
 */
export function getBullMQConnectionOptions(): ConnectionOptions {
  const url = new URL(REDIS_URL);
  return {
    host: url.hostname,
    port: parseInt(url.port || "6379", 10),
    password: url.password || undefined,
    maxRetriesPerRequest: null, // Required by BullMQ
  };
}

/**
 * Create a new ioredis connection for pub/sub.
 * Each subscriber needs its own connection (Redis limitation).
 */
export function createSubscriberConnection(): Redis {
  const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      const delay = Math.min(times * 200, 5000);
      console.log(`[Redis] Reconnecting in ${delay}ms (attempt ${times})`);
      return delay;
    },
  });

  redis.on("connect", () => {
    console.log("[Redis] Subscriber connected");
  });

  redis.on("error", (err) => {
    console.error("[Redis] Subscriber error:", err.message);
  });

  return redis;
}

/**
 * Create a new ioredis connection for publishing.
 */
export function createPublisherConnection(): Redis {
  const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      const delay = Math.min(times * 200, 5000);
      return delay;
    },
  });

  redis.on("error", (err) => {
    console.error("[Redis] Publisher error:", err.message);
  });

  return redis;
}
