"use client";

import { useState } from "react";
import { addRule, deleteRule } from "@/actions/rules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { fmtKm } from "@/lib/utils";
import type { MaintenanceRule } from "@/lib/appwrite/types";

export function RulesManager({ vehicleId, rules }: { vehicleId: string; rules: MaintenanceRule[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl2 border border-border bg-panel p-1">
      <div className="px-4">
        {rules.map((r) => {
          const parts: string[] = [];
          if (r.intervalKm) parts.push(fmtKm(r.intervalKm));
          if (r.intervalMonths) parts.push(`${r.intervalMonths} mois`);
          const meta = r.matchType ? "Basé sur le type d'intervention" : parts.join(" · ") || "Aucun intervalle";
          return (
            <div key={r.id} className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-0">
              <div>
                <p className="text-[13.5px] font-semibold">{r.label}</p>
                <p className="text-[11.5px] font-mono text-muted">{meta}</p>
              </div>
              {!r.matchType && (
                <form action={deleteRule.bind(null, vehicleId, r.id)}>
                  <button type="submit" className="text-xs text-muted underline underline-offset-2 hover:text-overdue">
                    Supprimer
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4">
        <Button variant="ghost" onClick={() => setOpen((o) => !o)}>
          {open ? "Fermer" : "+ Ajouter un élément à surveiller"}
        </Button>

        {open && (
          <form
            action={async (fd) => { await addRule(vehicleId, fd); setOpen(false); }}
            className="mt-4 space-y-3 border-t border-border pt-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="label">Nom de l'élément</Label>
                <Input id="label" name="label" required placeholder="ex: Amortisseurs avant" />
              </div>
              <div>
                <Label htmlFor="keywords">Mots-clés de détection</Label>
                <Input id="keywords" name="keywords" required placeholder="amortisseur avant" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="km">Intervalle (km)</Label>
                <Input id="km" name="km" type="number" placeholder="ex: 60000" />
              </div>
              <div>
                <Label htmlFor="months">Intervalle (mois)</Label>
                <Input id="months" name="months" type="number" placeholder="ex: 24" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs text-muted">
              <Checkbox name="only_replacement" /> Ignorer les mentions "appoint"
            </label>
            <Button type="submit" size="sm">Ajouter au suivi</Button>
          </form>
        )}
      </div>
    </div>
  );
}
