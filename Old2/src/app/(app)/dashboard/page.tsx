import { Query } from "node-appwrite";
import { createSessionClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/config";
import { requireHousehold } from "@/lib/appwrite/household";
import { mapVehicle } from "@/lib/appwrite/mappers";
import { VehicleCard } from "@/components/vehicle-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const { household } = await requireHousehold();
  const { databases } = createSessionClient();

  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.vehicles, [
    Query.equal("householdId", household.id),
    Query.orderAsc("$createdAt"),
  ]);
  const vehicles = res.documents.map(mapVehicle);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-copper font-mono mb-1">{household.name}</p>
          <h1 className="font-display uppercase text-2xl font-semibold">Mes véhicules</h1>
        </div>
        <Link href="/vehicules/nouveau">
          <Button><Plus className="h-4 w-4" /> Ajouter un véhicule</Button>
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl2 p-10 text-center text-muted">
          <p className="mb-4">Aucun véhicule pour le moment.</p>
          <Link href="/vehicules/nouveau">
            <Button><Plus className="h-4 w-4" /> Ajouter mon premier véhicule</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
        </div>
      )}
    </div>
  );
}
