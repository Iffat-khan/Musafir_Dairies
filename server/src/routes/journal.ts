import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth/middleware.js";

export const journalRouter = Router();
journalRouter.use(requireAuth);

const uploadDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-z0-9._-]/gi, "_");
    cb(null, `${Date.now()}_${safe}`);
  },
});

const upload = multer({ storage });

journalRouter.get("/", async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const tripId = typeof req.query.tripId === "string" ? req.query.tripId : undefined;
  const entries = await prisma.journalEntry.findMany({
    where: { userId, tripId: tripId ?? undefined },
    include: { photos: true },
    orderBy: { date: "desc" },
    take: 200,
  });
  return res.json({ entries });
});

const createEntrySchema = z.object({
  tripId: z.string(),
  date: z.string(),
  title: z.string().min(2).max(120),
  note: z.string().min(1).max(8000),
});

journalRouter.post("/", async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const parsed = createEntrySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const trip = await prisma.trip.findFirst({ where: { id: parsed.data.tripId, userId } });
  if (!trip) return res.status(404).json({ error: "Trip not found" });

  const entry = await prisma.journalEntry.create({
    data: {
      userId,
      tripId: trip.id,
      date: new Date(parsed.data.date),
      title: parsed.data.title,
      note: parsed.data.note,
    },
    include: { photos: true },
  });

  return res.json({ entry });
});

journalRouter.post("/:entryId/photos", upload.array("photos", 10), async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const entry = await prisma.journalEntry.findFirst({
    where: { id: req.params.entryId, userId },
  });
  if (!entry) return res.status(404).json({ error: "Entry not found" });

  const files = (req.files as Express.Multer.File[]) ?? [];
  const created = await prisma.journalPhoto.createMany({
    data: files.map((f) => ({
      entryId: entry.id,
      url: `/uploads/${f.filename}`,
      caption: null,
    })),
  });

  return res.json({ ok: true, created: created.count });
});

