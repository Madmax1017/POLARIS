import React, { useState } from 'react';
import { MOCK_PERSONNEL, MOCK_STATIONS } from '../data/mockData';
import { Personnel } from '../types';
import {
  Users,
  UserCheck,
  ShieldCheck,
  AlertOctagon,
  Clock,
  RotateCcw,
  WifiOff,
  X,
  Bell
} from 'lucide-react';

export const PersonnelPage: React.FC = () => {
  // Load personnel list from localStorage or fallback to MOCK_PERSONNEL
  const [personnelList, setPersonnelList] = useState<Personnel[]>(() => {
    try {
      const saved = localStorage.getItem('polaris_personnel_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return MOCK_PERSONNEL;
  });

  const [selectedPerson, setSelectedPerson] = useState<Personnel | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' | 'offline' } | null>(null);

  // Save personnel list to localStorage
  const updatePersonnelState = (newList: Personnel[]) => {
    setPersonnelList(newList);
    try {
      localStorage.setItem('polaris_personnel_list', JSON.stringify(newList));
    } catch (e) {
      // ignore
    }
  };

  // Toast Helper
  const showToast = (text: string, type: 'success' | 'info' | 'error' | 'offline' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Summary Metrics (SECTION 1)
  const totalPersonnel = personnelList.length;
  const checkedInCount = personnelList.filter((p) => p.checkInStatus === 'CHECKED_IN').length;
  const dueSoonCount = personnelList.filter((p) => p.checkInStatus === 'DUE_SOON').length;
  const deadmanCount = personnelList.filter((p) => p.checkInStatus === 'MISSED_DEADMAN_TRIGGER').length;
  const offlineCount = personnelList.filter((p) => p.checkInStatus === 'OFFLINE').length;

  // Action: Check In Now (SECTION 4)
  const handleCheckIn = (personId: string) => {
    const updated = personnelList.map((p) =>
      p.id === personId
        ? {
          ...p,
          checkInStatus: 'CHECKED_IN' as const,
          lastCheckIn: 'Just now',
          nextCheckInDue: 'In 4 hrs 00 mins',
        }
        : p
    );
    updatePersonnelState(updated);
    if (selectedPerson?.id === personId) {
      setSelectedPerson({
        ...selectedPerson,
        checkInStatus: 'CHECKED_IN',
        lastCheckIn: 'Just now',
        nextCheckInDue: 'In 4 hrs 00 mins',
      });
    }
    showToast('Check-in successful', 'success');
  };

  // Action: Simulate Missed Check-In (SECTION 5)
  const handleSimulateMissedCheckIn = () => {
    // Pick the first non-deadman personnel member
    const target = personnelList.find((p) => p.checkInStatus !== 'MISSED_DEADMAN_TRIGGER') || personnelList[0];

    const updated = personnelList.map((p) =>
      p.id === target.id
        ? {
          ...p,
          checkInStatus: 'MISSED_DEADMAN_TRIGGER' as const,
          nextCheckInDue: 'EXPIRED (-15 mins)',
        }
        : p
    );

    updatePersonnelState(updated);
    showToast('Deadman protocol triggered — command escalation initiated.', 'error');
  };

  // Action: Resolve Safety Event (SECTION 6)
  const handleResolveSafetyEvent = (personId: string) => {
    const updated = personnelList.map((p) =>
      p.id === personId
        ? {
          ...p,
          checkInStatus: 'CHECKED_IN' as const,
          lastCheckIn: 'Just now',
          nextCheckInDue: 'In 4 hrs 00 mins',
        }
        : p
    );
    updatePersonnelState(updated);
    if (selectedPerson?.id === personId) {
      setSelectedPerson({
        ...selectedPerson,
        checkInStatus: 'CHECKED_IN',
        lastCheckIn: 'Just now',
        nextCheckInDue: 'In 4 hrs 00 mins',
      });
    }
    showToast('Safety event resolved — personnel check-in status restored', 'success');
  };

  // Action: Offline Check-In (SECTION 7)
  const handleOfflineCheckIn = (personId: string) => {
    const updated = personnelList.map((p) =>
      p.id === personId
        ? {
          ...p,
          checkInStatus: 'CHECKED_IN' as const,
          lastCheckIn: 'Just now (Queued)',
          nextCheckInDue: 'In 4 hrs 00 mins',
        }
        : p
    );
    updatePersonnelState(updated);
    showToast('CHECK-IN QUEUED — WILL SYNC WHEN CONNECTIVITY RETURNS', 'offline');
  };

  // Reset Demo State
  const handleResetPersonnel = () => {
    setPersonnelList(MOCK_PERSONNEL);
    try {
      localStorage.removeItem('polaris_personnel_list');
    } catch (e) {
      // ignore
    }
    showToast('Personnel state restored to default mock data', 'info');
  };

  return (
    <div className="space-y-6 font-sans text-[var(--text-primary)]">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-lg border font-sans text-xs font-semibold flex items-center space-x-3 transition-all ${toastMessage.type === 'error'
              ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
              : toastMessage.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                : toastMessage.type === 'offline'
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                  : 'bg-blue-500/10 text-[var(--polar-cyan)] border-[var(--polar-cyan)]/30'
            }`}
        >
          <Bell className="w-4 h-4 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Bar & Demo Simulation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center">
            <Users className="w-5 h-5 mr-2 text-[var(--polar-cyan)]" /> Personnel Safety & Dead-Man's-Switch Check-In
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
            Real-time personnel location telemetry, medical fitness clearance & safety escalation timers.
          </p>
        </div>

        {/* DEMO CONTROLS */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleSimulateMissedCheckIn}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-sans text-xs font-semibold shadow-2xs flex items-center space-x-1.5 cursor-pointer transition-colors active:scale-95"
          >
            <AlertOctagon className="w-4 h-4 animate-pulse" />
            <span>SIMULATE MISSED CHECK-IN</span>
          </button>

          <button
            onClick={handleResetPersonnel}
            className="p-2 rounded-xl bg-[var(--surface-primary)] hover:bg-[var(--surface-elevated)] border border-[var(--border-primary)] text-[var(--text-primary)] transition-colors cursor-pointer shadow-2xs"
            title="Reset Personnel Data"
          >
            <RotateCcw className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      {/* DEADMAN TRIGGERED SAFETY WARNING BANNER */}
      {deadmanCount > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-5 shadow-2xs space-y-4 text-[var(--text-primary)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-rose-500/20 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-rose-600 text-white shadow-2xs shrink-0">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-500 font-sans text-[10px] font-bold uppercase tracking-wider">
                  CRITICAL SAFETY PROTOCOL TRIGGERED
                </span>
                <h3 className="text-sm font-bold text-[var(--text-primary)] mt-1">
                  Deadman Protocol Triggered — Command Escalation Initiated
                </h3>
              </div>
            </div>

            <span className="text-xs font-semibold text-rose-500">
              {deadmanCount} Personnel Missed Check-In Window
            </span>
          </div>

          {/* ESCALATION CHAIN DIAGRAM */}
          <div className="bg-[var(--surface-primary)] p-4 rounded-xl border border-rose-500/20 space-y-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
              Dead-Man's-Switch Command Escalation Chain
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
              <div className="p-3 bg-[var(--surface-elevated)] rounded-lg border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] font-semibold block">STAGE 1</span>
                  <span className="font-bold text-[var(--text-primary)]">FIELD PERSONNEL</span>
                </div>
                <span className="text-[10px] text-rose-500 font-bold">MISSED TIMER</span>
              </div>

              <div className="p-3 bg-[var(--surface-elevated)] rounded-lg border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] font-semibold block">STAGE 2</span>
                  <span className="font-bold text-[var(--text-primary)]">STATION LEADER</span>
                </div>
                <span className="text-[10px] text-[var(--polar-cyan)] font-bold">AUTO-ALERTED</span>
              </div>

              <div className="p-3 bg-[var(--surface-elevated)] rounded-lg border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] font-semibold block">STAGE 3</span>
                  <span className="font-bold text-[var(--text-primary)]">NCPOR COMMAND</span>
                </div>
                <span className="text-[10px] text-rose-500 font-bold animate-pulse">ESCALATED</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. PERSONNEL SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Total Personnel</span>
            <Users className="w-4 h-4 text-[var(--polar-cyan)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-2 font-mono">{totalPersonnel}</p>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-1">Across 3 Stations</p>
        </div>

        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Checked In</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-500 mt-2 font-mono">{checkedInCount}</p>
          <p className="text-xs text-emerald-500 font-sans mt-1">Safety Verified</p>
        </div>

        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Due Soon</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-500 mt-2 font-mono">{dueSoonCount}</p>
          <p className="text-xs text-amber-500 font-sans mt-1">&lt; 30 Mins Window</p>
        </div>

        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Deadman Triggered</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-500 mt-2 font-mono">{deadmanCount}</p>
          <p className="text-xs text-rose-500 font-sans mt-1">Escalated Incident</p>
        </div>

        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Offline Units</span>
            <WifiOff className="w-4 h-4 text-[var(--text-secondary)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-secondary)] mt-2 font-mono">{offlineCount}</p>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-1">Local Queue Active</p>
        </div>
      </div>

      {/* 2. PERSONNEL TABLE & ACTIONS */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            Station Personnel Safety & Telemetry Roster ({personnelList.length})
          </span>
          <span className="text-xs font-semibold text-[var(--polar-cyan)]">Click personnel row to inspect details</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-primary)] text-xs font-semibold text-[var(--text-secondary)] bg-[var(--surface-elevated)]">
                <th className="p-4">NAME & ROLE</th>
                <th className="p-4">STATION & TEAM</th>
                <th className="p-4">FITNESS CLEARANCE</th>
                <th className="p-4">CHECK-IN STATUS</th>
                <th className="p-4">LAST CHECK-IN</th>
                <th className="p-4">NEXT DUE</th>
                <th className="p-4">BLOOD GROUP</th>
                <th className="p-4 text-right">SAFETY ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-xs font-sans">
              {personnelList.map((person) => {
                const stationObj = MOCK_STATIONS.find((s) => s.id === person.stationId);
                const isMissed = person.checkInStatus === 'MISSED_DEADMAN_TRIGGER';
                const isDue = person.checkInStatus === 'DUE_SOON';

                return (
                  <tr
                    key={person.id}
                    onClick={() => setSelectedPerson(person)}
                    className={`hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer text-[var(--text-secondary)] ${isMissed ? 'bg-rose-500/10' : ''
                      }`}
                  >
                    <td className="p-4">
                      <div className="font-bold text-[var(--text-primary)]">{person.name}</div>
                      <div className="text-xs text-[var(--polar-cyan)] font-medium mt-0.5">{person.role}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[var(--text-primary)]">{stationObj?.name || person.stationId}</div>
                      <div className="text-xs text-[var(--text-muted)]">{person.team}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center w-fit">
                        <ShieldCheck className="w-3 h-3 mr-1" /> {person.fitnessClearance}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-semibold border inline-block ${isMissed
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse'
                            : isDue
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                          }`}
                      >
                        {person.checkInStatus}
                      </span>
                    </td>
                    <td className="p-4 text-[var(--text-secondary)] font-mono">{person.lastCheckIn}</td>
                    <td className="p-4 font-bold text-[var(--text-primary)] font-mono">{person.nextCheckInDue}</td>
                    <td className="p-4 font-bold text-rose-500 font-mono">{person.bloodGroup}</td>

                    {/* Interactive Action Buttons */}
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2">
                        {isMissed ? (
                          <button
                            onClick={() => handleResolveSafetyEvent(person.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                          >
                            RESOLVE EVENT
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCheckIn(person.id)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                          >
                            CHECK IN NOW
                          </button>
                        )}

                        <button
                          onClick={() => handleOfflineCheckIn(person.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-[var(--surface-primary)] hover:bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border-primary)] font-sans text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                          title="Queue check-in for offline sync"
                        >
                          <WifiOff className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. PERSONNEL DETAIL MODAL */}
      {selectedPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-[var(--text-primary)]">
            <div className="flex items-start justify-between border-b border-[var(--border-subtle)] pb-3">
              <div>
                <span className="text-xs text-[var(--polar-cyan)] font-bold">{selectedPerson.role}</span>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mt-0.5">{selectedPerson.name}</h3>
              </div>
              <button
                onClick={() => setSelectedPerson(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Detailed Personnel Properties */}
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Team / Unit:</span>
                <span className="font-semibold text-[var(--text-primary)]">{selectedPerson.team}</span>
              </div>

              <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Station Node:</span>
                <span className="font-bold text-[var(--polar-cyan)] uppercase font-mono">
                  {MOCK_STATIONS.find((s) => s.id === selectedPerson.stationId)?.name || selectedPerson.stationId}
                </span>
              </div>

              <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Fitness Clearance:</span>
                <span className="font-semibold text-emerald-500 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> {selectedPerson.fitnessClearance}
                </span>
              </div>

              <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Check-in Status:</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded text-[11px] ${selectedPerson.checkInStatus === 'MISSED_DEADMAN_TRIGGER'
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30 animate-pulse'
                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                    }`}
                >
                  {selectedPerson.checkInStatus}
                </span>
              </div>

              <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Last Check-in:</span>
                <span className="text-[var(--text-secondary)] font-mono">{selectedPerson.lastCheckIn}</span>
              </div>

              <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Next Check-in Due:</span>
                <span className="font-bold text-[var(--text-primary)] font-mono">{selectedPerson.nextCheckInDue}</span>
              </div>

              <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">GPS Coordinates:</span>
                <span className="text-[var(--polar-cyan)] font-semibold font-mono">{selectedPerson.coordinates || 'Station Perimeter'}</span>
              </div>

              <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Blood Group:</span>
                <span className="font-bold text-rose-500 font-mono">{selectedPerson.bloodGroup}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPerson(null)}
                className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-input)] text-[var(--text-primary)] text-xs font-semibold cursor-pointer border border-[var(--border-subtle)]"
              >
                CLOSE INSPECTION
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
