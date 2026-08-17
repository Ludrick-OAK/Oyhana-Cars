"use client";

import { useState } from "react";
import { toggleManufacturerTab, deleteVehicle } from "@/actions/vehicles";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function VehicleSettingsCard({ vehicleId, manufacturerEnabled }: { vehicleId: string; manufacturerEnabled: boolean }) {
  const [enabled, setEnabled] = useState(manufacturerEnabled);
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Card>
      <CardContent className="p-5 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[13.5px] font-semibold">Onglet "Constructeur"</p>
            <p className="text-[11.5px] text-muted">Affiche ou masque l'onglet My DS / MyPeugeot / MyCitroën pour ce véhicule.</p>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={async () => {
              setPending(true);
              const next = !enabled;
              setEnabled(next);
              await toggleManufacturerTab(vehicleId, next);
              setPending(false);
            }}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${enabled ? "bg-copper" : "bg-border"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-[#171310] transition-transform ${enabled ? "translate-x-[22px]" : "translate-x-0.5"}`} />
          </button>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-[13.5px] font-semibold text-overdue mb-1">Zone dangereuse</p>
          <p className="text-[11.5px] text-muted mb-3">
            Supprime définitivement ce véhicule, son historique, ses photos et toutes ses données associées. Irréversible.
          </p>
          {!confirmDelete ? (
            <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-3.5 w-3.5" /> Supprimer ce véhicule
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <form action={deleteVehicle.bind(null, vehicleId)}>
                <Button variant="destructive" size="sm" type="submit">Confirmer la suppression</Button>
              </form>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Annuler</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
