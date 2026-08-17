import { fmtDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Gauge, Fuel, BatteryCharging, Lock } from "lucide-react";
import type { ManufacturerIntegration, VehicleTelemetry } from "@/lib/appwrite/types";

export function ManufacturerTab({
  integration,
  telemetry,
}: {
  integration: ManufacturerIntegration | null;
  telemetry: VehicleTelemetry | null;
}) {
  const connected = integration?.status === "connected";

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold">Compte constructeur (My DS / MyPeugeot / MyCitroën...)</p>
            <Badge status={connected ? "ok" : "unknown"}>{connected ? "Connecté" : "Non connecté"}</Badge>
          </div>
          <p className="text-[13px] text-muted mb-4">
            Stellantis ne propose pas d'API publique officielle pour les particuliers. Cet onglet est prêt à
            recevoir les données une fois une synchronisation mise en place — voir le README du projet, section
            « Intégration constructeur », pour les options réalistes (webhook maison, projet communautaire
            open-source, ou saisie manuelle du kilométrage relevé dans l'app officielle).
          </p>
          {integration?.lastSyncAt && (
            <p className="text-xs text-muted">Dernière synchronisation : {fmtDate(integration.lastSyncAt)}</p>
          )}
          {integration?.lastError && (
            <p className="text-xs text-overdue mt-1">Erreur : {integration.lastError}</p>
          )}
        </CardContent>
      </Card>

      {telemetry ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <TelemetryStat icon={<Gauge className="h-4 w-4" />} label="Kilométrage" value={telemetry.odometerKm ? `${Math.round(telemetry.odometerKm).toLocaleString("fr-FR")} km` : "—"} />
          <TelemetryStat icon={<Fuel className="h-4 w-4" />} label="Carburant" value={telemetry.fuelLevelPct != null ? `${telemetry.fuelLevelPct}%` : "—"} />
          <TelemetryStat icon={<BatteryCharging className="h-4 w-4" />} label="Batterie 12V" value={telemetry.batteryLevelPct != null ? `${telemetry.batteryLevelPct}%` : "—"} />
          <TelemetryStat icon={<Lock className="h-4 w-4" />} label="Portes" value={telemetry.doorsLocked == null ? "—" : telemetry.doorsLocked ? "Verrouillées" : "Déverrouillées"} />
        </div>
      ) : (
        <Card>
          <CardContent className="p-5 text-sm text-muted">
            Aucune donnée constructeur reçue pour l'instant. Une fois la synchronisation branchée, le
            kilométrage remonté ici pourra même être utilisé pour affiner automatiquement les prédictions
            d'entretien de l'onglet "Vue d'ensemble".
          </CardContent>
        </Card>
      )}

      <a
        href="https://github.com/flobz/psa_car_controller"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-copper hover:underline"
      >
        Exemple de projet open-source pour dialoguer avec les API PSA/Stellantis <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

function TelemetryStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 text-muted mb-2">{icon}<span className="text-[11px] uppercase tracking-wide">{label}</span></div>
        <p className="font-mono font-bold text-lg">{value}</p>
      </CardContent>
    </Card>
  );
}
