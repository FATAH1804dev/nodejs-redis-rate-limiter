import { prisma } from "../application/database.js";
import { responseError } from "../error/error-response.js";
import { isReachedLimit } from "../services/rate-limiter-service.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.get("Authorization");
  if (!token) {
    res
      .status(401)
      .json({
        errors: "unauthorized",
      })
      .end();
  } else {
    const getUserByToken = await prisma.user.findFirst({
      where: {
        token: token,
      },
    });

    if (!getUserByToken) {
      res
        .status(401)
        .json({
          errors: "unauthorized",
        })
        .end();
    } else {
      if (await isReachedLimit(getUserByToken)) {
        req.user = getUserByToken;
        next();
      } else {
        res
          .status(429)
          .json({
            errors: "too many requests",
          })
          .end();
      }
    }
  }
};
