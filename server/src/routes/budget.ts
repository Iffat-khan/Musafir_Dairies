import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth/middleware.js";

export const budgetRouter = Router();
budgetRouter.use(requireAuth);

budgetRouter.get("/:tripId/summary", async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const trip = await prisma.trip.findFirst({
    where: { id: req.params.tripId, userId },
    include: { expenses: true },
  });
  if (!trip) return res.status(404).json({ error: "Trip not found" });

  const spent = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
  const total = trip.budgetTotal ?? 0;
  const remaining = total ? total - spent : null;

  const byCategory: Record<string, number> = {};
  for (const e of trip.expenses) {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
  }

  return res.json({
    currency: trip.budgetCurrency,
    budgetTotal: trip.budgetTotal,
    spent,
    remaining,
    byCategory,
  });
});

const addExpenseSchema = z.object({
  tripId: z.string(),
  date: z.string(),
  amount: z.number().int().positive(),
  currency: z.string().min(3).max(6).optional(),
  category: z.string().optional(),
  note: z.string().max(2000).optional(),
});

budgetRouter.post("/expense", async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const parsed = addExpenseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const trip = await prisma.trip.findFirst({ where: { id: parsed.data.tripId, userId } });
  if (!trip) return res.status(404).json({ error: "Trip not found" });

  const expense = await prisma.expense.create({
    data: {
      tripId: trip.id,
      date: new Date(parsed.data.date),
      amount: parsed.data.amount,
      currency: parsed.data.currency ?? trip.budgetCurrency,
      category: (parsed.data.category as any) ?? "OTHER",
      note: parsed.data.note ?? null,
    },
  });
  return res.json({ expense });
});

