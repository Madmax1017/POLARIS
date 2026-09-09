import React, { useState, useEffect } from 'react';
import { MOCK_ALERTS, MOCK_PERSONNEL } from '../data/mockData';
import { EmergencyAlert } from '../types';
import { alarmSynth } from '../utils/alarmSynth';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PhoneCall,
  Volume2,
  VolumeX,
  Radio,
  MapPin,
  HeartPulse,
  X,
  Check,
  Bell,
  AlertOctagon
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  // Load alerts from localStorage or fallback to MOCK_ALERTS
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(() => {
    try {
      const saved = localStorage.getItem('polaris_alerts_list');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // ignore
    }
    return MOCK_ALERTS;
  });

  // Selected Alert for Detailed Escalation Panel
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(
    () => alerts[0] || null
  );

  // SOS Modal & Alarm State
  const [sosModalOpen, setSosModalOpen] = useState<boolean>(false);
  const [emergencyBannerActive, setEmergencyBannerActive] = useState<boolean>(false);
  const [alarmPlaying, setAlarmPlaying] = useState<boolean>(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'emergency' } | null>(null);

  // Save alerts state to localStorage
  const updateAlertsState = (newAlerts: EmergencyAlert[]) => {
    setAlerts(newAlerts);
    try {
      localStorage.setItem('polaris_alerts_list', JSON.stringify(newAlerts));
    } catch (e) {
      // ignore
    }
  };

  // Toast helper
  const showToast = (text: string, type: 'success' | 'info' | 'emergency' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Cleanup alarm on unmount
  useEffect(() => {
    return () => {
      alarmSynth.stop();
    };
  }, []);

  // Calculate summary card stats from real dataset
  const activeCriticalCount = alerts.filter(
    (a) => (a.severity === 'CRITICAL' || a.type === 'ONE_TAP_SOS') && a.status === 'ACTIVE_ESCALATED'
  ).length;

  const highPriorityCount = alerts.filter(
    (a) => a.severity === 'HIGH' && a.status === 'ACTIVE_ESCALATED'
  ).length;

  const personnelCheckInIssues = MOCK_PERSONNEL.filter(
    (p) => p.checkInStatus === 'MISSED_DEADMAN_TRIGGER' || p.checkInStatus === 'DUE_SOON'
  ).length;

  const resolvedCount = alerts.filter((a) => a.status === 'RESOLVED').length;

  // Action: Acknowledge Alert
  const handleAcknowledge = (alertId: string) => {
    const updated = alerts.map((a) =>
      a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' as const } : a
    );
    updateAlertsState(updated);
    if (selectedAlert?.id === alertId) {
      setSelectedAlert({ ...selectedAlert, status: 'ACKNOWLEDGED' });
    }
    showToast(`Alert ${alertId} status changed to ACKNOWLEDGED`, 'info');
  };

  // Action: Resolve Alert
  const handleResolve = (alertId: string) => {
    const updated = alerts.map((a) =>
      a.id === alertId ? { ...a, status: 'RESOLVED' as const } : a
    );
    updateAlertsState(updated);
    if (selectedAlert?.id === alertId) {
      setSelectedAlert({ ...selectedAlert, status: 'RESOLVED' });
    }

    // Stop Web Audio alarm if playing
    if (alarmPlaying) {
      alarmSynth.stop();
      setAlarmPlaying(false);
      setEmergencyBannerActive(false);
    }

    showToast(`Alert ${alertId} resolved — system status normalized`, 'success');
  };

  // Action: Confirm One-Tap SOS
  const handleConfirmSOS = () => {
    const newSosAlert: EmergencyAlert = {
      id: `alt-sos-${Date.now().toString().slice(-4)}`,
      stationId: 'maitri',
      personnelName: 'Dr. Ananya Sharma (Field Lead)',
      timestamp: new Date().toISOString(),
      type: 'ONE_TAP_SOS',
      severity: 'CRITICAL',
      status: 'ACTIVE_ESCALATED',
      location: 'Schirmacher Glacier Sector 4 (-70.7667 S, 11.7333 E)',
      vitalsSummary: 'Heart Rate: 112 bpm | SpO2: 96% | Body Temp: 36.4°C (Telemetered)',
    };

    const updated = [newSosAlert, ...alerts];
    updateAlertsState(updated);
    setSelectedAlert(newSosAlert);
    setSosModalOpen(false);
    setEmergencyBannerActive(true);

    // ONLY start Web Audio API synth sound AFTER user clicks CONFIRM SOS button
    alarmSynth.start();
    setAlarmPlaying(true);

    showToast('EMERGENCY RESPONSE ACTIVATED — Direct Satellite & Twilio SMS Push Sent', 'emergency');
  };

  // Action: Stop Audio Alarm
  const handleStopAlarm = () => {
    alarmSynth.stop();
    setAlarmPlaying(false);
    showToast('Emergency audio alarm silenced', 'info');
  };

  return (
    <div className="space-y-6 font-sans text-[var(--text-primary)]">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-lg border font-sans text-xs font-semibold flex items-center space-x-3 transition-all ${toastMessage.type === 'emergency'
              ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 shadow-rose-950/20'
              : toastMessage.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-emerald-950/20'
                : 'bg-[var(--polar-cyan)]/10 text-[var(--polar-cyan)] border-[var(--polar-cyan)]/30 shadow-sky-950/20'
            }`}
        >
          <Bell className="w-4 h-4 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* EMERGENCY RESPONSE ACTIVATED BANNER */}
      {emergencyBannerActive && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[var(--text-primary)]">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-2xs shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white font-sans text-xs font-bold uppercase tracking-wider">
                  EMERGENCY RESPONSE ACTIVATED
                </span>
                <span className="text-xs font-sans text-rose-400 font-medium">Live Satellite Uplink</span>
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] mt-1">
                ONE-TAP SOS BROADCAST IN PROGRESS
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
                Target: Station Leader (Maitri) + NCPOR Base Command (Goa) + Medical Reach-Back Unit
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {alarmPlaying ? (
              <button
                onClick={handleStopAlarm}
                className="px-4 py-2 rounded-xl bg-[var(--surface-primary)] hover:bg-[var(--surface-elevated)] text-amber-500 border border-amber-500/30 font-sans text-xs font-semibold flex items-center space-x-2 shadow-2xs cursor-pointer"
              >
                <VolumeX className="w-4 h-4 text-amber-500" />
                <span>STOP ALARM</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  alarmSynth.start();
                  setAlarmPlaying(true);
                }}
                className="px-4 py-2 rounded-xl bg-[var(--surface-primary)] hover:bg-[var(--surface-elevated)] text-[var(--polar-cyan)] border border-[var(--border-primary)] font-sans text-xs font-semibold flex items-center space-x-2 shadow-2xs cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-[var(--polar-cyan)]" />
                <span>RE-ENABLE ALARM</span>
              </button>
            )}

            <button
              onClick={() => {
                if (selectedAlert) handleResolve(selectedAlert.id);
                setEmergencyBannerActive(false);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-semibold shadow-2xs cursor-pointer"
            >
              RESOLVE EMERGENCY
            </button>
          </div>
        </div>
      )}

      {/* Top Controls & ONE-TAP SOS Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center">
            <ShieldAlert className="w-5 h-5 mr-2 text-rose-500" /> Safety-Critical Core & Emergency Response
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
            Dead-man's-switch check-in monitoring, safety escalations, and one-tap emergency satellite broadcast.
          </p>
        </div>

        {/* PROMINENT ONE-TAP SOS BUTTON */}
        <button
          onClick={() => setSosModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-sans font-bold text-xs tracking-wide shadow-2xs flex items-center space-x-2 shrink-0 cursor-pointer transition-colors"
        >
          <PhoneCall className="w-4 h-4" />
          <span>ONE-TAP SOS</span>
        </button>
      </div>

      {/* 1. ALERT SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Active Critical</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-500 mt-2">{activeCriticalCount}</p>
          <p className="text-xs text-rose-500 font-sans mt-2">Requires Immediate Action</p>
        </div>

        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">High Priority</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-500 mt-2">{highPriorityCount}</p>
          <p className="text-xs text-amber-500 font-sans mt-2">System/Power Warnings</p>
        </div>

        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Check-in Issues</span>
            <Clock className="w-4 h-4 text-[var(--polar-cyan)]" />
          </div>
          <p className="text-2xl font-bold font-mono text-[var(--text-primary)] mt-2">{personnelCheckInIssues}</p>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-2">Dead-Man's Timers Tracked</p>
        </div>

        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Resolved Alerts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-500 mt-2">{resolvedCount}</p>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-2">Log Archived in Command DB</p>
        </div>
      </div>

      {/* Main Split Layout: Alert List & Emergency Response Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2. ALERT LIST */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center">
              <ShieldAlert className="w-4 h-4 mr-2 text-rose-500" /> Command Incident Feed ({alerts.length})
            </h3>
            <span className="text-xs font-semibold text-[var(--polar-cyan)]">Click entry to inspect details</span>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => {
              const isSelected = selectedAlert?.id === alert.id;
              const isCritical = alert.severity === 'CRITICAL' || alert.type === 'ONE_TAP_SOS';
              const isResolved = alert.status === 'RESOLVED';
              const isAck = alert.status === 'ACKNOWLEDGED';

              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`p-5 rounded-xl border transition-all cursor-pointer space-y-3 ${isSelected
                      ? 'bg-[var(--polar-cyan)]/10 border-[var(--polar-cyan)] shadow-2xs'
                      : isResolved
                        ? 'bg-[var(--surface-primary)] border-[var(--border-subtle)] opacity-70 hover:opacity-100'
                        : isCritical
                          ? 'bg-[var(--surface-primary)] border-rose-500/40 hover:border-rose-500 shadow-2xs'
                          : 'bg-[var(--surface-primary)] border-[var(--border-primary)] hover:border-[var(--border-primary)] shadow-2xs'
                    }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`p-2 rounded-lg border ${isCritical
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                          }`}
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="text-xs font-bold text-[var(--text-primary)]">{alert.type}</span>
                        <p className="text-xs text-[var(--text-secondary)]">{alert.personnelName}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${isCritical
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                          }`}
                      >
                        {alert.severity}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${isResolved
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                            : isAck
                              ? 'bg-[var(--polar-cyan)]/10 text-[var(--polar-cyan)] border-[var(--polar-cyan)]/30'
                              : 'bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse'
                          }`}
                      >
                        {alert.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)] font-sans">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold block">LOCATION</span>
                      <span className="truncate block font-medium text-[var(--text-primary)]">{alert.location}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold block">TIMESTAMP</span>
                      <span className="block font-mono text-[var(--text-primary)]">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Interactive Action Buttons for ACTIVE alerts */}
                  {alert.status !== 'RESOLVED' && (
                    <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-end space-x-2">
                      {alert.status !== 'ACKNOWLEDGED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcknowledge(alert.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-input)] text-[var(--polar-cyan)] font-sans text-xs font-semibold border border-[var(--border-subtle)] transition-colors flex items-center space-x-1 cursor-pointer shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>ACKNOWLEDGE</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolve(alert.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>RESOLVE</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. EMERGENCY RESPONSE PANEL & ESCALATION CHAIN */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center">
            <Radio className="w-4 h-4 mr-2 text-[var(--polar-cyan)]" /> Incident Detailed Analysis Panel
          </h3>

          {selectedAlert ? (
            <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-6 shadow-2xs space-y-5 text-[var(--text-primary)] font-sans">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div>
                  <span className="text-xs font-bold text-rose-500 flex items-center">
                    <ShieldAlert className="w-4 h-4 mr-1.5" /> {selectedAlert.type}
                  </span>
                  <h4 className="text-base font-bold text-[var(--text-primary)] mt-1">
                    {selectedAlert.personnelName}
                  </h4>
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                  {selectedAlert.id}
                </span>
              </div>

              {/* Detailed Key-Value Grid */}
              <div className="space-y-2.5 text-xs font-sans">
                <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] flex justify-between">
                  <span className="text-[var(--text-secondary)] font-medium flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-[var(--polar-cyan)]" /> Station Node:
                  </span>
                  <span className="font-bold text-[var(--text-primary)] uppercase font-mono">{selectedAlert.stationId}</span>
                </div>

                <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] flex justify-between">
                  <span className="text-[var(--text-secondary)] font-medium">Exact Location:</span>
                  <span className="font-medium text-[var(--text-primary)] truncate max-w-[180px]">{selectedAlert.location}</span>
                </div>

                <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] flex justify-between">
                  <span className="text-[var(--text-secondary)] font-medium flex items-center">
                    <HeartPulse className="w-3.5 h-3.5 mr-1.5 text-rose-500" /> Vitals Summary:
                  </span>
                  <span className="font-semibold text-rose-500">{selectedAlert.vitalsSummary || 'Direct Telemetered Stream'}</span>
                </div>

                <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] flex justify-between">
                  <span className="text-[var(--text-secondary)] font-medium">Trigger Time:</span>
                  <span className="font-mono text-[var(--text-primary)]">{new Date(selectedAlert.timestamp).toLocaleString()}</span>
                </div>

                <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)] flex justify-between">
                  <span className="text-[var(--text-secondary)] font-medium">Severity Level:</span>
                  <span className="font-bold text-rose-500 font-mono">{selectedAlert.severity}</span>
                </div>
              </div>

              {/* VISUAL ESCALATION CHAIN DIAGRAM */}
              <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Command Escalation Chain
                </span>

                <div className="bg-[var(--surface-elevated)] p-4 rounded-xl border border-[var(--border-subtle)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--polar-cyan)]/20 text-[var(--polar-cyan)] flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <span className="text-xs font-bold text-[var(--text-primary)]">FIELD PERSONNEL</span>
                    </div>
                    <span className="text-[10px] text-emerald-500 font-bold">TRIGGERED</span>
                  </div>

                  <div className="h-4 pl-3 border-l-2 border-dashed border-[var(--polar-cyan)]/40 my-1"></div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--polar-cyan)]/20 text-[var(--polar-cyan)] flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <span className="text-xs font-bold text-[var(--text-primary)]">STATION LEADER</span>
                    </div>
                    <span className="text-[10px] text-[var(--polar-cyan)] font-bold">NOTIFIED (SAT-PUSH)</span>
                  </div>

                  <div className="h-4 pl-3 border-l-2 border-dashed border-rose-500/40 my-1"></div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-xs font-bold">
                        3
                      </div>
                      <span className="text-xs font-bold text-[var(--text-primary)]">NCPOR COMMAND (GOA)</span>
                    </div>
                    <span className="text-[10px] text-rose-500 font-bold animate-pulse">ESCALATED</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-8 text-center text-[var(--text-secondary)] font-sans text-xs">
              Select an incident from the feed to inspect escalation details.
            </div>
          )}
        </div>
      </div>

      {/* ONE-TAP SOS CONFIRMATION MODAL */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-[var(--text-primary)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-rose-600 text-white shadow-2xs">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    Initiate Emergency Response?
                  </h3>
                  <p className="text-xs font-medium text-rose-500">
                    Safety-Critical Satellite Broadcast
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSosModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] space-y-2 text-xs text-[var(--text-secondary)] leading-relaxed">
              <p className="font-bold text-rose-500 flex items-center">
                <AlertOctagon className="w-4 h-4 mr-1.5 text-rose-500" />
                Direct Push Bypass Active
              </p>
              <p>
                This action will immediately trigger an emergency alert, broadcast GPS position & telemetry over satellite link to Base Command Goa & Station Medical Reach-Back, and initiate the command audio synthesizer alarm.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setSosModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-input)] text-[var(--text-primary)] font-sans text-xs font-semibold border border-[var(--border-subtle)] cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmSOS}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-sans text-xs font-bold tracking-wide shadow-2xs cursor-pointer"
              >
                CONFIRM SOS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
