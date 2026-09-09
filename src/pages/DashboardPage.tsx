import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MOCK_STATIONS,
  MOCK_INVENTORY,
  MOCK_EXPEDITIONS,
  MOCK_ALERTS,
  MOCK_USERS
} from '../data/mockData';
import { UserProfile } from '../types';
import { useNetworkStore } from '../stores/useNetworkStore';
import {
  ShieldAlert,
  Package,
  Compass,
  ArrowUpRight,
  Activity,
  Cpu
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const raw = localStorage.getItem('polaris_current_user');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // ignore
    }
    return MOCK_USERS[3];
  });

  const { isOnline, syncQueue, lastSyncTime } = useNetworkStore();

  useEffect(() => {
    const handleStorage = () => {
      try {
        const raw = localStorage.getItem('polaris_current_user');
        if (raw) setCurrentUser(JSON.parse(raw));
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const totalHeadcount = MOCK_STATIONS.reduce((acc, s) => acc + s.headcount, 0);
  const activeExpeditionsCount = MOCK_EXPEDITIONS.filter(e => e.status === 'ON_SCHEDULE' || e.status === 'WEATHER_DELAY').length;
  const activeAlertsCount = MOCK_ALERTS.length;

  return (
    <div className="space-y-6 font-sans text-[var(--text-primary)] text-sm">
      {/* TOP GREETING & CONTEXT HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-5 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Good evening, {currentUser.name.split(' ')[0] === 'Dr.' ? currentUser.name : currentUser.name.split(' ')[0]}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
            POLAR operations overview • Station assignment: <strong className="text-[var(--text-primary)]">{currentUser.stationId.toUpperCase()}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span className="font-semibold text-[var(--text-primary)]">
              {isOnline ? 'ONLINE (SAT-LINK)' : `OFFLINE (${syncQueue.length} QUEUED)`}
            </span>
            <span className="text-[var(--text-muted)]">•</span>
            <span className="text-[var(--text-secondary)]">Sync: {lastSyncTime}</span>
          </div>

          <select
            value={currentUser.email}
            onChange={(e) => {
              const matched = MOCK_USERS.find(u => u.email === e.target.value);
              if (matched) {
                setCurrentUser(matched);
                localStorage.setItem('polaris_current_user', JSON.stringify(matched));
              }
            }}
            className="bg-[var(--surface-input)] border border-[var(--border-primary)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] font-semibold focus:outline-none focus:border-[var(--polar-cyan)] cursor-pointer shadow-2xs"
          >
            {MOCK_USERS.map(u => (
              <option key={u.id} value={u.email} className="bg-[var(--surface-primary)] text-[var(--text-primary)]">
                Role View: {u.role} ({u.name.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* COMPACT OVERVIEW METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">Active Stations</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-[var(--text-primary)]">{MOCK_STATIONS.length}</span>
            <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              4 Operational
            </span>
          </div>
        </div>

        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">Personnel</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-[var(--text-primary)]">{totalHeadcount}</span>
            <span className="text-xs text-[var(--text-secondary)] font-medium">Active Duty</span>
          </div>
        </div>

        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">Active Expeditions</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-[var(--text-primary)]">{activeExpeditionsCount}</span>
            <span className="text-xs font-semibold text-[var(--polar-cyan)] bg-[var(--polar-cyan)]/10 px-2 py-0.5 rounded-full border border-[var(--polar-cyan)]/20">
              On Schedule
            </span>
          </div>
        </div>

        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">Open Alerts</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-rose-500">{activeAlertsCount}</span>
            <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              1 Critical
            </span>
          </div>
        </div>
      </div>

      {/* STATION OVERVIEW TABLE */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div>
            <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center">
              <Activity className="w-4 h-4 mr-2 text-[var(--polar-cyan)]" /> Station Overview
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Real-time status and weather telemetry across Indian Polar Stations</p>
          </div>
          <span className="text-xs font-mono font-medium text-[var(--text-muted)]">4 Telemetry Nodes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border-primary)] text-[var(--text-secondary)] font-semibold bg-[var(--surface-elevated)]">
                <th className="py-2.5 px-3">STATION</th>
                <th className="py-2.5 px-3">REGION</th>
                <th className="py-2.5 px-3">PERSONNEL</th>
                <th className="py-2.5 px-3">TEMP</th>
                <th className="py-2.5 px-3">WIND</th>
                <th className="py-2.5 px-3">LAST TELEMETRY</th>
                <th className="py-2.5 px-3">LINK</th>
                <th className="py-2.5 px-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] font-medium text-[var(--text-secondary)]">
              {MOCK_STATIONS.map((station) => (
                <tr key={station.id} className="hover:bg-[var(--surface-elevated)] transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-[var(--text-primary)]">{station.name}</span>
                    <span className="ml-2 font-mono text-[11px] text-[var(--polar-cyan)] font-semibold">{station.code}</span>
                  </td>
                  <td className="py-3 px-3 text-[var(--text-secondary)]">{station.region}</td>
                  <td className="py-3 px-3">
                    <strong className="text-[var(--text-primary)]">{station.headcount}</strong> / <span className="text-[var(--text-muted)]">{station.maxCapacity}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-[var(--text-primary)]">{station.temperature}</td>
                  <td className="py-3 px-3 text-[var(--text-secondary)]">{station.windSpeed}</td>
                  <td className="py-3 px-3 text-[var(--text-muted)] font-mono">{station.lastSync.split(' ')[0]}</td>
                  <td className="py-3 px-3 text-[var(--text-secondary)] font-mono">
                    {station.id === 'ncpor-goa' ? 'FIBER' : station.id === 'himadri' ? 'FIB-OPT' : 'SAT-LINK'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${station.status === 'OPTIMAL'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                        }`}
                    >
                      {station.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TWO BALANCED SECTIONS: ACTIVE ALERTS & RESOURCE RISK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: ACTIVE ALERTS */}
        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center">
              <ShieldAlert className="w-4 h-4 mr-2 text-rose-500" /> Active Incidents & Safety Alerts
            </h3>
            <Link to="/alerts" className="text-xs font-semibold text-[var(--polar-cyan)] hover:underline flex items-center">
              View All Alerts <ArrowUpRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {MOCK_ALERTS.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-colors ${alert.severity === 'CRITICAL'
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${alert.severity === 'CRITICAL'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-white'
                        }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="font-bold text-[var(--text-primary)] text-xs">{alert.type}</span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] font-mono">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[var(--text-primary)] mt-2">{alert.personnelName}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Location: {alert.location}</p>
                <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex justify-between items-center text-xs">
                  <span className="text-[var(--text-muted)] font-mono">Status: <strong className="text-[var(--text-primary)]">{alert.status}</strong></span>
                  <Link to="/alerts" className="text-[var(--polar-cyan)] hover:underline font-semibold text-xs">
                    Take Action &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: RESOURCE RISK */}
        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center">
              <Package className="w-4 h-4 mr-2 text-amber-500" /> Resource Risk & Depletion
            </h3>
            <Link to="/inventory" className="text-xs font-semibold text-[var(--polar-cyan)] hover:underline flex items-center">
              Manage Inventory <ArrowUpRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {MOCK_INVENTORY.slice(0, 3).map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-primary)] text-xs">{item.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${item.status === 'CRITICAL_LOW'
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                        : item.status === 'DEPLETING_FAST'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                      }`}
                  >
                    {item.daysRemaining} Days Left
                  </span>
                </div>
                <div className="w-full bg-[var(--surface-input)] rounded-full h-1.5">
                  <div
                    className={`h-full rounded-full ${item.status === 'CRITICAL_LOW'
                        ? 'bg-rose-500'
                        : item.status === 'DEPLETING_FAST'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    style={{ width: `${Math.min(100, (item.daysRemaining / 90) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)] pt-1 font-mono">
                  <span>Burn: {item.burnRatePerDay} {item.unit}/day</span>
                  <span>Stock: {item.currentStock.toLocaleString()} {item.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EXPEDITION ACTIVITY */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center">
            <Compass className="w-4 h-4 mr-2 text-[var(--polar-cyan)]" /> Expedition Activity
          </h3>
          <Link to="/expeditions" className="text-xs font-semibold text-[var(--polar-cyan)] hover:underline flex items-center">
            View All Expeditions <ArrowUpRight className="w-3 h-3 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_EXPEDITIONS.map((exp) => (
            <div key={exp.id} className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[var(--polar-cyan)]">{exp.code}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[var(--surface-input)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                  {exp.phase}
                </span>
              </div>
              <p className="font-bold text-[var(--text-primary)] text-xs mt-1">{exp.name}</p>
              <p className="text-xs text-[var(--text-secondary)]">Lead: {exp.leadScientist} • {exp.teamCount} Members</p>
              <p className="text-xs text-emerald-500 font-semibold pt-1">Status: {exp.status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* POLARIS AUTOMATION */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div>
            <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center">
              <Cpu className="w-4 h-4 mr-2 text-[var(--polar-cyan)]" /> POLARIS Smart Automation
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Automated rule-based logistics and safety enforcement</p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-[var(--polar-cyan)]/10 text-[var(--polar-cyan)] border border-[var(--polar-cyan)]/30">
            SYSTEM ENGINE ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Automation Item 1 */}
          <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--text-primary)] text-xs">Inventory Depletion Prediction</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                Action Required
              </span>
            </div>
            <div className="text-xs text-[var(--text-secondary)] space-y-1">
              <p><strong className="text-[var(--text-primary)]">Trigger:</strong> MRE stock projected below operational threshold</p>
              <p><strong className="text-[var(--text-primary)]">Action:</strong> Resupply recommendation generated for next vessel window</p>
            </div>
          </div>

          {/* Automation Item 2 */}
          <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--text-primary)] text-xs">Personnel Safety Escalation</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30">
                Escalated Incident
              </span>
            </div>
            <div className="text-xs text-[var(--text-secondary)] space-y-1">
              <p><strong className="text-[var(--text-primary)]">Trigger:</strong> Missed scheduled check-in window</p>
              <p><strong className="text-[var(--text-primary)]">Action:</strong> Deadman protocol escalation initiated to Station Leader & Command</p>
            </div>
          </div>

          {/* Automation Item 3 */}
          <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--text-primary)] text-xs">Offline Synchronization</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                Sync Ready
              </span>
            </div>
            <div className="text-xs text-[var(--text-secondary)] space-y-1">
              <p><strong className="text-[var(--text-primary)]">Trigger:</strong> Connection unavailable / satellite link closed</p>
              <p><strong className="text-[var(--text-primary)]">Action:</strong> Local operation queue activated; flushes automatically on reconnect</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
