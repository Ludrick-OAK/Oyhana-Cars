/**
 * Importe le véhicule DS3 Crossback et son historique réel dans Appwrite.
 * À exécuter une seule fois, en local, après avoir :
 *   1. lancé `npm run setup:appwrite`
 *   2. créé ton compte sur l'application (npm run dev puis /register)
 *   3. renseigné SEED_USER_EMAIL dans .env.local
 *
 *   npm run seed:ds3
 */
import { Client, Databases, Users, Query, Permission, Role, ID } from "node-appwrite";
import dotenv from "dotenv";
import { DEFAULT_RULES, DEFAULT_MINICHECKS } from "../src/lib/maintenance/default-rules";

dotenv.config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const users = new Users(client);
const DATABASE_ID = "oyhana_cars";
const SEED_USER_EMAIL = process.env.SEED_USER_EMAIL!;

const ENTRIES = [
  { date: "2019-09-24", km: 0, type: "achat", title: "Mise en circulation", items: [], note: "Première mise en circulation du véhicule." },
  { date: "2022-06-02", km: 36587, type: "revision", title: "Révision DS — opérations systématiques", items: ["Liquide de frein (remplacement)", "Filtre habitacle (remplacement)", "Pneus arrière Michelin x2 (remplacement + équilibrage)"], note: "" },
  { date: "2023-06-12", km: 51991, type: "revision", title: "Révision constructeur + points de contrôle", items: ["RAZ indicateur maintenance", "Huile moteur (vidange)", "Filtre à huile (remplacement)", "Filtre à air (remplacement)", "Bougies d'allumage (remplacement)", "Filtre habitacle (remplacement)"], note: "" },
  { date: "2023-09-20", km: 61119, type: "ct", title: "Contrôle technique", items: [], note: "Résultat renseigné a posteriori (mentionné sur le CT du 11/06/2024)." },
  { date: "2024-06-03", km: 73381, type: "revision", title: "Révision 90 points de contrôle", items: ["Bouchon de vidange (remplacement)", "Filtre à huile (remplacement)", "Huile moteur (vidange)", "Filtre à pollen (remplacement)", "Lave-glace (appoint)", "Liquide de frein (remplacement)", "Pneus avant Firestone x2 (remplacement)"], note: "Réalisée par la concession, avant l'achat du véhicule." },
  { date: "2024-06-11", km: 73376, type: "ct", title: "Contrôle technique", items: [], note: "Contrôle réalisé le 10/06/2024 par la concession, document daté du 11/06/2024." },
  { date: "2024-07-13", km: 73381, type: "achat", title: "Achat du véhicule (occasion)", items: [], note: "" },
  { date: "2025-07-04", km: 91529, type: "revision", title: "Révision + vidange", items: ["Huile moteur (vidange)", "Filtre à huile (remplacement)", "Filtre à air (remplacement)", "Filtre habitacle (remplacement)", "Bougies d'allumage (remplacement)", "Kit de distribution / courroie (remplacement)", "Liquide de refroidissement (remplacement)", "Balais d'essuie-glace (remplacement)"], note: "" },
  { date: "2026-06-20", km: 107112, type: "ct", title: "Contrôle technique", items: [], note: "Défaut relevé : capuchon anti-poussière transmission avant droite détérioré." },
  { date: "2026-07-20", km: 108123, type: "revision", title: "Révision + contrôle des 4 pneus", items: ["RAZ indicateur maintenance", "Lave-glace (appoint)", "Liquide de refroidissement (appoint)", "Filtre habitacle (remplacement)", "Filtre à huile (remplacement)", "Contrôle des 4 pneus"], note: "" },
];

async function main() {
  if (!SEED_USER_EMAIL) throw new Error("SEED_USER_EMAIL manquant dans .env.local");

  const found = await users.list([Query.equal("email", SEED_USER_EMAIL)]);
  const user = found.users[0];
  if (!user) throw new Error(`Utilisateur ${SEED_USER_EMAIL} introuvable — crée ton compte via /register d'abord.`);

  const householdId = (user.prefs as any)?.householdId;
  if (!householdId) throw new Error("Ce compte n'a pas encore de foyer (householdId manquant dans les prefs).");

  const household = await databases.getDocument(DATABASE_ID, "households", householdId);
  const perms = (household.memberIds as string[]).flatMap((uid) => [
    Permission.read(Role.user(uid)), Permission.update(Role.user(uid)), Permission.delete(Role.user(uid)),
  ]);

  const vehicle = await databases.createDocument(DATABASE_ID, "vehicles", ID.unique(), {
    householdId,
    name: "DS3 Crossback",
    brand: "DS Automobiles",
    model: "DS3 Crossback",
    engine: "1.2 PureTech THP 12V S&S",
    powerHp: 101,
    fuelType: "essence",
    transmission: "manuelle",
    gears: 6,
    firstRegistration: "2019-09-24",
    purchaseDate: "2024-07-13",
  }, perms);

  await Promise.all([
    ...ENTRIES.map((e) =>
      databases.createDocument(DATABASE_ID, "maintenance_entries", ID.unique(), { ...e, vehicleId: vehicle.$id, createdBy: user.$id }, perms)
    ),
    ...DEFAULT_RULES.map((r) =>
      databases.createDocument(DATABASE_ID, "maintenance_rules", ID.unique(), { ...r, vehicleId: vehicle.$id }, perms)
    ),
    ...DEFAULT_MINICHECKS.map((m) =>
      databases.createDocument(DATABASE_ID, "mini_checks", ID.unique(), { ...m, vehicleId: vehicle.$id }, perms)
    ),
    databases.createDocument(DATABASE_ID, "manufacturer_integrations", ID.unique(), { vehicleId: vehicle.$id, provider: "stellantis", status: "disconnected" }, perms),
  ]);

  console.log(`✅ Véhicule "DS3 Crossback" importé avec ${ENTRIES.length} interventions (id: ${vehicle.$id})`);
}

main().catch((e) => { console.error("❌", e.message); process.exit(1); });
