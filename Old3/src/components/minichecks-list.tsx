"use client";

import { useState } from "react";
import { markMiniCheckDone, addMiniCheck } from "@/actions/minichecks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fmtDate } from "@/lib/utils";
import { miniCheckStatus } from "@/lib/maintenance/compute";
import type { MiniCheck } from "@/lib/appwrite/types";

export function MiniChecksList({ vehicleId, minichecks }: { vehicleId: string; minichecks: MiniCheck[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl2 border border-border bg-panel p-1">
      <div className="px-4">
        {minichecks.map((mc) => {
          const { status, remaining } = miniCheckStatus(mc.lastDone, mc.intervalDays);
          const label = status === "unknown" ? "Jamais noté" : status === "overdue" ? "À faire" : `Dans ${remaining} j`;
          return (
            <div key={mc.id} className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-0 flex-wrap">
              <div>
                <p className="text-[13.5px] font-semibold">{mc.label}</p>
                <p className="text-[11.5px] text-muted">
                  {mc.lastDone ? `Dernier contrôle : ${fmtDate(mc.lastDone)}` : "Aucun contrôle enregistré"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge status={status as any}>{label}</Badge>
                <form action={markMiniCheckDone.bind(null, vehicleId, mc.id)}>
                  <Button type="submit" variant="ghost" size="sm">Fait aujourd'hui</Button>
                </form>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4">
        <Button variant="ghost" size="sm" onClick={() => setOpen((o) => !o)}>
          {open ? "Fermer" : "+ Ajouter un mini contrôle"}
        </Button>
        {open && (
          <form
            action={async (fd) => { await addMiniCheck(vehicleId, fd); setOpen(false); }}
            className="mt-3 flex gap-2"
          >
            <Input name="label" placeholder="ex: Vérifier la jauge AdBlue" required />
            <Button type="submit" size="sm">Ajouter</Button>
          </form>
        )}
      </div>
    </div>
  );
}
