import React from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export function PackingPage() {
  const [destination, setDestination] = React.useState("Reykjavik");
  const [days, setDays] = React.useState("6");
  const [style, setStyle] = React.useState("balanced");
  const [weatherSummary, setWeatherSummary] = React.useState("");
  const [result, setResult] = React.useState(null);
  const [busy, setBusy] = React.useState(false);

  return (
    <div className="space-y-5">
      <div>
        <div className="text-2xl font-semibold">Smart Packing Assistant</div>
        <div className="text-white/60 text-sm">
          Generate packing lists based on destination, weather, and trip duration.
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                  const r = await api.post("/ai/packing-list", {
                    destination,
                    days: Number(days),
                    style,
                    weatherSummary: weatherSummary || undefined,
                  });
                  setResult(r.data);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <div>
                <div className="text-xs text-white/60 mb-1">Destination</div>
                <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Paris" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-white/60 mb-1">Days</div>
                  <Input value={days} onChange={(e) => setDays(e.target.value)} inputMode="numeric" />
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-1">Style</div>
                  <select
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="balanced">Balanced</option>
                    <option value="prepared">Prepared</option>
                  </select>
                </div>
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Weather summary (optional)</div>
                <Input
                  value={weatherSummary}
                  onChange={(e) => setWeatherSummary(e.target.value)}
                  placeholder='Example: "Current temp 7°C, wind 30 km/h"'
                />
              </div>
              <Button className="w-full" disabled={busy}>
                {busy ? "Generating..." : "Generate packing list"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Packing list</CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="text-sm text-white/60">Your list will appear here.</div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-white/70">
                  Destination: <span className="text-white">{result.destination}</span> · Days:{" "}
                  <span className="text-white">{result.days}</span>
                </div>
                {result.weatherSummary ? (
                  <div className="text-sm text-white/60">Weather: {result.weatherSummary}</div>
                ) : null}
                <div className="space-y-2">
                  {result.items.map((it, idx) => (
                    <label key={idx} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                      <div className="min-w-0">
                        <div className="text-sm truncate">{it.label}</div>
                        <div className="text-xs text-white/50">{it.category}</div>
                      </div>
                      <div className="text-sm text-white/70">x{it.quantity}</div>
                    </label>
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

