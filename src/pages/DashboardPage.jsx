import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Sparkles, Gem, Wallet, Users, Backpack, Bell, Camera, BookOpen, CalendarRange } from "lucide-react";

const tiles = [
  { to: "/trips", title: "Trips", desc: "Create trips, store history, manage dates & interests.", icon: CalendarRange },
  { to: "/planner", title: "AI Travel Planner", desc: "Generate day-wise itinerary + hotels + estimated budget.", icon: Sparkles },
  { to: "/gems", title: "Hidden Gems Finder", desc: "Discover & submit lesser-known places recommended by locals.", icon: Gem },
  { to: "/budget", title: "Budget Tracker", desc: "Track daily expenses and see category breakdown.", icon: Wallet },
  { to: "/companions", title: "Companion Finder", desc: "Find travelers with similar destination/dates + chat.", icon: Users },
  { to: "/packing", title: "Smart Packing", desc: "Packing lists based on destination, weather, duration.", icon: Backpack },
  { to: "/alerts", title: "Real-time Alerts", desc: "Live weather updates (SSE) + stubs for flight/safety.", icon: Bell },
  { to: "/photo-spots", title: "AI Photo Spots", desc: "Photogenic locations with sample images + map pins.", icon: Camera },
  { to: "/journal", title: "Trip Journal", desc: "Upload photos, write notes, generate a summary story.", icon: BookOpen },
];

export function DashboardPage() {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-2xl font-semibold">Dashboard</div>
        <div className="text-white/60 text-sm">
          Everything you need for planning, tracking, and remembering your trips.
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <Link key={t.to} to={t.to} className="group">
              <Card className="h-full hover:bg-white/[0.06] transition">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-2xl bg-indigo-500/15 border border-indigo-400/20 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-indigo-200" />
                    </span>
                    {t.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-white/70">{t.desc}</div>
                  <div className="text-sm text-indigo-300 mt-3 group-hover:text-indigo-200">
                    Open →
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

