import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
// @ts-expect-error - Intro is a JS component
import PolarisIntro from './pages/Intro';
import { LoginPage } from './pages/LoginPage';
import { CommanderDashboardPage } from './pages/CommanderDashboardPage';
import { ExpeditionsPage } from './pages/ExpeditionsPage';
import { MissionPlannerPage } from './pages/MissionPlannerPage';
import { MissionDetailPage } from './pages/MissionDetailPage';
import { PersonnelPage } from './pages/PersonnelPage';
import { InventoryPage } from './pages/InventoryPage';
import { LogisticsPage } from './pages/LogisticsPage';
import { MapPage } from './pages/MapPage';
import { AlertsPage } from './pages/AlertsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { CargoTrackingPage } from './pages/CargoTrackingPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PolarisIntro />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<CommanderDashboardPage />} />
          {/* Legacy redirect */}
          <Route path="/expeditions" element={<Navigate to="/missions" replace />} />
          {/* Mission routes */}
          <Route path="/missions" element={<ExpeditionsPage />} />
          <Route path="/missions/plan" element={<MissionPlannerPage />} />
          <Route path="/missions/:id" element={<MissionDetailPage />} />
          {/* Other sections */}
          <Route path="/personnel" element={<PersonnelPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/logistics" element={<LogisticsPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/logistics/track/:cargoId" element={<CargoTrackingPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
