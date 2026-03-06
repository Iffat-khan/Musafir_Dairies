import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./components/RequireAuth";
import { SidebarLayout } from "./components/layout/SidebarLayout";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TripsPage } from "./pages/TripsPage";
import { PlannerPage } from "./pages/PlannerPage";
import { HiddenGemsPage } from "./pages/HiddenGemsPage";
import { BudgetPage } from "./pages/BudgetPage";
import { CompanionsPage } from "./pages/CompanionsPage";
import { PackingPage } from "./pages/PackingPage";
import { AlertsPage } from "./pages/AlertsPage";
import { PhotoSpotsPage } from "./pages/PhotoSpotsPage";
import { JournalPage } from "./pages/JournalPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          element={
            <RequireAuth>
              <SidebarLayout />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/gems" element={<HiddenGemsPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/companions" element={<CompanionsPage />} />
          <Route path="/packing" element={<PackingPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/photo-spots" element={<PhotoSpotsPage />} />
          <Route path="/journal" element={<JournalPage />} />
        </Route>

        <Route path="*" element={<div className="p-8">Not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
