import { Router } from "express";
import { requireAuth } from "../auth/middleware.js";
import { prisma } from "../db.js";
import { itineraryInputSchema, generateItinerary, packingInputSchema, generatePackingList, generateTripStory } from "../ai/generators.js";

export const aiRouter = Router();

aiRouter.use(requireAuth);

aiRouter.post("/itinerary", async (req, res) => {
  const parsed = itineraryInputSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const result = generateItinerary(parsed.data);
  return res.json(result);
});

aiRouter.post("/packing-list", async (req, res) => {
  const parsed = packingInputSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const result = generatePackingList(parsed.data);
  return res.json(result);
});

aiRouter.post("/trip-story", async (req, res) => {
  const schema = (await import("zod")).z.object({
    tripId: (await import("zod")).z.string(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const trip = await prisma.trip.findFirst({
    where: { id: parsed.data.tripId },
    include: { journal: { include: { photos: true }, orderBy: { date: "asc" } } },
  });
  if (!trip) return res.status(404).json({ error: "Trip not found" });

  const highlights: string[] = [];
  const notes: string[] = [];
  for (const e of trip.journal) {
    if (e.title) highlights.push(e.title);
    if (e.note) notes.push(e.note);
  }

  const story = generateTripStory({
    destination: trip.destination,
    startDate: trip.startDate.toISOString().slice(0, 10),
    endDate: trip.endDate.toISOString().slice(0, 10),
    highlights,
    notes,
  });

  return res.json(story);
});

