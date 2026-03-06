import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import path from "path";
import { env } from "./env.js";
import { authRouter } from "./auth/routes.js";
import { tripsRouter } from "./routes/trips.js";
import { aiRouter } from "./routes/ai.js";
import { gemsRouter } from "./routes/gems.js";
import { budgetRouter } from "./routes/budget.js";
import { companionsRouter } from "./routes/companions.js";
import { photoSpotsRouter } from "./routes/photos.js";
import { journalRouter } from "./routes/journal.js";
import { attachSocket } from "./socket.js";
import { startAlertsJob } from "./alerts/job.js";
import { addSseClient } from "./alerts/sse.js";
import { requireAuth, type AuthedRequest } from "./auth/middleware.js";
import { prisma } from "./db.js";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/trips", tripsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/gems", gemsRouter);
app.use("/api/budget", budgetRouter);
app.use("/api/companions", companionsRouter);
app.use("/api/photo-spots", photoSpotsRouter);
app.use("/api/journal", journalRouter);

// Alerts: latest list + SSE stream
app.get("/api/alerts", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const alerts = await prisma.alert.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return res.json({ alerts });
});

app.get("/api/alerts/stream", requireAuth, (req, res) => {
  const userId = (req as AuthedRequest).userId;
  addSseClient(userId, res);
});

// serve journal uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const httpServer = http.createServer(app);
attachSocket(httpServer);
startAlertsJob();

httpServer.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${env.PORT}`);
});

