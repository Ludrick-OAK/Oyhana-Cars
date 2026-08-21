"use client";

import { fmtDate, fmtKm } from "@/lib/utils";
import { deleteEntry } from "@/actions/entries";
import type { MaintenanceEntry } from "@/lib/appwrite/types";

const TYPE_DOT: Record<string, string> = {
  ct: "border-[#5b87a6]",
  achat: "border-[#6fa97a]",
  revision: "border-copper",
  vidange: "border-copper",
  autre: "border-copper",
};

export function HistoryTimeline({ vehicleId, entries }: { vehicleId: string; entries: MaintenanceEntry[] }) {
  const sorted = [...entries].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  if (sorted.length === 0) {
    return <p className="text-sm text-muted">Aucune intervention enregistrée pour le moment.</p>;
  }

  return (
    <div className="relative pl-6 space-y-4">
      <div className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-gradient-to-b from-copper-dim to-border" />
      {sorted.map((e) => (
        <div key={e.id} className="relative">
          <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full bg-panel border-2 ${TYPE_DOT[e.type]}`} />
          <div className="rounded-xl2 border border-border bg-panel p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="font-semibold text-[14.5px]">{e.title}</p>
              <div>
                <span className="font-mono text-xs text-copper">{fmtDate(e.date)}</span>
                <span className="text-xs text-muted ml-2">{fmtKm(e.km)}</span>
              </div>
            </div>
            {e.items?.length > 0 && (
              <ul className="list-disc list-inside text-[13px] text-muted mt-2 space-y-1">
                {e.items.map((it, i) => <li key={i}>{it}</li>)}
              </ul>
            )}
            {e.note && <p className="text-[12.5px] text-muted italic mt-2">{e.note}</p>}
            <form action={deleteEntry.bind(null, vehicleId, e.id)}>
              <button type="submit" className="text-xs text-muted underline underline-offset-2 hover:text-overdue mt-3">
                Supprimer
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
