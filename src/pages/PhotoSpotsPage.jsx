import React from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { MapView } from "../components/MapView";

export function PhotoSpotsPage() {
  const [city, setCity] = React.useState("Paris");
  const [spots, setSpots] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  async function search() {
    setLoading(true);
    try {
      const r = await api.get("/photo-spots", { params: { city } });
      setSpots(r.data.spots ?? []);
    } catch (err) {
      console.error("Failed to load photo spots", err);
      setSpots([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markers = spots
    .filter((s) => s.latitude != null && s.longitude != null)
    .map((s) => ({
      key: s.id,
      lat: s.latitude,
      lng: s.longitude,
      title: s.name,
      subtitle: s.city,
    }));

  return (
    <div className="space-y-5">
      <div>
        <div className="text-2xl font-semibold">AI Photo Spot Finder</div>
        <div className="text-white/60 text-sm">
          Best photography locations per city with sample images and map pins. (Seeded examples included.)
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Search city</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Tokyo" />
              <Button variant="secondary" onClick={search} disabled={loading} className="shrink-0">
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
            <div className="text-xs text-white/60 mt-3">
              Tip: add latitude/longitude to spots to see pins (schema supports it).
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spots</CardTitle>
          </CardHeader>
          <CardContent>
            {spots.length === 0 ? (
              <div className="text-sm text-white/60">No spots found for this city.</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {spots.map((s) => (
                  <div key={s.id} className="rounded-2xl border border-white/10 bg-black/10 overflow-hidden">
                    {s.sampleImageUrl ? (
                      <img
                        src={s.sampleImageUrl}
                        alt={s.name}
                        className="w-full h-[140px] object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-[140px] bg-white/5" />
                    )}
                    <div className="p-3">
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-sm text-white/60">{s.description ?? "Photogenic location"}</div>
                      <div className="text-xs text-white/50 mt-2">{s.city}</div>
                    </div>
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

