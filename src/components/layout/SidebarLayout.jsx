import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MapPinned,
  CalendarRange,
  Sparkles,
  Gem,
  Wallet,
  Users,
  Backpack,
  Bell,
  Camera,
  BookOpen,
  LogOut,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { useAuth } from "../../lib/auth";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/trips", label: "Trips", icon: CalendarRange },
  { to: "/planner", label: "AI Planner", icon: Sparkles },
  { to: "/gems", label: "Hidden Gems", icon: Gem },
  { to: "/budget", label: "Budget Tracker", icon: Wallet },
  { to: "/companions", label: "Companions", icon: Users },
  { to: "/packing", label: "Packing", icon: Backpack },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/photo-spots", label: "Photo Spots", icon: Camera },
  { to: "/journal", label: "Journal", icon: BookOpen },
];

export function SidebarLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-full flex">
      <aside className="w-[280px] hidden md:flex flex-col border-r border-white/10 bg-black/20">
        <div className="px-5 py-5 flex items-center gap-2 border-b border-white/10">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/20 flex items-center justify-center">
            <MapPinned className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <div className="font-semibold leading-tight">TravelOS</div>
            <div className="text-xs text-white/60">Smart trips, one hub</div>
          </div>
        </div>

        <nav className="p-3 flex-1 overflow-auto">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/80 hover:bg-white/10 transition",
                    isActive && "bg-white/10 text-white"
                  )
                }
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-white/60 mb-2">
            Signed in as <span className="text-white/90">{user?.displayName}</span>
          </div>
          <button
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1200px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

