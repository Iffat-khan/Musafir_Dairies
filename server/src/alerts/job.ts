import cron from "node-cron";
import { prisma } from "../db.js";
import { getWeatherSummary } from "../geo/openMeteo.js";
import { pushAlert } from "./sse.js";

export function startAlertsJob() {
  // Every 10 minutes
  cron.schedule("*/10 * * * *", async () => {
    const activeTrips = await prisma.trip.findMany({
      where: { status: { in: ["ACTIVE", "BOOKED", "PLANNING"] } },
      select: { id: true, destination: true, latitude: true, longitude: true, userId: true },
      take: 50,
    });

    for (const t of activeTrips) {
      if (t.latitude == null || t.longitude == null) continue;
      const summary = await getWeatherSummary(t.latitude, t.longitude);
      if (!summary) continue;

      const alert = await prisma.alert.create({
        data: {
          userId: t.userId,
          kind: "WEATHER",
          title: `Weather update: ${t.destination}`,
          body: summary,
          severity: "info",
          city: t.destination,
        },
      });

      pushAlert(t.userId, alert);
    }
  });
}

