import React from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { MapView } from "../components/MapView";

export function TripsPage() {
  const [trips, setTrips] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [title, setTitle] = React.useState("");
  const [destination, setDestination] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [budgetTotal, setBudgetTotal] = React.useState("");
  const [error, setError] = React.useState("");

  async function refresh() {
    setLoading(true);
    try {
      const r = await api.get("/trips");
      setTrips(r.data.trips ?? []);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
  }, []);

  const markers = trips
    .filter((t) => t.latitude != null && t.longitude != null)
    .map((t) => ({
      key: t.id,
      lat: t.latitude,
      lng: t.longitude,
      title: t.destination,
      subtitle: `${String(t.startDate).slice(0, 10)} → ${String(t.endDate).slice(0, 10)}`,
    }));

  return (
    <div className="space-y-5">
      <div>
        <div className="text-2xl font-semibold">Trips</div>
        <div className="text-white/60 text-sm">
          Create a trip to store itinerary, budget, alerts, journal, and companions.
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Create trip</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                try {
                  await api.post("/trips", {
                    title,
                    destination,
                    startDate,
                    endDate,
                    budgetTotal: budgetTotal ? Number(budgetTotal) : undefined,
                  });
                  setTitle("");
                  setDestination("");
                  setStartDate("");
                  setEndDate("");
                  setBudgetTotal("");
                  await refresh();
                } catch (err) {
                  setError("Could not create trip. Check the fields.");
                }
              }}
            >
              <div className="md:col-span-2">
                <div className="text-xs text-white/60 mb-1">Trip title</div>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summer escape" />
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-white/60 mb-1">Destination</div>
                <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Lisbon" />
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Start date</div>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">End date</div>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-white/60 mb-1">Budget total (optional)</div>
                <Input value={budgetTotal} onChange={(e) => setBudgetTotal(e.target.value)} placeholder="1500" inputMode="numeric" />
              </div>

              {error ? <div className="text-sm text-rose-300 md:col-span-2">{error}</div> : null}

              <div className="md:col-span-2">
                <Button className="w-full">Create trip</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trips map</CardTitle>
          </CardHeader>
          <CardContent>
            <MapView
              center={markers[0] ? [markers[0].lat, markers[0].lng] : [48.8566, 2.3522]}
              markers={markers}
              height={360}
            />
            <div className="text-xs text-white/60 mt-3">
              Pins appear when we can geocode the destination (Open-Meteo geocoding).
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your trips</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-white/70 text-sm">Loading...</div>
          ) : trips.length === 0 ? (
            <div className="text-white/70 text-sm">No trips yet. Create one above.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {trips.map((t) => (
                <div key={t.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-sm text-white/60">{t.destination}</div>
                  <div className="text-xs text-white/50 mt-2">
                    {String(t.startDate).slice(0, 10)} → {String(t.endDate).slice(0, 10)}
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    Budget: {t.budgetTotal ? `${t.budgetTotal} ${t.budgetCurrency}` : "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

