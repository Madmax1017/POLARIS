import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
// @ts-expect-error - Intro is a JS component
import PolarisIntro from './pages/Intro';
import { LoginPage } from './pages/LoginPage';
import { CommanderDashboardPage } from './pages/CommanderDashboardPage';
import { ExpeditionsPage } from './pages/ExpeditionsPage';
import { PersonnelPage } from './pages/PersonnelPage';
import { InventoryPage } from './pages/InventoryPage';
import { LogisticsPage } from './pages/LogisticsPage';
import { MapPage } from './pages/MapPage';
import { AlertsPage } from './pages/AlertsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Intro Page as root entry point */}
        <Route path="/" element={<PolarisIntro />} />

        {/* Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard Layout Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<CommanderDashboardPage />} />
          <Route path="/expeditions" element={<ExpeditionsPage />} />
          <Route path="/personnel" element={<PersonnelPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/logistics" element={<LogisticsPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback Catch-all -> Root Intro */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
