import { z } from "zod";

export const itineraryInputSchema = z.object({
  destination: z.string().min(2).max(80),
  budget: z.number().int().positive().max(1_000_000),
  days: z.number().int().min(1).max(30),
  interests: z.array(z.string().min(1).max(30)).max(12).default([]),
  currency: z.string().min(3).max(6).default("USD"),
});

export function generateItinerary(input: z.infer<typeof itineraryInputSchema>) {
  const interests = input.interests.length ? input.interests : ["culture", "food", "scenic views"];
  const perDay = Math.max(20, Math.round(input.budget / input.days));

  const dayTemplates = [
    { title: "Old Town & Local Flavors", kinds: ["landmark", "market", "cafe"] },
    { title: "Museums & Sunset Views", kinds: ["museum", "gallery", "viewpoint"] },
    { title: "Neighborhood Walks", kinds: ["street", "park", "hidden alley"] },
    { title: "Day Trip Vibes", kinds: ["lake", "hike", "local village"] },
  ];

  const days = Array.from({ length: input.days }, (_, i) => {
    const tpl = dayTemplates[i % dayTemplates.length];
    const interest = interests[i % interests.length];
    const estDailyCost = perDay;

    return {
      dayNumber: i + 1,
      title: `Day ${i + 1}: ${tpl.title}`,
      summary: `Focus on ${interest} in ${input.destination} with a balanced pace and budget-friendly stops.`,
      estDailyCost,
      places: tpl.kinds.map((k, idx) => ({
        name: `${input.destination} ${k} spot #${idx + 1}`,
        kind: k,
        description: `A recommended ${k} aligned with ${interest}.`,
        estCost: Math.round(estDailyCost * (idx === 0 ? 0.25 : idx === 1 ? 0.15 : 0.1)),
        order: idx,
      })),
      hotels: [
        {
          name: `${input.destination} Boutique Stay`,
          neighborhood: "Central",
          pricePerNight: Math.round(estDailyCost * 0.6),
        },
        {
          name: `${input.destination} Budget Inn`,
          neighborhood: "Transit-friendly",
          pricePerNight: Math.round(estDailyCost * 0.35),
        },
      ],
    };
  });

  return {
    destination: input.destination,
    currency: input.currency,
    budgetTotal: input.budget,
    estTotal: perDay * input.days,
    days,
  };
}

export const packingInputSchema = z.object({
  destination: z.string().min(2).max(80),
  days: z.number().int().min(1).max(60),
  weatherSummary: z.string().optional(),
  style: z.enum(["light", "balanced", "prepared"]).default("balanced"),
});

export function generatePackingList(input: z.infer<typeof packingInputSchema>) {
  const base = [
    { category: "Essentials", label: "Passport/ID", quantity: 1 },
    { category: "Essentials", label: "Wallet + cards/cash", quantity: 1 },
    { category: "Essentials", label: "Phone + charger", quantity: 1 },
    { category: "Essentials", label: "Reusable water bottle", quantity: 1 },
  ];

  const clothingMultiplier = input.style === "light" ? 0.6 : input.style === "prepared" ? 1.2 : 1;
  const tees = Math.max(2, Math.round(input.days * 0.6 * clothingMultiplier));
  const socks = Math.max(3, Math.round(input.days * 0.8 * clothingMultiplier));

  const clothing = [
    { category: "Clothing", label: "T-shirts/tops", quantity: tees },
    { category: "Clothing", label: "Underwear", quantity: Math.max(4, Math.round(input.days * 0.8 * clothingMultiplier)) },
    { category: "Clothing", label: "Socks", quantity: socks },
    { category: "Clothing", label: "Comfortable walking shoes", quantity: 1 },
    { category: "Clothing", label: "Light jacket", quantity: 1 },
  ];

  const tech = [
    { category: "Tech", label: "Power bank", quantity: 1 },
    { category: "Tech", label: "Universal travel adapter", quantity: 1 },
  ];

  const extras = input.weatherSummary?.toLowerCase().includes("wind")
    ? [{ category: "Weather", label: "Windbreaker", quantity: 1 }]
    : [];

  return {
    destination: input.destination,
    days: input.days,
    weatherSummary: input.weatherSummary ?? null,
    items: [...base, ...clothing, ...tech, ...extras],
  };
}

export function generateTripStory(args: {
  destination: string;
  startDate: string;
  endDate: string;
  highlights: string[];
  notes: string[];
}) {
  const highlights = args.highlights.slice(0, 6);
  const noteBits = args.notes
    .join(" ")
    .split(/\s+/)
    .slice(0, 40)
    .join(" ");

  return {
    title: `Our memories in ${args.destination}`,
    story: `From ${args.startDate} to ${args.endDate}, we explored ${args.destination}. ` +
      (highlights.length ? `Highlights included ${highlights.join(", ")}. ` : "") +
      (noteBits ? `We noted: "${noteBits}${args.notes.join(" ").length > noteBits.length ? "..." : ""}". ` : "") +
      `It was a trip worth remembering.`,
  };
}

