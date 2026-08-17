/**
 * Crée la base de données, les collections, attributs, index et permissions
 * dans votre projet Appwrite Cloud — l'équivalent de la migration SQL qu'on
 * aurait avec Supabase. À exécuter UNE FOIS, après avoir renseigné .env.local.
 *
 *   npm run setup:appwrite
 *
 * Le script est ré-exécutable sans risque : il ignore ce qui existe déjà.
 */
import { Client, Databases, Storage, Permission, Role, IndexType } from "node-appwrite";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const storage = new Storage(client);
const DATABASE_ID = "oyhana_cars";

async function ignoreIfExists<T>(p: Promise<T>) {
  try { await p; } catch (e: any) { if (e.code !== 409) throw e; }
}

async function ensureCollection(id: string, name: string, documentSecurity = true) {
  await ignoreIfExists(
    databases.createCollection(DATABASE_ID, id, name, [Permission.create(Role.users())], documentSecurity)
  );
}

type Attr =
  | { kind: "string"; key: string; size: number; required: boolean; array?: boolean }
  | { kind: "float"; key: string; required: boolean }
  | { kind: "integer"; key: string; required: boolean }
  | { kind: "boolean"; key: string; required: boolean; default?: boolean }
  | { kind: "datetime"; key: string; required: boolean };

async function ensureAttributes(collectionId: string, attrs: Attr[]) {
  for (const a of attrs) {
    if (a.kind === "string") {
      await ignoreIfExists(databases.createStringAttribute(DATABASE_ID, collectionId, a.key, a.size, a.required, undefined, a.array));
    } else if (a.kind === "float") {
      await ignoreIfExists(databases.createFloatAttribute(DATABASE_ID, collectionId, a.key, a.required));
    } else if (a.kind === "integer") {
      await ignoreIfExists(databases.createIntegerAttribute(DATABASE_ID, collectionId, a.key, a.required));
    } else if (a.kind === "boolean") {
      await ignoreIfExists(databases.createBooleanAttribute(DATABASE_ID, collectionId, a.key, a.required, a.default));
    } else if (a.kind === "datetime") {
      await ignoreIfExists(databases.createDatetimeAttribute(DATABASE_ID, collectionId, a.key, a.required));
    }
  }
  await waitForAttributesAvailable(collectionId, attrs.map((a) => a.key));
}

// Attend que tous les attributs listés soient passés au statut "available"
// avant de continuer (sinon la création d'un index dessus échoue avec
// "attribute_not_available"). Timeout de sécurité à 60s.
async function waitForAttributesAvailable(collectionId: string, keys: string[], timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await databases.listAttributes(DATABASE_ID, collectionId);
    const byKey = new Map(res.attributes.map((a: any) => [a.key, a.status]));
    const allReady = keys.every((k) => byKey.get(k) === "available");
    if (allReady) return;
    await new Promise((r) => setTimeout(r, 1500));
  }
  console.warn(`⚠️  Timeout en attendant les attributs de "${collectionId}" — relance le script si l'étape suivante échoue.`);
}

