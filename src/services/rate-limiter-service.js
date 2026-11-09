import { redis } from "../application/redis.js";

const limitReq = 2;
const windowMs = 1000;
const incrementScript = `
  local count = redis.call("INCR", KEYS[1])
  if count == 1 then
    redis.call("PEXPIRE", KEYS[1], ARGV[1])
  end
  return count
`;

export const isReachedLimit = async (user) => {
  const key = `rate-limit:${user.token}`;
  const increment = await redis.eval(incrementScript, 1, key, windowMs);
  return increment <= limitReq;
};

// const limitReq = 2;
// const expiredTime = 1;

// export const isReachedLimit = async (user) => {
//   const key = user.username;
//   const increment = await redis.incr(key);
//   if (increment === 1) {
//     await redis.expire(key, expiredTime);
//   }

//   return increment <= limitReq;
// };
