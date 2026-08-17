"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { sortedEntries } from "@/lib/maintenance/compute";
import { fmtDate, fmtKm } from "@/lib/utils";
import type { MaintenanceEntry } from "@/lib/appwrite/types";

export function KmEvolutionChart({ entries }: { entries: MaintenanceEntry[] }) {
  const data = sortedEntries(entries).map((e) => ({ date: e.date, km: e.km }));
  if (data.length < 2) return null;

  return (
    <div className="rounded-xl2 border border-border bg-panel p-5">
      <p className="text-[11px] uppercase tracking-wide text-muted font-mono mb-4">Évolution du kilométrage</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#2b2f36" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => new Date(d).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" })}
            stroke="#8b8f98" fontSize={11} tickLine={false} axisLine={{ stroke: "#2b2f36" }}
          />
          <YAxis
            tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            stroke="#8b8f98" fontSize={11} tickLine={false} axisLine={false} width={40}
          />
          <Tooltip
            contentStyle={{ background: "#1c1f24", border: "1px solid #2b2f36", borderRadius: 8, fontSize: 12 }}
            labelFormatter={(d) => fmtDate(d as string)}
            formatter={(v: number) => [fmtKm(v), "Kilométrage"]}
          />
          <Line type="monotone" dataKey="km" stroke="#c08552" strokeWidth={2} dot={{ r: 3, fill: "#c08552" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
