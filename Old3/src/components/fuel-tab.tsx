"use client";

import { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { addFuelLog, deleteFuelLog } from "@/actions/fuel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { fmtDate, fmtKm } from "@/lib/utils";
import type { FuelLog } from "@/lib/appwrite/types";

type Period = "week" | "month" | "year";

function periodKey(dateStr: string, period: Period) {
  const d = new Date(dateStr);
  if (period === "year") return `${d.getFullYear()}`;
  if (period === "month") return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  // semaine ISO approximative (suffisante pour un graphique, pas pour de la compta)
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((+d - +onejan) / 86400000) + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-S${String(week).padStart(2, "0")}`;
}

function periodLabel(key: string, period: Period) {
  if (period === "year") return key;
  if (period === "month") {
    const [y, m] = key.split("-");
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
  }
  return key.replace("-S", " S");
}

export function FuelTab({ vehicleId, fuelLogs }: { vehicleId: string; fuelLogs: FuelLog[] }) {
  const [period, setPeriod] = useState<Period>("month");
  const [open, setOpen] = useState(false);

  const sorted = useMemo(() => [...fuelLogs].sort((a, b) => +new Date(a.date) - +new Date(b.date)), [fuelLogs]);

  const stats = useMemo(() => {
    if (sorted.length === 0) return null;
    const totalSpent = sorted.reduce((s, f) => s + f.totalPrice, 0);
    const totalLiters = sorted.reduce((s, f) => s + f.liters, 0);
    const avgPricePerLiter = totalLiters > 0 ? totalSpent / totalLiters : 0;

    const fullTanks = sorted.filter((f) => f.fullTank);
    let consumptions: number[] = [];
    for (let i = 1; i < fullTanks.length; i++) {
      const kmDiff = fullTanks[i].km - fullTanks[i - 1].km;
      if (kmDiff > 0) consumptions.push((fullTanks[i].liters / kmDiff) * 100);
    }
    const avgConsumption = consumptions.length ? consumptions.reduce((a, b) => a + b, 0) / consumptions.length : null;

    return { totalSpent, avgPricePerLiter, avgConsumption };
  }, [sorted]);

  const chartData = useMemo(() => {
    const byPeriod = new Map<string, number>();
    for (const f of sorted) {
      const key = periodKey(f.date, period);
      byPeriod.set(key, (byPeriod.get(key) || 0) + f.totalPrice);
    }
    return Array.from(byPeriod.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([key, total]) => ({ key, label: periodLabel(key, period), total: Math.round(total * 100) / 100 }));
  }, [sorted, period]);

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total dépensé" value={`${stats.totalSpent.toFixed(2)} €`} />
          <StatCard label="Prix moyen / L" value={`${stats.avgPricePerLiter.toFixed(3)} €`} />
          <StatCard label="Conso. moyenne" value={stats.avgConsumption != null ? `${stats.avgConsumption.toFixed(1)} L/100km` : "—"} />
        </div>
      )}

      {chartData.length > 0 && (
        <div className="rounded-xl2 border border-border bg-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] uppercase tracking-wide text-muted font-mono">Dépenses par période</p>
            <div className="flex gap-1">
              {(["week", "month", "year"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border ${period === p ? "border-copper text-copper" : "border-border text-muted"}`}
                >
                  {p === "week" ? "Semaine" : p === "month" ? "Mois" : "Année"}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#2b2f36" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" stroke="#8b8f98" fontSize={11} tickLine={false} axisLine={{ stroke: "#2b2f36" }} />
              <YAxis stroke="#8b8f98" fontSize={11} tickLine={false} axisLine={false} width={40} />
              <Tooltip
                contentStyle={{ background: "#1c1f24", border: "1px solid #2b2f36", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`${v.toFixed(2)} €`, "Dépensé"]}
              />
              <Bar dataKey="total" fill="#c08552" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div>
        <Button variant="ghost" onClick={() => setOpen((o) => !o)}>
          {open ? "Fermer" : "+ Ajouter un plein"}
        </Button>
        {open && (
          <form
            action={async (fd) => { await addFuelLog(vehicleId, fd); setOpen(false); }}
            className="mt-4 rounded-xl2 border border-border bg-panel p-5 space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div>
                <Label htmlFor="km">Kilométrage</Label>
                <Input id="km" name="km" type="number" required placeholder="ex: 112450" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="liters">Litres</Label>
                <Input id="liters" name="liters" type="number" step="0.01" required placeholder="ex: 42.5" />
              </div>
              <div>
                <Label htmlFor="totalPrice">Prix total (€)</Label>
                <Input id="totalPrice" name="totalPrice" type="number" step="0.01" required placeholder="ex: 68.90" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs text-muted">
              <Checkbox name="fullTank" defaultChecked /> Plein complet (nécessaire pour calculer la consommation)
            </label>
            <Button type="submit">Enregistrer</Button>
          </form>
        )}
      </div>

      <div className="space-y-2">
        {[...sorted].reverse().map((f) => (
          <div key={f.id} className="rounded-xl2 border border-border bg-panel p-4 flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-sm font-semibold">
                {f.liters.toFixed(1)} L · {f.totalPrice.toFixed(2)} € {!f.fullTank && <span className="text-muted font-normal">(partiel)</span>}
              </p>
              <p className="text-xs text-muted">{fmtDate(f.date)} · {fmtKm(f.km)} · {(f.totalPrice / f.liters).toFixed(3)} €/L</p>
            </div>
            <form action={deleteFuelLog.bind(null, vehicleId, f.id)}>
              <button type="submit" className="text-xs text-muted underline underline-offset-2 hover:text-overdue">Supprimer</button>
            </form>
          </div>
        ))}
        {sorted.length === 0 && <p className="text-sm text-muted">Aucun plein enregistré pour le moment.</p>}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl2 border border-border bg-panel p-4">
      <p className="text-[11px] uppercase tracking-wide text-muted font-mono mb-1">{label}</p>
      <p className="font-mono font-bold text-lg">{value}</p>
    </div>
  );
}
