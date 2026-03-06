import React from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";

export function PlannerPage() {
  const [destination, setDestination] = React.useState("");
  const [budget, setBudget] = React.useState("1200");
  const [days, setDays] = React.useState("5");
  const [interests, setInterests] = React.useState("food, culture, photography");
  const [result, setResult] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  return (
    <div className="space-y-5">
      <div>
        <div className="text-2xl font-semibold">AI Travel Planner</div>
        <div className="text-white/60 text-sm">
          Enter destination, budget, days, interests → get a day-wise itinerary with hotels and estimated costs.
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Plan your trip</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                setBusy(true);
                setResult(null);
                try {
                  const r = await api.post("/ai/itinerary", {
                    destination,
                    budget: Number(budget),
                    days: Number(days),
                    interests: interests
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                    currency: "USD",
                  });
                  setResult(r.data);
                } catch {
                  setError("Could not generate itinerary. Check inputs.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <div>
                <div className="text-xs text-white/60 mb-1">Destination</div>
                <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Tokyo" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-white/60 mb-1">Budget (USD)</div>
                  <Input value={budget} onChange={(e) => setBudget(e.target.value)} inputMode="numeric" />
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-1">Days</div>
                  <Input value={days} onChange={(e) => setDays(e.target.value)} inputMode="numeric" />
                </div>
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Interests (comma-separated)</div>
                <Textarea value={interests} onChange={(e) => setInterests(e.target.value)} />
              </div>

              {error ? <div className="text-sm text-rose-300">{error}</div> : null}

              <Button className="w-full" disabled={busy}>
                {busy ? "Generating..." : "Generate itinerary"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="text-sm text-white/60">
                Your itinerary will appear here (day-wise places + hotel picks + estimated daily costs).
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-white/70">
                  Estimated total: <span className="text-white">{result.estTotal} {result.currency}</span>
                </div>
                <div className="space-y-3">
                  {result.days.map((d) => (
                    <div key={d.dayNumber} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                      <div className="font-semibold">{d.title}</div>
                      <div className="text-sm text-white/60 mt-1">{d.summary}</div>
                      <div className="text-xs text-white/50 mt-2">Est daily cost: {d.estDailyCost} {result.currency}</div>

                      <div className="mt-3 grid md:grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-white/60 mb-1">Places</div>
                          <ul className="text-sm text-white/75 space-y-1">
                            {d.places.map((p) => (
                              <li key={p.order}>
                                <span className="text-white">{p.name}</span>{" "}
                                <span className="text-white/50">({p.kind})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="text-xs text-white/60 mb-1">Hotels</div>
                          <ul className="text-sm text-white/75 space-y-1">
                            {d.hotels.map((h, idx) => (
                              <li key={idx}>
                                <span className="text-white">{h.name}</span>{" "}
                                <span className="text-white/50">· {h.neighborhood}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

