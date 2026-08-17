import { Query } from "node-appwrite";
import { notFound } from "next/navigation";
import { createSessionClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/config";
import {
  mapVehicle, mapEntry, mapRule, mapMiniCheck, mapIntegration, mapTelemetry, mapFuelLog,
} from "@/lib/appwrite/mappers";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OdometerHero } from "@/components/odometer-hero";
import { MaintenanceGaugeGrid } from "@/components/maintenance-gauge-grid";
import { HistoryTimeline } from "@/components/history-timeline";
import { AddEntryForm } from "@/components/add-entry-form";
import { RulesManager } from "@/components/rules-manager";
import { MiniChecksList } from "@/components/minichecks-list";
import { ManufacturerTab } from "@/components/manufacturer-tab";
import { RealtimeRefresher } from "@/components/realtime-refresher";
import { PhotoGallery } from "@/components/photo-gallery";
import { KmEvolutionChart } from "@/components/km-evolution-chart";
import { FuelTab } from "@/components/fuel-tab";
import { VehicleSettingsCard } from "@/components/vehicle-settings-card";

export default async function VehiclePage({ params }: { params: { vehicleId: string } }) {
  const { databases } = createSessionClient();
  const byVehicle = [Query.equal("vehicleId", params.vehicleId), Query.limit(500)];

  let vehicleDoc;
  try {
    vehicleDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.vehicles, params.vehicleId);
  } catch {
    notFound();
  }

  const [entriesRes, rulesRes, minichecksRes, integrationRes, telemetryRes, fuelRes] = await Promise.all([
    databases.listDocuments(DATABASE_ID, COLLECTIONS.entries, byVehicle),
    databases.listDocuments(DATABASE_ID, COLLECTIONS.rules, byVehicle),
    databases.listDocuments(DATABASE_ID, COLLECTIONS.minichecks, byVehicle),
    databases.listDocuments(DATABASE_ID, COLLECTIONS.integrations, byVehicle),
    databases.listDocuments(DATABASE_ID, COLLECTIONS.telemetry, [...byVehicle, Query.orderDesc("syncedAt"), Query.limit(1)]),
    databases.listDocuments(DATABASE_ID, COLLECTIONS.fuelLogs, byVehicle),
  ]);

  const vehicle = mapVehicle(vehicleDoc!);
  const entries = entriesRes.documents.map(mapEntry);
  const rules = rulesRes.documents.map(mapRule);
  const minichecks = minichecksRes.documents.map(mapMiniCheck);
  const integration = integrationRes.documents[0] ? mapIntegration(integrationRes.documents[0]) : null;
  const telemetry = telemetryRes.documents[0] ? mapTelemetry(telemetryRes.documents[0]) : null;
  const fuelLogs = fuelRes.documents.map(mapFuelLog);

  return (
    <div>
      <RealtimeRefresher vehicleId={vehicle.id} />
      <OdometerHero vehicle={vehicle} entries={entries} />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="rules">Éléments à surveiller</TabsTrigger>
          <TabsTrigger value="minichecks">Mini contrôles</TabsTrigger>
          <TabsTrigger value="fuel">Carburant</TabsTrigger>
          {vehicle.manufacturerEnabled && <TabsTrigger value="manufacturer">Constructeur</TabsTrigger>}
          <TabsTrigger value="settings">Réglages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <MaintenanceGaugeGrid rules={rules} entries={entries} />
          <KmEvolutionChart entries={entries} />
        </TabsContent>

        <TabsContent value="history">
          <AddEntryForm vehicleId={vehicle.id} />
          <HistoryTimeline vehicleId={vehicle.id} entries={entries} />
        </TabsContent>

        <TabsContent value="rules">
          <RulesManager vehicleId={vehicle.id} rules={rules} />
        </TabsContent>

        <TabsContent value="minichecks">
          <MiniChecksList vehicleId={vehicle.id} minichecks={minichecks} />
        </TabsContent>

        <TabsContent value="fuel">
          <FuelTab vehicleId={vehicle.id} fuelLogs={fuelLogs} />
        </TabsContent>

        {vehicle.manufacturerEnabled && (
          <TabsContent value="manufacturer">
            <ManufacturerTab integration={integration} telemetry={telemetry} />
          </TabsContent>
        )}

        <TabsContent value="settings" className="space-y-6">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted font-mono mb-3">Photos</p>
            <PhotoGallery vehicleId={vehicle.id} photoFileIds={vehicle.photoFileIds} />
          </div>
          <VehicleSettingsCard vehicleId={vehicle.id} manufacturerEnabled={vehicle.manufacturerEnabled} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
