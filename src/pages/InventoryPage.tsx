import React, { useState } from 'react';
import { MOCK_INVENTORY, MOCK_STATIONS } from '../data/mockData';
import { InventoryItem } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Package,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  Clock,
  X
} from 'lucide-react';
import { useThemeStore } from '../stores/useThemeStore';

export const InventoryPage: React.FC = () => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  // Load simulated or original inventory from localStorage
  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('polaris_simulated_inventory');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return MOCK_INVENTORY;
  });

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [simulationDays, setSimulationDays] = useState<number>(0);

  // Helper: Calculate Risk Classification
  const getRiskClassification = (item: InventoryItem): 'CRITICAL' | 'WARNING' | 'HEALTHY' => {
    const days = item.burnRatePerDay > 0 ? Math.floor(item.currentStock / item.burnRatePerDay) : 999;
    if (days <= 30 || item.currentStock <= item.minThreshold) {
      return 'CRITICAL';
    } else if (days <= 60) {
      return 'WARNING';
    } else {
      return 'HEALTHY';
    }
  };

  // Helper: Priority Level
  const getPriorityLevel = (risk: 'CRITICAL' | 'WARNING' | 'HEALTHY'): 'CRITICAL' | 'HIGH' | 'ROUTINE' => {
    if (risk === 'CRITICAL') return 'CRITICAL';
    if (risk === 'WARNING') return 'HIGH';
    return 'ROUTINE';
  };

  // Sort highest risk items first (CRITICAL -> WARNING -> HEALTHY)
  const sortedItems = [...items].sort((a, b) => {
    const riskScore = { CRITICAL: 1, WARNING: 2, HEALTHY: 3 };
    const riskA = getRiskClassification(a);
    const riskB = getRiskClassification(b);
    return riskScore[riskA] - riskScore[riskB];
  });

  // Calculate Summary Metrics
  const totalItems = items.length;
  const healthyCount = items.filter((i) => getRiskClassification(i) === 'HEALTHY').length;
  const warningCount = items.filter((i) => getRiskClassification(i) === 'WARNING').length;
  const criticalCount = items.filter((i) => getRiskClassification(i) === 'CRITICAL').length;
  const avgDaysRemaining = Math.round(
    items.reduce((acc, i) => acc + (i.burnRatePerDay > 0 ? Math.floor(i.currentStock / i.burnRatePerDay) : 999), 0) /
    totalItems
  );

  // Recommendations for Critical & Warning items
  const resupplyRecommendations = sortedItems.filter(
    (i) => getRiskClassification(i) === 'CRITICAL' || getRiskClassification(i) === 'WARNING'
  );

  // Simulate Daily Consumption (SECTION 8)
  const handleSimulateDay = () => {
    const updated = items.map((item) => {
      const newStock = Math.max(0, item.currentStock - item.burnRatePerDay);
      const newDays = item.burnRatePerDay > 0 ? Math.floor(newStock / item.burnRatePerDay) : 999;
      const newRisk = newStock <= item.minThreshold || newDays <= 30 ? 'CRITICAL_LOW' : newDays <= 60 ? 'DEPLETING_FAST' : 'HEALTHY';

      return {
        ...item,
        currentStock: Math.round(newStock * 10) / 10,
        daysRemaining: newDays,
        status: newRisk as InventoryItem['status'],
      };
    });

    setItems(updated);
    setSimulationDays((prev) => prev + 1);
    try {
      localStorage.setItem('polaris_simulated_inventory', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  // Reset Simulation
  const handleResetSimulation = () => {
    setItems(MOCK_INVENTORY);
    setSimulationDays(0);
    try {
      localStorage.removeItem('polaris_simulated_inventory');
    } catch (e) {
      // ignore
    }
  };

  // Recharts Data
  const chartData = sortedItems.map((item) => {
    const stationObj = MOCK_STATIONS.find((s) => s.id === item.stationId);
    const days = item.burnRatePerDay > 0 ? Math.floor(item.currentStock / item.burnRatePerDay) : 999;
    return {
      name: `${item.name.split(' ')[0]} (${stationObj?.code || item.stationId})`,
      daysRemaining: days,
      risk: getRiskClassification(item),
    };
  });

  return (
    <div className="space-y-6 font-sans text-[var(--text-primary)]">
      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center">
            <Package className="w-5 h-5 mr-2 text-[var(--polar-cyan)]" /> Smart Inventory & Depletion Prediction
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
            Predictive Logistics Engine monitoring fuel, food, medical & equipment reserves.
          </p>
        </div>

        {/* DEMO INTERACTION: SIMULATION BUTTONS */}
        <div className="flex items-center space-x-2 shrink-0">
          {simulationDays > 0 && (
            <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/30 text-xs font-semibold">
              Simulated: +{simulationDays} Day(s)
            </span>
          )}

          <button
            onClick={handleSimulateDay}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-semibold shadow-2xs flex items-center space-x-1.5 cursor-pointer transition-colors active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>SIMULATE DAILY CONSUMPTION</span>
          </button>

          <button
            onClick={handleResetSimulation}
            className="p-2 rounded-xl bg-[var(--surface-primary)] hover:bg-[var(--surface-elevated)] border border-[var(--border-primary)] text-[var(--text-primary)] transition-colors cursor-pointer shadow-2xs"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      {/* 1. INVENTORY SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Total Items</span>
            <Package className="w-4 h-4 text-[var(--polar-cyan)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-2 font-mono">{totalItems}</p>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-1">5 Core Categories</p>
        </div>

        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Healthy</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-500 mt-2 font-mono">{healthyCount}</p>
          <p className="text-xs text-emerald-500 font-sans mt-1">&gt; 60 Days Stock</p>
        </div>

        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Depleting Fast</span>
            <TrendingDown className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-500 mt-2 font-mono">{warningCount}</p>
          <p className="text-xs text-amber-500 font-sans mt-1">30 to 60 Days</p>
        </div>

        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Critical Low</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-500 mt-2 font-mono">{criticalCount}</p>
          <p className="text-xs text-rose-500 font-sans mt-1">&le; 30 Days / Below Min</p>
        </div>

        <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Avg Days Left</span>
            <Clock className="w-4 h-4 text-[var(--polar-cyan)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--polar-cyan)] mt-2 font-mono">{avgDaysRemaining} Days</p>
          <p className="text-xs text-[var(--polar-cyan)] font-sans mt-1">Average Inventory Life</p>
        </div>
      </div>

      {/* 3. SMART DEPLETION PREDICTION BANNER */}
      <div className="bg-[var(--polar-cyan)]/10 border border-[var(--polar-cyan)]/30 rounded-xl p-5 shadow-2xs space-y-2 text-[var(--text-primary)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[var(--polar-cyan)]/20 text-[var(--polar-cyan)] border border-[var(--polar-cyan)]/40 font-sans text-xs font-semibold flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-[var(--polar-cyan)]" /> Predictive Logistics Engine
            </span>
            <span className="text-xs font-sans text-[var(--text-secondary)] font-medium">Consumption Rate Telemetry</span>
          </div>
        </div>
        <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
          "At current station consumption rates, critical reserves are estimated to run dry before the next annual resupply ship window. Depletion dates update automatically in real-time."
        </p>
      </div>

      {/* 6. CONSUMPTION RECHARTS CHART */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)]">
          <div>
            <h3 className="font-bold text-sm text-[var(--text-primary)] uppercase tracking-wider flex items-center">
              <TrendingDown className="w-4 h-4 mr-2 text-amber-500" /> Inventory Depletion Life (Days Remaining)
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
              Calculated as: Predicted Days = Current Stock / Daily Burn Rate
            </p>
          </div>
          <span className="text-xs font-sans font-semibold px-3 py-1 rounded-lg bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
            SORTED BY RISK PRIORITY
          </span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis dataKey="name" tick={{ fill: isDark ? '#94A3B8' : '#64748b', fontSize: 11, fontFamily: 'Inter, sans-serif' }} />
              <YAxis tick={{ fill: isDark ? '#94A3B8' : '#64748b', fontSize: 11, fontFamily: 'Inter, sans-serif' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0F172A' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                  borderRadius: '8px',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
                itemStyle={{ color: '#38BDF8' }}
              />
              <Bar dataKey="daysRemaining" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.risk === 'CRITICAL' ? '#f43f5e' : entry.risk === 'WARNING' ? '#f59e0b' : '#10b981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. AUTOMATED RESUPPLY RECOMMENDATIONS PANEL */}
      {resupplyRecommendations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" /> Automated Resupply Recommendations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resupplyRecommendations.map((item) => {
              const stationObj = MOCK_STATIONS.find((s) => s.id === item.stationId);
              const risk = getRiskClassification(item);
              const priority = getPriorityLevel(risk);
              const predictedDays = item.burnRatePerDay > 0 ? Math.floor(item.currentStock / item.burnRatePerDay) : 999;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 shadow-2xs ${priority === 'CRITICAL'
                      ? 'bg-[var(--surface-primary)] border-rose-500/30 hover:border-rose-500/50'
                      : 'bg-[var(--surface-primary)] border-amber-500/30 hover:border-amber-500/50'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                      {stationObj?.name || item.stationId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${priority === 'CRITICAL'
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                        }`}
                    >
                      RESUPPLY RECOMMENDED
                    </span>
                  </div>

                  <h4 className="font-bold text-[var(--text-primary)] text-sm">{item.name}</h4>

                  <div className="text-xs text-[var(--text-secondary)] space-y-1">
                    <p className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Stock Remaining:</span>
                      <strong className="text-[var(--text-primary)] font-mono">{item.currentStock.toLocaleString()} {item.unit}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Daily Burn:</span>
                      <span>{item.burnRatePerDay} {item.unit}/day</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Estimated Depletion:</span>
                      <span className="font-bold text-amber-500 font-mono">{predictedDays} Days</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)] font-medium">Resupply priority:</span>
                    <span
                      className={`font-bold ${priority === 'CRITICAL' ? 'text-rose-500' : 'text-amber-500'
                        }`}
                    >
                      {priority}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. INVENTORY TABLE & RISK DETECTION */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            Station Inventory & Risk Classification Ledger ({items.length})
          </span>
          <span className="text-xs font-semibold text-[var(--polar-cyan)]">Sorted Highest-Risk First</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-primary)] text-xs font-semibold text-[var(--text-secondary)] bg-[var(--surface-elevated)]">
                <th className="p-4">ITEM & LOCATION</th>
                <th className="p-4">STATION</th>
                <th className="p-4">CATEGORY</th>
                <th className="p-4">CURRENT STOCK</th>
                <th className="p-4">DAILY BURN</th>
                <th className="p-4">PREDICTED DEPLETION</th>
                <th className="p-4">MIN THRESHOLD</th>
                <th className="p-4">RISK STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-xs">
              {sortedItems.map((item) => {
                const stationObj = MOCK_STATIONS.find((s) => s.id === item.stationId);
                const risk = getRiskClassification(item);
                const predictedDays = item.burnRatePerDay > 0 ? Math.floor(item.currentStock / item.burnRatePerDay) : 999;

                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer text-[var(--text-secondary)]"
                  >
                    <td className="p-4">
                      <div className="font-bold text-[var(--text-primary)]">{item.name}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">{item.location}</div>
                    </td>
                    <td className="p-4 text-[var(--polar-cyan)] font-semibold">
                      {stationObj?.name || item.stationId}
                    </td>
                    <td className="p-4 text-[var(--text-secondary)]">{item.category}</td>
                    <td className="p-4 font-bold font-mono text-[var(--text-primary)]">
                      {item.currentStock.toLocaleString()} {item.unit}
                    </td>
                    <td className="p-4 text-[var(--text-secondary)]">
                      {item.burnRatePerDay} {item.unit}/day
                    </td>
                    <td className="p-4">
                      <div className="font-bold font-mono text-amber-500">{predictedDays} Days</div>
                      <div className="w-24 bg-[var(--surface-input)] rounded-full h-1.5 mt-1">
                        <div
                          className={`h-full rounded-full ${risk === 'CRITICAL' ? 'bg-rose-500' : risk === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          style={{ width: `${Math.min(100, (predictedDays / 90) * 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="p-4 text-[var(--text-muted)] font-mono">
                      {item.minThreshold.toLocaleString()} {item.unit}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-semibold border ${risk === 'CRITICAL'
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse'
                            : risk === 'WARNING'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                          }`}
                      >
                        {risk}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. INVENTORY DETAIL MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-[var(--text-primary)] font-sans">
            <div className="flex items-start justify-between border-b border-[var(--border-subtle)] pb-3">
              <div>
                <span className="text-xs text-[var(--polar-cyan)] font-bold">{selectedItem.category}</span>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mt-0.5">{selectedItem.name}</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Detailed Properties Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] block text-[10px] font-semibold">STATION NODE</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {MOCK_STATIONS.find((s) => s.id === selectedItem.stationId)?.name || selectedItem.stationId}
                </span>
              </div>

              <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] block text-[10px] font-semibold">STORAGE LOCATION</span>
                <span className="font-semibold text-[var(--text-primary)]">{selectedItem.location}</span>
              </div>

              <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] block text-[10px] font-semibold">CURRENT STOCK</span>
                <span className="font-bold text-[var(--polar-cyan)] font-mono">
                  {selectedItem.currentStock.toLocaleString()} {selectedItem.unit}
                </span>
              </div>

              <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] block text-[10px] font-semibold">DAILY BURN RATE</span>
                <span className="font-bold text-[var(--text-primary)] font-mono">
                  {selectedItem.burnRatePerDay} {selectedItem.unit}/day
                </span>
              </div>

              <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] block text-[10px] font-semibold">PREDICTED DEPLETION</span>
                <span className="font-bold text-amber-500 font-mono">
                  {selectedItem.burnRatePerDay > 0
                    ? Math.floor(selectedItem.currentStock / selectedItem.burnRatePerDay)
                    : 999}{' '}
                  Days
                </span>
              </div>

              <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] block text-[10px] font-semibold">MIN THRESHOLD</span>
                <span className="font-bold text-[var(--text-secondary)] font-mono">
                  {selectedItem.minThreshold.toLocaleString()} {selectedItem.unit}
                </span>
              </div>
            </div>

            {/* Risk & Recommendation Section */}
            <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)] font-medium">Risk Classification:</span>
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${getRiskClassification(selectedItem) === 'CRITICAL'
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                      : getRiskClassification(selectedItem) === 'WARNING'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                    }`}
                >
                  {getRiskClassification(selectedItem)}
                </span>
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] block text-[10px] font-semibold mb-1">RESUPPLY RECOMMENDATION</span>
                <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
                  {getRiskClassification(selectedItem) === 'CRITICAL'
                    ? `CRITICAL RESUPPLY REQUIRED: At ${selectedItem.burnRatePerDay} ${selectedItem.unit}/day, stock runs dry in ${selectedItem.daysRemaining} days. Priority allocation on next vessel.`
                    : getRiskClassification(selectedItem) === 'WARNING'
                      ? `HIGH RESUPPLY RECOMMENDED: Stock expected to breach minimum threshold within 60 days. Schedule for upcoming air/vessel resupply.`
                      : `ROUTINE MONITORING: Reserve levels optimal. Stock sufficient for over 60 operating days.`}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedItem(null)}
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
