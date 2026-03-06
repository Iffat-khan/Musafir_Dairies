import jwt from "jsonwebtoken";
import { env } from "../env.js";

export type JwtPayload = {
  sub: string;
};

export function signAccessToken(userId: string) {
  const payload: JwtPayload = { sub: userId };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "14d" });
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded !== "object" || decoded === null || typeof (decoded as any).sub !== "string") {
    throw new Error("Invalid token");
  }
  return decoded as JwtPayload;
}

