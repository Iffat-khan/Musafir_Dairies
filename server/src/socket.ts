import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import cookie from "cookie";
import { verifyAccessToken } from "./auth/tokens.js";
import { prisma } from "./db.js";

export function attachSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: { origin: true, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie ?? "";
      const parsed = cookie.parse(rawCookie);
      const token = parsed.token;
      if (!token) return next(new Error("Unauthorized"));
      const payload = verifyAccessToken(token);
      (socket.data as any).userId = payload.sub;
      return next();
    } catch {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket.data as any).userId as string;

    socket.on("chat:join", async (chatId: string) => {
      const member = await prisma.chatMember.findFirst({ where: { chatId, userId } });
      if (!member) return;
      socket.join(chatId);
    });

    socket.on("chat:message", async (payload: { chatId: string; body: string }) => {
      if (!payload?.chatId || !payload?.body) return;
      const member = await prisma.chatMember.findFirst({ where: { chatId: payload.chatId, userId } });
      if (!member) return;

      const msg = await prisma.chatMessage.create({
        data: { chatId: payload.chatId, userId, body: payload.body.slice(0, 5000) },
        include: { user: { select: { id: true, displayName: true, avatarUrl: true } } },
      });

      io.to(payload.chatId).emit("chat:message", msg);
    });
  });

  return io;
}

