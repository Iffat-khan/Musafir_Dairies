import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth/middleware.js";

export const gemsRouter = Router();
gemsRouter.use(requireAuth);

gemsRouter.get("/", async (req, res) => {
  const city = typeof req.query.city === "string" ? req.query.city : undefined;
  const gems = await prisma.hiddenGem.findMany({
    where: city ? { city: { equals: city, mode: "insensitive" } } : undefined,
    include: { reviews: true, author: { select: { id: true, displayName: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return res.json({ gems });
});

const createGemSchema = z.object({
  city: z.string().min(2).max(80),
  name: z.string().min(2).max(80),
  type: z.string().optional(),
  description: z.string().min(10).max(2000),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

gemsRouter.post("/", async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const parsed = createGemSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const gem = await prisma.hiddenGem.create({
    data: {
      authorId: userId,
      city: parsed.data.city,
      name: parsed.data.name,
      type: (parsed.data.type as any) ?? "OTHER",
      description: parsed.data.description,
      address: parsed.data.address ?? null,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      tags: parsed.data.tags ?? [],
    },
    include: { reviews: true, author: { select: { id: true, displayName: true, avatarUrl: true } } },
  });

  return res.json({ gem });
});

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

gemsRouter.post("/:id/reviews", async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const review = await prisma.hiddenGemReview.upsert({
    where: { gemId_userId: { gemId: req.params.id, userId } },
    update: { rating: parsed.data.rating, comment: parsed.data.comment ?? null },
    create: { gemId: req.params.id, userId, rating: parsed.data.rating, comment: parsed.data.comment ?? null },
  });
  return res.json({ review });
});

