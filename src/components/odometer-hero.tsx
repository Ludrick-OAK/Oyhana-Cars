import { computeStats } from "@/lib/maintenance/compute";
import { fmtDate, fmtKm } from "@/lib/utils";
import { Download } from "lucide-react";
import type { MaintenanceEntry, Vehicle, FuelLog } from "@/lib/appwrite/types";

export function OdometerHero({
  vehicle, entries, fuelLogs = [],
}: { vehicle: Vehicle; entries: MaintenanceEntry[]; fuelLogs?: FuelLog[] }) {
  const points = [
    ...entries.map((e) => ({ date: e.date, km: e.km })),
    ...fuelLogs.map((f) => ({ date: f.date, km: f.km })),
  ];
  const stats = computeStats(points);

  return (
    <div className="rounded-xl2 border border-border bg-panel p-7 mb-8 relative overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-copper font-mono mb-1">Carnet d'entretien numérique</p>
          <h1 className="font-display uppercase text-3xl font-semibold mb-1">{vehicle.name}</h1>
        </div>
        <a
          href={`/api/export/${vehicle.id}`}
          className="shrink-0 inline-flex items-center gap-1.5 text-xs border border-border rounded-lg px-3 py-2 text-muted hover:border-copper hover:text-copper transition-colors"
        >
          <Download className="h-3.5 w-3.5" /> Export PDF
        </a>
      </div>

      <p className="text-[13.5px] text-muted mb-6">
        {[vehicle.engine, vehicle.fuelType, vehicle.transmission && `Boîte ${vehicle.transmission}${vehicle.gears ? " " + vehicle.gears + " rapports" : ""}`]
          .filter(Boolean).join(" · ")}
        {vehicle.firstRegistration && ` · Mise en circulation ${fmtDate(vehicle.firstRegistration)}`}
      </p>

      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted font-mono mb-1">Kilométrage actuel connu</p>
          <p className="font-mono font-bold text-4xl bg-[#0f1114] text-[#f2ead9] border border-border rounded-lg px-4 py-1 inline-block">
            {stats ? fmtKm(stats.last.km) : "— km"}
          </p>
          {stats && <p className="text-xs text-muted mt-1">relevé le {fmtDate(stats.last.date)}</p>}
        </div>
        {stats && (
          <div className="text-right">
            <p className="font-display text-2xl text-copper">{Math.round(stats.kmPerYear).toLocaleString("fr-FR")}</p>
            <p className="text-[11.5px] uppercase text-muted tracking-wide">km / an (moyenne)</p>
          </div>
        )}
      </div>
    </div>
  );
}
