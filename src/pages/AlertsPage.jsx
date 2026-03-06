import React from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export function AlertsPage() {
  const [alerts, setAlerts] = React.useState([]);
  const [status, setStatus] = React.useState("disconnected");

  async function refresh() {
    try {
      const r = await api.get("/alerts");
      setAlerts(r.data.alerts ?? []);
    } catch (err) {
      console.error("Failed to load alerts", err);
      setAlerts([]);
    }
  }

  React.useEffect(() => {
    refresh();

    // Server-Sent Events stream for real-time alerts
    let es;
    try {
      es = new EventSource("/api/alerts/stream", { withCredentials: true });
      setStatus("connecting");

      es.addEventListener("hello", () => setStatus("connected"));
      es.addEventListener("alert", (evt) => {
        try {
          const data = JSON.parse(evt.data);
          setAlerts((prev) => [data, ...prev].slice(0, 150));
        } catch {
          // ignore
        }
      });
      es.onerror = () => setStatus("disconnected");
    } catch (err) {
      console.error("Failed to open alerts stream", err);
      setStatus("disconnected");
    }

    return () => es && es.close();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <div className="text-2xl font-semibold">Real-Time Travel Alerts</div>
        <div className="text-white/60 text-sm">
          Live weather notifications (SSE). Flight delays and safety alerts are scaffolded as “kinds” in the database.
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <span>Alerts</span>
            <div className="flex items-center gap-2">
              <div className="text-xs text-white/60">Stream: {status}</div>
              <Button variant="secondary" onClick={refresh}>
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-sm text-white/60">
              No alerts yet. Create a trip (with geocoding) and keep the app open—weather updates are generated periodically.
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((a) => (
                <div key={a.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-sm text-white/70 mt-1">{a.body}</div>
                  <div className="text-xs text-white/50 mt-2">
                    {a.kind} · {a.severity} · {String(a.createdAt).slice(0, 19).replace("T", " ")}
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