async function main() {
  console.log("→ Base de données");
  await ignoreIfExists(databases.create(DATABASE_ID, "Oyhana Cars"));

  console.log("→ Collection: households");
  await ensureCollection("households", "Households");
  await ensureAttributes("households", [
    { kind: "string", key: "name", size: 128, required: true },
    { kind: "string", key: "inviteCode", size: 16, required: true },
    { kind: "string", key: "memberIds", size: 64, required: false, array: true },
  ]);

  console.log("→ Collection: vehicles");
  await ensureCollection("vehicles", "Vehicles");
  await ensureAttributes("vehicles", [
    { kind: "string", key: "householdId", size: 64, required: true },
    { kind: "string", key: "name", size: 128, required: true },
    { kind: "string", key: "brand", size: 64, required: false },
    { kind: "string", key: "model", size: 64, required: false },
    { kind: "string", key: "engine", size: 128, required: false },
    { kind: "integer", key: "powerHp", required: false },
    { kind: "string", key: "fuelType", size: 32, required: false },
    { kind: "string", key: "transmission", size: 32, required: false },
    { kind: "integer", key: "gears", required: false },
    { kind: "string", key: "firstRegistration", size: 16, required: false },
    { kind: "string", key: "purchaseDate", size: 16, required: false },
    { kind: "string", key: "photoFileIds", size: 64, required: false, array: true },
    { kind: "boolean", key: "manufacturerEnabled", required: false, default: true },
  ]);
  await ignoreIfExists(databases.createIndex(DATABASE_ID, "vehicles", "by_household", IndexType.Key, ["householdId"]));

  console.log("→ Collection: maintenance_entries");
  await ensureCollection("maintenance_entries", "Maintenance Entries");
  await ensureAttributes("maintenance_entries", [
    { kind: "string", key: "vehicleId", size: 64, required: true },
    { kind: "string", key: "date", size: 16, required: true },
    { kind: "float", key: "km", required: true },
    { kind: "string", key: "type", size: 16, required: true },
    { kind: "string", key: "title", size: 256, required: true },
    { kind: "string", key: "items", size: 512, required: false, array: true },
    { kind: "string", key: "note", size: 1024, required: false },
    { kind: "string", key: "createdBy", size: 64, required: false },
  ]);
  await ignoreIfExists(databases.createIndex(DATABASE_ID, "maintenance_entries", "by_vehicle", IndexType.Key, ["vehicleId"]));

  console.log("→ Collection: maintenance_rules");
  await ensureCollection("maintenance_rules", "Maintenance Rules");
  await ensureAttributes("maintenance_rules", [
    { kind: "string", key: "vehicleId", size: 64, required: true },
    { kind: "string", key: "key", size: 128, required: true },
    { kind: "string", key: "label", size: 128, required: true },
    { kind: "string", key: "match", size: 128, required: false, array: true },
    { kind: "string", key: "matchType", size: 16, required: false },
    { kind: "boolean", key: "onlyReplacement", required: false, default: false },
    { kind: "float", key: "intervalKm", required: false },
    { kind: "float", key: "intervalMonths", required: false },
    { kind: "boolean", key: "isDefault", required: false, default: false },
  ]);
  await ignoreIfExists(databases.createIndex(DATABASE_ID, "maintenance_rules", "by_vehicle", IndexType.Key, ["vehicleId"]));

  console.log("→ Collection: mini_checks");
  await ensureCollection("mini_checks", "Mini Checks");
  await ensureAttributes("mini_checks", [
    { kind: "string", key: "vehicleId", size: 64, required: true },
    { kind: "string", key: "label", size: 128, required: true },
    { kind: "integer", key: "intervalDays", required: true },
    { kind: "string", key: "lastDone", size: 16, required: false },
    { kind: "string", key: "lastDoneBy", size: 64, required: false },
  ]);
  await ignoreIfExists(databases.createIndex(DATABASE_ID, "mini_checks", "by_vehicle", IndexType.Key, ["vehicleId"]));

  console.log("→ Collection: manufacturer_integrations");
  await ensureCollection("manufacturer_integrations", "Manufacturer Integrations");
  await ensureAttributes("manufacturer_integrations", [
    { kind: "string", key: "vehicleId", size: 64, required: true },
    { kind: "string", key: "provider", size: 32, required: true },
    { kind: "string", key: "externalVehicleId", size: 128, required: false },
    { kind: "string", key: "status", size: 16, required: true },
    { kind: "datetime", key: "lastSyncAt", required: false },
    { kind: "string", key: "lastError", size: 512, required: false },
  ]);
  await ignoreIfExists(databases.createIndex(DATABASE_ID, "manufacturer_integrations", "by_vehicle", IndexType.Key, ["vehicleId"]));

  console.log("→ Collection: vehicle_telemetry");
  await ensureCollection("vehicle_telemetry", "Vehicle Telemetry");
  await ensureAttributes("vehicle_telemetry", [
    { kind: "string", key: "vehicleId", size: 64, required: true },
    { kind: "float", key: "odometerKm", required: false },
    { kind: "float", key: "fuelLevelPct", required: false },
    { kind: "float", key: "batteryLevelPct", required: false },
    { kind: "boolean", key: "doorsLocked", required: false },
    { kind: "float", key: "latitude", required: false },
    { kind: "float", key: "longitude", required: false },
    { kind: "datetime", key: "syncedAt", required: true },
  ]);
  await ignoreIfExists(databases.createIndex(DATABASE_ID, "vehicle_telemetry", "by_vehicle", IndexType.Key, ["vehicleId"]));

  console.log("→ Collection: fuel_logs");
  await ensureCollection("fuel_logs", "Fuel Logs");
  await ensureAttributes("fuel_logs", [
    { kind: "string", key: "vehicleId", size: 64, required: true },
    { kind: "string", key: "date", size: 16, required: true },
    { kind: "float", key: "km", required: true },
    { kind: "float", key: "liters", required: true },
    { kind: "float", key: "totalPrice", required: true },
    { kind: "boolean", key: "fullTank", required: false, default: true },
  ]);
  await ignoreIfExists(databases.createIndex(DATABASE_ID, "fuel_logs", "by_vehicle", IndexType.Key, ["vehicleId"]));

  console.log("→ Bucket: vehicle_photos");
  await ignoreIfExists(
    storage.createBucket(
      "vehicle_photos",
      "Vehicle Photos",
      [Permission.create(Role.users())],
      true,                                    // fileSecurity : permissions gérées par fichier
      true,                                     // enabled
      5 * 1024 * 1024,                          // 5 Mo max par photo
      ["jpg", "jpeg", "png", "webp"]
    )
  );

  console.log("\n✅ Terminé. Base, collections, attributs, index, bucket et permissions sont prêts.");
}

main().catch((e) => { console.error("❌", e); process.exit(1); });
