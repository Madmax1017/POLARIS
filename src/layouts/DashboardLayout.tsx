import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Users,
  Package,
  Truck,
  Globe,
  ShieldAlert,
  FileBarChart,
  Settings,
  Bell,
  Wifi,
  WifiOff,
  Radio,
  ChevronDown,
  LogOut,
  Menu,
  X,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { MOCK_STATIONS, MOCK_ALERTS } from '../data/mockData';
import { StationId } from '../types';
import { useAuthStore } from '../stores/useAuthStore';
import { useNetworkStore } from '../stores/useNetworkStore';
import { ThemeToggle } from '../components/ThemeToggle';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Expeditions', path: '/expeditions', icon: Compass },
  { name: 'Personnel', path: '/personnel', icon: Users },
  { name: 'Inventory', path: '/inventory', icon: Package },
  { name: 'Logistics & Cargo', path: '/logistics', icon: Truck },
  { name: 'Operations Map', path: '/map', icon: Globe },
  { name: 'Alerts & Safety', path: '/alerts', icon: ShieldAlert, badge: MOCK_ALERTS.length },
  { name: 'Analytics Reports', path: '/reports', icon: FileBarChart },
  { name: 'Settings & Sync', path: '/settings', icon: Settings },
];

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const {
    isOnline,
    syncQueue,
    isSyncing,
    syncMessage,
    toggleNetwork
  } = useNetworkStore();

  const [selectedStation, setSelectedStation] = useState<StationId>(user?.stationId || 'ncpor-goa');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (user?.stationId) {
      setSelectedStation(user.stationId);
    }
  }, [user]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  const activeNav = NAV_ITEMS.find(item => item.path === location.pathname) || NAV_ITEMS[0];
  const activeStationObj = MOCK_STATIONS.find(s => s.id === selectedStation) || MOCK_STATIONS[3];

  const currentUser = user || {
    name: 'Dr. Rajesh Verma',
    roleDisplayName: 'NCPOR Command',
    role: 'NCPOR_COMMAND',
    email: 'command@polaris.res.in',
    clearanceLevel: 'ALPHA',
    avatarInitials: 'RV',
    stationId: 'ncpor-goa' as StationId,
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans flex flex-col md:flex-row antialiased selection:bg-[var(--polar-cyan)] selection:text-slate-950 transition-colors duration-200 polaris-grid-bg">
      {/* Sync Message Banner */}
      {syncMessage && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--polar-cyan)] text-[var(--text-primary)] font-mono text-xs font-bold shadow-xl flex items-center space-x-2 animate-bounce">
          {isSyncing ? (
            <RefreshCw className="w-4 h-4 animate-spin text-[var(--polar-cyan)]" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          )}
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[var(--surface-primary)] border-b border-[var(--border-primary)] z-50 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)]"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-primary)] flex items-center justify-center font-bold text-[var(--polar-cyan)]">
              P
            </div>
            <span className="font-bold tracking-wider text-[var(--text-primary)] text-lg font-mono">POLARIS</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          {isOnline ? (
            <span className="flex items-center px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
              <span className="w-2 h-2 rounded-full bg-[var(--status-success)] mr-1.5"></span>
              ONLINE
            </span>
          ) : (
            <span className="flex items-center px-2.5 py-1 rounded-full text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium">
              <span className="w-2 h-2 rounded-full bg-[var(--status-warning)] mr-1.5"></span>
              OFFLINE
            </span>
          )}
        </div>
      </div>

      {/* Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-primary)] transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static flex flex-col justify-between shadow-xs ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div>
          {/* POLARIS Logo Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-[var(--border-primary)]">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--polar-cyan)] font-extrabold text-lg group-hover:border-[var(--polar-cyan)] transition-colors">
                <Radio className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold tracking-widest text-base text-[var(--text-primary)] font-mono leading-none">
                  POLARIS
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-semibold tracking-wider font-mono mt-1">
                  NCPOR POLAR OPERATIONS
                </span>
              </div>
            </Link>
          </div>

          {/* Station Telemetry Node Selector */}
          <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--surface-primary)]">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block mb-1.5 flex items-center justify-between font-medium">
              <span>Active Telemetry Node</span>
              <span className="text-[var(--polar-cyan)] font-semibold">{activeStationObj.region}</span>
            </label>
            <div className="relative">
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value as StationId)}
                className="w-full bg-[var(--surface-input)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[var(--polar-cyan)] appearance-none cursor-pointer pr-8 font-mono shadow-2xs"
              >
                {MOCK_STATIONS.map((station) => (
                  <option key={station.id} value={station.id} className="bg-[var(--surface-primary)] text-[var(--text-primary)]">
                    {station.name} ({station.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[var(--text-muted)] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-[var(--text-secondary)] bg-[var(--surface-elevated)] rounded px-2.5 py-1.5 border border-[var(--border-subtle)] shadow-2xs">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--polar-cyan)]"></span>
                <span>Temp: <strong>{activeStationObj.temperature}</strong></span>
              </span>
              <span>Wind: {activeStationObj.windSpeed}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-mono tracking-wider transition-all ${isActive
                    ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)] border-l-2 border-[var(--polar-cyan)] font-bold shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--polar-cyan)]' : 'text-[var(--text-muted)]'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge ? (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Current User & Logout */}
        <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--surface-primary)]">
          <div className="flex items-center justify-between bg-[var(--surface-elevated)] rounded-xl p-3 border border-[var(--border-primary)] shadow-2xs">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[var(--surface-input)] border border-[var(--border-primary)] text-[var(--polar-cyan)] font-bold text-xs flex items-center justify-center shrink-0 font-mono">
                {currentUser.avatarInitials}
              </div>
              <div className="truncate text-left">
                <p className="text-xs font-bold text-[var(--text-primary)] truncate">{currentUser.name}</p>
                <p className="text-[10px] text-[var(--polar-cyan)] font-semibold font-mono truncate">{currentUser.roleDisplayName}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-400 transition-colors shrink-0 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-[var(--surface-primary)] border-b border-[var(--border-primary)] px-6 flex items-center justify-between z-30 sticky top-0 shadow-2xs">
          {/* Page Title & Subtitle */}
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-base font-bold text-[var(--text-primary)] flex items-center space-x-2">
                <span>{activeNav.name}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                  {activeStationObj.code}
                </span>
              </h1>
              <p className="text-xs text-[var(--text-muted)] font-mono hidden sm:block">
                Station Mode: {activeStationObj.riskProfile} | 10 Sep 2026 · 00:43 IST
              </p>
            </div>
          </div>

          {/* Right Header Status & Connectivity Controls */}
          <div className="flex items-center space-x-3">
            {/* Connectivity Demo Buttons */}
            {isOnline ? (
              <button
                onClick={toggleNetwork}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors"
                title="Simulate offline mode"
              >
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Simulate Offline</span>
              </button>
            ) : (
              <button
                onClick={toggleNetwork}
                className="px-2.5 py-1 rounded-lg bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] font-mono text-[11px] font-bold flex items-center space-x-1.5 cursor-pointer transition-colors shadow-xs"
                title="Restore connection and sync local queue"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restore Link & Sync</span>
              </button>
            )}

            {/* Global Connectivity Indicator */}
            {isOnline ? (
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium">
                <span className="w-2 h-2 rounded-full bg-[var(--status-success)]"></span>
                <span>● ONLINE — SAT-LINK</span>
                <Wifi className="w-3.5 h-3.5 ml-1 text-emerald-400" />
              </div>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-medium">
                <span className="w-2 h-2 rounded-full bg-[var(--status-warning)]"></span>
                <span>● OFFLINE — LOCAL MODE</span>
                {syncQueue.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 font-bold text-[10px]">
                    {syncQueue.length} QUEUED
                  </span>
                )}
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              </div>
            )}

            {/* Global Theme Toggle Button */}
            <ThemeToggle />

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border-subtle)] transition-colors relative cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center font-mono">
                  {MOCK_ALERTS.length}
                </span>
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl shadow-xl z-50 p-4 font-sans text-[var(--text-primary)]">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border-subtle)]">
                    <span className="text-xs font-bold text-[var(--text-primary)] font-mono uppercase tracking-wider">
                      Command Notifications ({MOCK_ALERTS.length})
                    </span>
                    <Link
                      to="/alerts"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[11px] text-[var(--polar-cyan)] hover:underline"
                    >
                      View All Alerts
                    </Link>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {MOCK_ALERTS.map((alert) => (
                      <div
                        key={alert.id}
                        className="p-2.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-primary)] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-400 flex items-center font-mono">
                            <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                            {alert.type}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--text-muted)]">
                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-primary)] mt-1 font-medium">{alert.personnelName}</p>
                        <p className="text-[11px] text-[var(--text-secondary)] font-mono mt-0.5">{alert.location}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Menu Header Area */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 px-2 py-1 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-primary)] flex items-center justify-center font-bold text-xs text-[var(--polar-cyan)] font-mono">
                  {currentUser.avatarInitials}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-[var(--polar-cyan)] font-mono leading-tight">{currentUser.roleDisplayName}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] ml-1" />
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl shadow-xl z-50 p-2 text-sm">
                  <div className="px-3 py-2 border-b border-[var(--border-subtle)] mb-1">
                    <p className="text-xs font-bold text-[var(--text-primary)]">{currentUser.name}</p>
                    <p className="text-[11px] text-[var(--polar-cyan)] font-mono font-semibold">{currentUser.roleDisplayName}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono mt-0.5">{currentUser.email}</p>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <span className="inline-block px-1.5 py-0.5 text-[9px] font-mono rounded bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                        CLEARANCE: {currentUser.clearanceLevel}
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] text-xs font-mono"
                  >
                    <Settings className="w-4 h-4 text-[var(--text-muted)]" />
                    <span>Settings & Sync</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 text-xs font-mono cursor-pointer text-left font-medium"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
