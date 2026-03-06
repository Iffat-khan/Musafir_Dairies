import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth/middleware.js";
import { geocodeCity } from "../geo/openMeteo.js";

export const tripsRouter = Router();

tripsRouter.use(requireAuth);

const createTripSchema = z.object({
  title: z.string().min(2).max(80),
  destination: z.string().min(2).max(80),
  startDate: z.string(),
  endDate: z.string(),
  interests: z.array(z.string()).optional(),
  budgetTotal: z.number().int().positive().optional(),
  budgetCurrency: z.string().min(3).max(6).optional(),
});

tripsRouter.get("/", async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const trips = await prisma.trip.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
  });
  return res.json({ trips });
});

tripsRouter.post("/", async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const parsed = createTripSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const geo = await geocodeCity(parsed.data.destination).catch(() => null);
  const trip = await prisma.trip.create({
    data: {
      userId,
      title: parsed.data.title,
      destination: parsed.data.destination,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      interests: parsed.data.interests ?? [],
      budgetTotal: parsed.data.budgetTotal ?? null,
      budgetCurrency: parsed.data.budgetCurrency ?? "USD",
      latitude: geo?.latitude ?? null,
      longitude: geo?.longitude ?? null,
      companionPosts: {
        create: {
          destination: parsed.data.destination,
          startDate: new Date(parsed.data.startDate),
          endDate: new Date(parsed.data.endDate),
          message: "Looking for travel buddies!",
        },
      },
    },
  });

  return res.json({ trip });
});

tripsRouter.get("/:id", async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const trip = await prisma.trip.findFirst({
    where: { id: req.params.id, userId },
    include: {
      itinerary: { include: { places: true, hotels: true }, orderBy: { dayNumber: "asc" } },
      expenses: { orderBy: { date: "desc" } },
      packingList: true,
      journal: { include: { photos: true }, orderBy: { date: "desc" } },
    },
  });
  if (!trip) return res.status(404).json({ error: "Not found" });
  return res.json({ trip });
});

