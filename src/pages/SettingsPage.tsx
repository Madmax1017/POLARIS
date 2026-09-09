import React from 'react';
import { useNetworkStore } from '../stores/useNetworkStore';
import { useThemeStore } from '../stores/useThemeStore';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Cloud,
  Database,
  Sliders,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    isOnline,
    syncQueue,
    lastSyncTime,
    isSyncing,
    toggleNetwork
  } = useNetworkStore();

  const { theme, preference, setThemePreference } = useThemeStore();

  return (
    <div className="space-y-6 font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center">
          <Wifi className="w-5 h-5 mr-2 text-[var(--polar-cyan)]" /> Station Profile & Settings
        </h2>
        <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
          Theme preferences, satellite connectivity windows, local offline queues & low-bandwidth sync engines.
        </p>
      </div>

      {/* THEME PREFERENCE SELECTOR CARD */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-6 shadow-2xs space-y-4 text-[var(--text-primary)] font-sans">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div>
            <h3 className="font-bold text-sm text-[var(--text-primary)] uppercase tracking-wider flex items-center">
              <Moon className="w-4 h-4 mr-2 text-[var(--polar-cyan)]" /> Visual Theme & Display Mode
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Select your preferred visual appearance. Theme preference is saved locally across sessions.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-[var(--polar-cyan)]/10 text-[var(--polar-cyan)] border border-[var(--polar-cyan)]/30">
            ACTIVE: {theme.toUpperCase()} MODE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Light Theme Option */}
          <div
            onClick={() => setThemePreference('light')}
            className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 flex flex-col items-center text-center ${preference === 'light'
                ? 'bg-[var(--polar-cyan)]/10 border-[var(--polar-cyan)] shadow-2xs ring-1 ring-[var(--polar-cyan)]'
                : 'bg-[var(--surface-elevated)] border-[var(--border-subtle)] hover:border-[var(--border-primary)]'
              }`}
          >
            <div className={`p-3 rounded-full ${preference === 'light' ? 'bg-[var(--polar-cyan)] text-slate-950' : 'bg-[var(--surface-input)] text-[var(--text-secondary)]'}`}>
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-sm text-[var(--text-primary)]">Light Mode</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">High clarity for bright day operations</p>
            </div>
          </div>

          {/* Dark Theme Option */}
          <div
            onClick={() => setThemePreference('dark')}
            className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 flex flex-col items-center text-center ${preference === 'dark'
                ? 'bg-[var(--polar-cyan)]/10 border-[var(--polar-cyan)] shadow-2xs ring-1 ring-[var(--polar-cyan)]'
                : 'bg-[var(--surface-elevated)] border-[var(--border-subtle)] hover:border-[var(--border-primary)]'
              }`}
          >
            <div className={`p-3 rounded-full ${preference === 'dark' ? 'bg-[var(--polar-cyan)] text-slate-950' : 'bg-[var(--surface-input)] text-[var(--text-secondary)]'}`}>
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-sm text-[var(--text-primary)]">Polar Night (Dark)</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Deep contrast Mission Control UI</p>
            </div>
          </div>

          {/* System Theme Option */}
          <div
            onClick={() => setThemePreference('system')}
            className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 flex flex-col items-center text-center ${preference === 'system'
                ? 'bg-[var(--polar-cyan)]/10 border-[var(--polar-cyan)] shadow-2xs ring-1 ring-[var(--polar-cyan)]'
                : 'bg-[var(--surface-elevated)] border-[var(--border-subtle)] hover:border-[var(--border-primary)]'
              }`}
          >
            <div className={`p-3 rounded-full ${preference === 'system' ? 'bg-[var(--polar-cyan)] text-slate-950' : 'bg-[var(--surface-input)] text-[var(--text-secondary)]'}`}>
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-sm text-[var(--text-primary)]">System Match</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Sync with OS system preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* SYNC PANEL & DEMO CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection & Sync Status Panel */}
        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-6 shadow-2xs space-y-5 text-[var(--text-primary)] font-sans">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="font-bold text-sm text-[var(--text-primary)] uppercase tracking-wider flex items-center">
              <Cloud className="w-4 h-4 mr-2 text-[var(--polar-cyan)]" /> Satellite Link & Data Sync Status
            </h3>
            {isOnline ? (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                LINK ACTIVE
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                LOCAL MODE
              </span>
            )}
          </div>

          <div className="space-y-2.5 text-xs font-sans">
            <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] flex justify-between items-center">
              <span className="text-[var(--text-secondary)] font-medium">Connection Status:</span>
              <strong className={isOnline ? 'text-emerald-500 font-semibold' : 'text-amber-500 font-semibold'}>
                {isOnline ? 'ONLINE — SAT-LINK' : 'OFFLINE — LOCAL MODE'}
              </strong>
            </div>

            <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] flex justify-between items-center">
              <span className="text-[var(--text-secondary)] font-medium">Last Sync:</span>
              <span className="text-[var(--text-primary)] font-semibold font-mono">{lastSyncTime}</span>
            </div>

            <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] flex justify-between items-center">
              <span className="text-[var(--text-secondary)] font-medium">Queued Operations:</span>
              <span className={`font-semibold font-mono ${syncQueue.length > 0 ? 'text-amber-500' : 'text-[var(--text-primary)]'}`}>
                {syncQueue.length} Operation(s)
              </span>
            </div>

            <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] flex justify-between items-center">
              <span className="text-[var(--text-secondary)] font-medium">Sync Status:</span>
              <span className={`font-semibold ${isOnline ? 'text-emerald-500' : 'text-amber-500'}`}>
                {isSyncing
                  ? 'SYNCHRONIZING...'
                  : syncQueue.length === 0
                    ? 'ALL DATA SYNCHRONIZED'
                    : 'LOCAL OFFLINE QUEUE ACTIVE'}
              </span>
            </div>
          </div>

          {/* DEMO BUTTONS */}
          <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row gap-3">
            {isOnline ? (
              <button
                onClick={toggleNetwork}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-sans text-xs font-semibold shadow-2xs flex items-center justify-center space-x-2 cursor-pointer transition-colors"
              >
                <WifiOff className="w-4 h-4" />
                <span>SIMULATE OFFLINE MODE</span>
              </button>
            ) : (
              <button
                onClick={toggleNetwork}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-bold tracking-wide shadow-2xs flex items-center justify-center space-x-2 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>RESTORE CONNECTION & SYNC</span>
              </button>
            )}
          </div>
        </div>

        {/* Station Risk Profile Switcher */}
        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-6 shadow-2xs space-y-4 text-[var(--text-primary)] font-sans">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="font-bold text-sm text-[var(--text-primary)] uppercase tracking-wider flex items-center">
              <Sliders className="w-4 h-4 mr-2 text-[var(--polar-cyan)]" /> Station Risk Profile Switch
            </h3>
            <span className="text-xs text-[var(--polar-cyan)] font-semibold">Context Adaptive UI</span>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            POLARIS dynamically adapts features based on station profile. Antarctic stations emphasize total winter isolation features; Himadri (Arctic) emphasizes regular flight access and high bandwidth.
          </p>

          <div className="space-y-2 text-xs">
            <label className="block p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-primary)] cursor-pointer flex items-center justify-between transition-colors">
              <div>
                <p className="font-bold text-[var(--text-primary)]">Antarctic Profile (Maitri / Bharati)</p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Total winter cutoff, satellite-only sync, dead-man's-switch priority</p>
              </div>
              <input type="radio" name="profile" defaultChecked className="accent-[var(--polar-cyan)] h-4 w-4" />
            </label>

            <label className="block p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-primary)] cursor-pointer flex items-center justify-between transition-colors">
              <div>
                <p className="font-bold text-[var(--text-primary)]">Arctic Profile (Himadri)</p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Regular flight access, high bandwidth, seasonal flight logistics</p>
              </div>
              <input type="radio" name="profile" className="accent-[var(--polar-cyan)] h-4 w-4" />
            </label>
          </div>
        </div>
      </div>

      {/* QUEUED OPERATIONS LEDGER */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-6 shadow-2xs space-y-4 text-[var(--text-primary)] font-sans">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <h3 className="font-bold text-sm text-[var(--text-primary)] uppercase tracking-wider flex items-center">
            <Database className="w-4 h-4 mr-2 text-[var(--polar-cyan)]" /> Local Offline Queue Ledger ({syncQueue.length})
          </h3>
          <span className="text-xs text-[var(--polar-cyan)] font-medium">Stored in IndexedDB / LocalStorage</span>
        </div>

        {syncQueue.length > 0 ? (
          <div className="space-y-2.5">
            {syncQueue.map((item) => (
              <div key={item.id} className="p-3.5 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 font-semibold text-[10px]">
                      {item.type}
                    </span>
                    <span className="font-bold text-[var(--text-primary)]">{item.title}</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{item.details}</p>
                </div>
                <span className="text-xs text-[var(--text-secondary)] font-mono">{new Date(item.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-[var(--text-secondary)] text-xs bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)]">
            No pending operations in local queue. All station telemetry is synchronized with base command.
          </div>
        )}
      </div>
    </div>
  );
};
