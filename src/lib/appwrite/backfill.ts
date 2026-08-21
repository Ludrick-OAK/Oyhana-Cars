import "server-only";
import { Query, Permission, Role } from "node-appwrite";
import { createAdminClient } from "./server";
import { DATABASE_ID, COLLECTIONS, PHOTOS_BUCKET_ID } from "./config";
import { householdPermissions } from "./permissions";

const VEHICLE_SCOPED_COLLECTIONS = [
  COLLECTIONS.entries, COLLECTIONS.rules, COLLECTIONS.minichecks,
  COLLECTIONS.integrations, COLLECTIONS.telemetry, COLLECTIONS.fuelLogs,
];

// Ré-applique les permissions du foyer à TOUTES les données déjà existantes
// (véhicules + tout ce qui en dépend + photos). Nécessaire quand un nouveau
// membre rejoint un foyer qui contenait déjà des données : les documents créés
// avant son arrivée ne listaient pas encore son user ID dans leurs permissions.
export async function backfillHouseholdPermissions(householdId: string, memberIds: string[]) {
  const { databases, storage } = createAdminClient();
  const perms = householdPermissions(memberIds);

  const vehiclesRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.vehicles, [
    Query.equal("householdId", householdId), Query.limit(200),
  ]);

  for (const vehicle of vehiclesRes.documents) {
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.vehicles, vehicle.$id, {}, perms);

    for (const col of VEHICLE_SCOPED_COLLECTIONS) {
      const docs = await databases.listDocuments(DATABASE_ID, col, [
        Query.equal("vehicleId", vehicle.$id), Query.limit(500),
      ]);
      await Promise.all(docs.documents.map((d) => databases.updateDocument(DATABASE_ID, col, d.$id, {}, perms)));
    }

    const photoIds: string[] = vehicle.photoFileIds || [];
    const photoPerms = [
      Permission.read(Role.any()),
      ...memberIds.flatMap((uid) => [Permission.update(Role.user(uid)), Permission.delete(Role.user(uid))]),
    ];
    await Promise.all(
      photoIds.map((fid) => storage.updateFile(PHOTOS_BUCKET_ID, fid, undefined, photoPerms).catch(() => {}))
    );
  }
}
