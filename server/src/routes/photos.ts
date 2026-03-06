import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../auth/middleware.js";

export const photoSpotsRouter = Router();
photoSpotsRouter.use(requireAuth);

photoSpotsRouter.get("/", async (req, res) => {
  const city = typeof req.query.city === "string" ? req.query.city : undefined;
  const spots = await prisma.photoSpot.findMany({
    where: city ? { city: { contains: city, mode: "insensitive" } } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return res.json({ spots });
});

