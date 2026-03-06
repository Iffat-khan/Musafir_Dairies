import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "./tokens.js";

export type AuthedRequest = Request & { userId: string };

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = (req as any).cookies?.token as string | undefined;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const payload = verifyAccessToken(token);
    (req as AuthedRequest).userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

