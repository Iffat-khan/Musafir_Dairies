import React from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";

export function JournalPage() {
  const [trips, setTrips] = React.useState([]);
  const [tripId, setTripId] = React.useState("");
  const [entries, setEntries] = React.useState([]);

  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = React.useState("");
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState("");
  const [story, setStory] = React.useState(null);

  React.useEffect(() => {
    api
      .get("/trips")
      .then((r) => {
        const list = r.data.trips ?? [];
        setTrips(list);
        if (list[0] && !tripId) setTripId(list[0].id);
      })
      .catch((err) => {
        console.error("Failed to load trips for journal", err);
        setTrips([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    if (!tripId) return;
    try {
      const r = await api.get("/journal", { params: { tripId } });
      setEntries(r.data.entries ?? []);
    } catch (err) {
      console.error("Failed to load journal entries", err);
      setEntries([]);
    }
  }

  React.useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  return (
    <div className="space-y-5">
      <div>
        <div className="text-2xl font-semibold">Trip Memory Journal</div>
        <div className="text-white/60 text-sm">
          Upload photos, write notes, and generate a trip summary story.
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select trip</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-2">
            <select
              className="w-full md:w-[520px] rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white"
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
            <Button variant="secondary" onClick={refresh} disabled={!tripId}>
              Refresh
            </Button>
            <Button
              onClick={async () => {
                if (!tripId) return;
                try {
                  const r = await api.post("/ai/trip-story", { tripId });
                  setStory(r.data);
                } catch (err) {
                  console.error("Failed to generate trip story", err);
                  setStory(null);
                }
              }}
              disabled={!tripId}
            >
              Generate story
            </Button>
          </div>
        </CardContent>
      </Card>

      {story ? (
        <Card>
          <CardHeader>
            <CardTitle>{story.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-white/75 whitespace-pre-wrap">{story.story}</div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <Card>
          <CardHeader>
            <CardTitle>New entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                try {
                  const r = await api.post("/journal", { tripId, date, title, note });
                  setTitle("");
                  setNote("");
                  await refresh();
                  // Upload photos later by entry id (simple MVP)
                  return r.data.entry;
                } catch {
                  setError("Could not create entry.");
                }
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-white/60 mb-1">Date</div>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-1">Title</div>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sunset by the river" />
                </div>
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Notes</div>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What happened today? Favorite moment? Food?" />
              </div>
              {error ? <div className="text-sm text-rose-300">{error}</div> : null}
              <Button className="w-full" disabled={!tripId}>
                Save entry
              </Button>
              <div className="text-xs text-white/60">
                Photo uploads are supported in the backend (`POST /api/journal/:entryId/photos`) and served from `/uploads/...`.
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <div className="text-sm text-white/60">No entries yet.</div>
            ) : (
              <div className="space-y-2">
                {entries.map((e) => (
                  <div key={e.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <div className="font-semibold">{e.title}</div>
                    <div className="text-xs text-white/50">{String(e.date).slice(0, 10)}</div>
                    <div className="text-sm text-white/70 mt-2 whitespace-pre-wrap">{e.note}</div>
                    {e.photos?.length ? (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {e.photos.slice(0, 6).map((p) => (
                          <img
                            key={p.id}
                            src={p.url}
                            alt={p.caption ?? "photo"}
                            className="w-full h-[80px] object-cover rounded-xl border border-white/10"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

