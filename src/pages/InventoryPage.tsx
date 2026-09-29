import React, { useEffect, useState } from 'react';
import { Package, Plus, Search, Filter } from 'lucide-react';
import { useInventoryStore } from '../stores/useInventoryStore';
import { InventoryItem } from '../types';
import {
  AddInventoryModal,
  AdjustStockModal,
  AllocateModal,
  DetailModal
} from '../components/inventory/InventoryModals';
import { ResourceAnalytics } from '../components/inventory/ResourceAnalytics';

export const InventoryPage: React.FC = () => {
  const { items, isSeeded, seedInventory } = useInventoryStore();

  useEffect(() => {
    if (!isSeeded) seedInventory();
  }, [isSeeded, seedInventory]);

  const [modal, setModal] = useState<{ type: 'add' | 'adjust' | 'allocate' | 'detail' | null, item: InventoryItem | null }>({ type: null, item: null });

  const close = () => setModal({ type: null, item: null });

  const getStatusColor = (s: string) => {
    if (s === 'HEALTHY') return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    if (s === 'LOW') return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    if (s === 'CRITICAL') return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
    return 'text-slate-500 bg-slate-500/10 border-slate-500/30';
  };

  const totalHealthy = items.filter(i => i.status === 'HEALTHY').length;
  const totalCrit = items.filter(i => i.status === 'CRITICAL').length;
  const totalLow = items.filter(i => i.status === 'LOW').length;

  return (
    <div className="space-y-6 font-sans text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center">
            <Package className="w-5 h-5 mr-2 text-[var(--polar-cyan)]" /> Resource & Inventory Management
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
            Real-time tracking of fuel, equipment, medical supplies and base rations.
          </p>
        </div>
        <button
          onClick={() => setModal({ type: 'add', item: null })}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--polar-cyan)] hover:bg-cyan-400 text-[#0a0a09] font-mono font-bold text-xs rounded-xl shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" /> ADD INVENTORY
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: 'TOTAL ITEMS', v: items.length, c: 'text-[var(--text-primary)]' },
          { l: 'HEALTHY', v: totalHealthy, c: 'text-emerald-400' },
          { l: 'LOW STOCK', v: totalLow, c: 'text-amber-400' },
          { l: 'CRITICAL', v: totalCrit, c: 'text-rose-400' },
        ].map((s, i) => (
          <div key={i} className="bg-[var(--surface-primary)] border border-[var(--border-subtle)] p-4 rounded-xl shadow-sm">
            <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] tracking-widest">{s.l}</span>
            <p className={`text-2xl font-bold font-mono mt-1 ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Search / Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--text-muted)]" />
          <input className="w-full bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-lg pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--polar-cyan)]" placeholder="Search inventory by name, category or ID..." />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-secondary)]">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Items Table */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
              <tr className="text-[10px] font-mono font-bold text-[var(--text-muted)] tracking-wider">
                <th className="p-4">ITEM / LOCATION</th>
                <th className="p-4">CATEGORY</th>
                <th className="p-4">STOCK</th>
                <th className="p-4">RESERVED</th>
                <th className="p-4">STATUS</th>
                <th className="p-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-[var(--surface-elevated)] transition group">
                  <td className="p-4 cursor-pointer" onClick={() => setModal({ type: 'detail', item })}>
                    <p className="font-bold text-[var(--text-primary)] text-sm">{item.name}</p>
                    <p className="text-[10px] font-mono text-[var(--polar-cyan)] mt-0.5">{item.id} · {item.location}</p>
                  </td>
                  <td className="p-4 text-xs font-mono text-[var(--text-secondary)]">{item.category}</td>
                  <td className="p-4">
                    <p className="font-mono font-bold text-[var(--text-primary)]">{item.quantity.toLocaleString()} <span className="text-[10px]">{item.unit}</span></p>
                    <p className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">Burn: {item.consumptionRate}/d</p>
                  </td>
                  <td className="p-4 font-mono text-xs text-[var(--text-secondary)]">
                    {item.reservedQuantity ? `${item.reservedQuantity.toLocaleString()} ${item.unit}` : 'None'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => setModal({ type: 'allocate', item })} className="px-3 py-1 bg-[var(--surface-elevated)] hover:bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded text-[10px] font-mono font-bold text-[var(--text-secondary)] transition">RESERVE</button>
                      <button onClick={() => setModal({ type: 'adjust', item })} className="px-3 py-1 bg-[var(--surface-elevated)] hover:border-[var(--polar-cyan)] border border-[var(--border-subtle)] rounded text-[10px] font-mono font-bold text-[var(--polar-cyan)] transition">ADJUST</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resource Analytics Section */}
      <ResourceAnalytics items={items} />

      {modal.type === 'add' && <AddInventoryModal onClose={close} />}
      {modal.type === 'adjust' && modal.item && <AdjustStockModal item={modal.item} onClose={close} />}
      {modal.type === 'allocate' && modal.item && <AllocateModal item={modal.item} onClose={close} />}
      {modal.type === 'detail' && modal.item && <DetailModal item={modal.item} onClose={close} />}
    </div>
  );
};
