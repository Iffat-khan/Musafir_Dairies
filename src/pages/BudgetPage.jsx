import React from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const categories = ["TRANSPORT", "LODGING", "FOOD", "ACTIVITIES", "SHOPPING", "OTHER"];

export function BudgetPage() {
  const [trips, setTrips] = React.useState([]);
  const [tripId, setTripId] = React.useState("");
  const [summary, setSummary] = React.useState(null);

  const [amount, setAmount] = React.useState("");
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = React.useState("FOOD");
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    api
      .get("/trips")
      .then((r) => {
        const list = r.data.trips ?? [];
        setTrips(list);
        if (list[0] && !tripId) setTripId(list[0].id);
      })
      .catch((err) => {
        console.error("Failed to load trips for budget", err);
        setTrips([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!tripId) return;
    api
      .get(`/budget/${tripId}/summary`)
      .then((r) => setSummary(r.data))
      .catch((err) => {
        console.error("Failed to load budget summary", err);
        setSummary(null);
      });
  }, [tripId]);

  async function refreshSummary() {
    if (!tripId) return;
    try {
      const r = await api.get(`/budget/${tripId}/summary`);
      setSummary(r.data);
    } catch (err) {
      console.error("Failed to refresh budget summary", err);
      setSummary(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-2xl font-semibold">Budget Travel Tracker</div>
        <div className="text-white/60 text-sm">
          Set a trip budget, track expenses, and see spent vs remaining with category breakdown.
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select trip</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-2">
            <select
              className="w-full md:w-[420px] rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white"
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
            >
              <option value="" disabled>
                Choose a trip...
              </option>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} — {t.destination}
                </option>
              ))}
            </select>
            <Button variant="secondary" onClick={refreshSummary} disabled={!tripId}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {!summary ? (
              <div className="text-sm text-white/60">Pick a trip to see budget summary.</div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <div className="text-xs text-white/60">Budget</div>
                    <div className="text-lg font-semibold">
                      {summary.budgetTotal ?? "—"} {summary.currency}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <div className="text-xs text-white/60">Spent</div>
                    <div className="text-lg font-semibold">
                      {summary.spent} {summary.currency}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <div className="text-xs text-white/60">Remaining</div>
                    <div className="text-lg font-semibold">
                      {summary.remaining == null ? "—" : `${summary.remaining} ${summary.currency}`}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-white/60 mb-2">Breakdown</div>
                  <div className="space-y-2">
                    {Object.entries(summary.byCategory ?? {}).length === 0 ? (
                      <div className="text-sm text-white/60">No expenses yet.</div>
                    ) : (
                      Object.entries(summary.byCategory).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                          <div className="text-sm">{k}</div>
                          <div className="text-sm text-white/70">
                            {v} {summary.currency}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add expense</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                try {
                  await api.post("/budget/expense", {
                    tripId,
                    date,
                    amount: Number(amount),
                    category,
                    note: note || undefined,
                  });
                  setAmount("");
                  setNote("");
                  await refreshSummary();
                } catch {
                  setError("Could not add expense. Check the fields.");
                }
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-white/60 mb-1">Date</div>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-1">Amount</div>
                  <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" placeholder="25" />
                </div>
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Category</div>
                <select
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Note (optional)</div>
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Dinner near old town" />
              </div>
              {error ? <div className="text-sm text-rose-300">{error}</div> : null}
              <Button className="w-full" disabled={!tripId}>
                Add expense
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

