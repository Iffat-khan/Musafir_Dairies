import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth/middleware.js";

export const companionsRouter = Router();
companionsRouter.use(requireAuth);

companionsRouter.get("/search", async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const destination = typeof req.query.destination === "string" ? req.query.destination : "";
  const startDate = typeof req.query.startDate === "string" ? req.query.startDate : "";
  const endDate = typeof req.query.endDate === "string" ? req.query.endDate : "";

  const results = await prisma.companionPost.findMany({
    where: {
      destination: { contains: destination, mode: "insensitive" },
      startDate: startDate ? { gte: new Date(startDate) } : undefined,
      endDate: endDate ? { lte: new Date(endDate) } : undefined,
      trip: { userId: { not: userId } },
    },
    include: {
      trip: {
        include: { user: { select: { id: true, displayName: true, avatarUrl: true, bio: true, homeCity: true } } },
      },
    },
    take: 100,
    orderBy: { createdAt: "desc" },
  });

  return res.json({ results });
});

const createChatSchema = z.object({
  otherUserId: z.string(),
});

companionsRouter.post("/chats", async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const parsed = createChatSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  if (parsed.data.otherUserId === userId) return res.status(400).json({ error: "Invalid user" });

  // Find existing 1:1 chat
  const existing = await prisma.chatRoom.findFirst({
    where: {
      AND: [
        { members: { some: { userId } } },
        { members: { some: { userId: parsed.data.otherUserId } } },
      ],
    },
    select: { id: true },
  });
  if (existing) return res.json({ chatId: existing.id });

  const chat = await prisma.chatRoom.create({
    data: {
      members: { create: [{ userId }, { userId: parsed.data.otherUserId }] },
    },
    select: { id: true },
  });

  return res.json({ chatId: chat.id });
});

companionsRouter.get("/chats", async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const chats = await prisma.chatRoom.findMany({
    where: { members: { some: { userId } } },
    select: {
      id: true,
      createdAt: true,
      members: { select: { userId: true, user: { select: { displayName: true, avatarUrl: true } } } },
      messages: { take: 1, orderBy: { createdAt: "desc" }, select: { body: true, createdAt: true, userId: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return res.json({ chats });
});

companionsRouter.get("/chats/:chatId/messages", async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const member = await prisma.chatMember.findFirst({ where: { chatId: req.params.chatId, userId } });
  if (!member) return res.status(403).json({ error: "Forbidden" });

  const messages = await prisma.chatMessage.findMany({
    where: { chatId: req.params.chatId },
    orderBy: { createdAt: "asc" },
    take: 200,
    include: { user: { select: { id: true, displayName: true, avatarUrl: true } } },
  });
  return res.json({ messages });
});

