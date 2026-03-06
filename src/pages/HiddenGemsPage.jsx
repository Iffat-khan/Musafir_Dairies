import React from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { MapView } from "../components/MapView";

export function HiddenGemsPage() {
  const [city, setCity] = React.useState("Lisbon");
  const [gems, setGems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [tags, setTags] = React.useState("coffee, local");
  const [error, setError] = React.useState("");

  async function refresh() {
    setLoading(true);
    try {
      const r = await api.get("/gems", { params: { city } });
      setGems(r.data.gems ?? []);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markers = gems
    .filter((g) => g.latitude != null && g.longitude != null)
    .map((g) => ({
      key: g.id,
      lat: g.latitude,
      lng: g.longitude,
      title: g.name,
      subtitle: g.type,
    }));

  return (
    <div className="space-y-5">
      <div>
        <div className="text-2xl font-semibold">Hidden Gems Finder</div>
        <div className="text-white/60 text-sm">
          Explore lesser-known attractions, cafes, and viewpoints. Submit and review places recommended by locals.
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Discover</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City (e.g., Tokyo)" />
              <Button
                variant="secondary"
                onClick={() => refresh()}
                disabled={loading}
                className="shrink-0"
              >
                {loading ? "Loading..." : "Search"}
              </Button>
            </div>
            <div className="mt-4">
              <MapView
                center={markers[0] ? [markers[0].lat, markers[0].lng] : [48.8566, 2.3522]}
                markers={markers}
                height={320}
              />
            </div>
            <div className="mt-4 space-y-2">
              {gems.length === 0 ? (
                <div className="text-sm text-white/60">No gems yet for this city. Add one!</div>
              ) : (
                gems.map((g) => (
                  <div key={g.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <div className="font-semibold">{g.name}</div>
                    <div className="text-sm text-white/60 mt-1">{g.description}</div>
                    <div className="text-xs text-white/50 mt-2">
                      {g.city} · {g.type} · {g.reviews?.length ?? 0} reviews
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submit a hidden place</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                try {
                  await api.post("/gems", {
                    city,
                    name,
                    description,
                    tags: tags
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  });
                  setName("");
                  setDescription("");
                  await refresh();
                } catch {
                  setError("Could not submit. Please check fields.");
                }
              }}
            >
              <div>
                <div className="text-xs text-white/60 mb-1">City</div>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Place name</div>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="A tiny rooftop cafe" />
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Description</div>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Why is it special? What to try? Best time to go?" />
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Tags</div>
                <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="coffee, view, quiet" />
              </div>

              {error ? <div className="text-sm text-rose-300">{error}</div> : null}

              <Button className="w-full">Submit</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

