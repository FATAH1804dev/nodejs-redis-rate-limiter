import Redis from "ioredis";

export const redis = new Redis({
  host: "127.0.0.1",
  port: 6380,
  db: 0,
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("ready", () => {
  console.log("Redis ready");
});

redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

redis.on("close", () => {
  console.log("Redis closed");
});

redis.on("reconnecting", () => {
  console.log("Redis reconnecting");
});
