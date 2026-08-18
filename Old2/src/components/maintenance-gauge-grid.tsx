"use client";

import { useState } from "react";
import { computeAllDues, findAllMatches, type DueResult } from "@/lib/maintenance/compute";
import { fmtDate, fmtKm } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { MaintenanceEntry, MaintenanceRule, FuelLog } from "@/lib/appwrite/types";

const STATUS_LABEL: Record<string, string> = {
  ok: "OK",
  soon: "Bientôt",
  overdue: "Dépassé",
  unknown: "Non renseigné",
};

function statusText(d: DueResult) {
  if (d.status === "overdue") return "À faire";
  if (d.daysRemaining! < 30) return `Dans ${d.daysRemaining} j`;
  const months = Math.round(d.daysRemaining! / 30.44);
  return `Dans ~${months} mois`;
}

function Dial({ progress, status }: { progress: number; status: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const colors: Record<string, string> = { ok: "#6fa97a", soon: "#d9a441", overdue: "#c1554f", unknown: "#8b8f98" };

  if (status === "unknown") {
    return (
      <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#2b2f36" strokeWidth="6" strokeDasharray="4 5" />
        <text x="32" y="37" textAnchor="middle" fontSize="10" fontWeight="700" fill="#8b8f98">?</text>
      </svg>
    );
  }
  const offset = c * (1 - progress);
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0">
      <circle cx="32" cy="32" r={r} fill="none" stroke="#2b2f36" strokeWidth="6" />
      <circle
        cx="32" cy="32" r={r} fill="none" stroke={colors[status]} strokeWidth="6"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
        transform="rotate(-90 32 32)"
      />
      <text x="32" y="37" textAnchor="middle" fontSize="13" fontWeight="700" fill={colors[status]}>
        {Math.round(progress * 100)}%
      </text>
    </svg>
  );
}

export function MaintenanceGaugeGrid({
  rules, entries, fuelLogs = [],
}: { rules: MaintenanceRule[]; entries: MaintenanceEntry[]; fuelLogs?: FuelLog[] }) {
  const [openRule, setOpenRule] = useState<MaintenanceRule | null>(null);
  const dues = computeAllDues(rules, entries, new Date(), fuelLogs.map((f) => ({ date: f.date, km: f.km })));
  const matches = openRule ? findAllMatches(openRule, entries) : [];
  const openDue = dues.find((d) => d.rule.id === openRule?.id);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {dues.map((d) => (
          <button
            key={d.rule.id}
            onClick={() => setOpenRule(d.rule)}
            className="text-left rounded-xl2 border border-border bg-panel p-4 hover:border-copper transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <p className="text-sm font-semibold leading-snug">{d.rule.label}</p>
              <Badge status={d.status as any}>{STATUS_LABEL[d.status]}</Badge>
            </div>
            <div className="flex items-center gap-3">
              <Dial progress={d.progress || 0} status={d.status} />
              <div className="min-w-0">
                {d.unknown ? (
                  <>
                    <p className="text-[13px] text-muted">Aucune donnée</p>
                    <p className="text-[11px] text-muted">Ajoutez une intervention pour activer le suivi</p>
                  </>
                ) : (
                  <>
                    <p className="font-mono font-bold text-[15px]">{statusText(d)}</p>
                    <p className="text-[11px] text-muted">
                      {d.kmRemaining != null ? `${d.kmRemaining > 0 ? fmtKm(d.kmRemaining) + " restants" : "km atteint"} · ` : ""}
                      éch. {fmtDate(d.dueDate!)}
                    </p>
                  </>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!openRule} onOpenChange={(o) => !o && setOpenRule(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{openRule?.label}</DialogTitle>
          </DialogHeader>

          {openDue && !openDue.unknown && (
            <div className="flex gap-6 mb-4 pb-4 border-b border-border">
              <div>
                <p className="text-[11px] uppercase text-muted mb-1">Prochaine échéance</p>
                <p className="font-mono font-bold text-copper">{fmtDate(openDue.dueDate!)}</p>
              </div>
              {openDue.kmRemaining != null && (
                <div>
                  <p className="text-[11px] uppercase text-muted mb-1">Km restants</p>
                  <p className="font-mono font-bold text-copper">
                    {openDue.kmRemaining > 0 ? fmtKm(openDue.kmRemaining) : "atteint"}
                  </p>
                </div>
              )}
            </div>
          )}

          {matches.length === 0 ? (
            <p className="text-sm text-muted">Aucune intervention enregistrée pour ce poste pour le moment.</p>
          ) : (
            <>
              <p className="text-[11px] uppercase text-muted mb-2">Historique ({matches.length})</p>
              <div className="space-y-2">
                {matches.map((m, i) => (
                  <div key={i} className="grid grid-cols-[80px_90px_1fr] gap-2 items-baseline bg-panel2 rounded-lg px-3 py-2">
                    <span className="font-mono text-[11px] text-copper">{fmtDate(m.entry.date)}</span>
                    <span className="font-mono text-[11px] text-muted">{fmtKm(m.entry.km)}</span>
                    <span className="text-[12px]">{m.matchedItem || m.entry.title}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
