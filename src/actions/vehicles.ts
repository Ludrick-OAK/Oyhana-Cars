"use server";

import { ID, Query } from "node-appwrite";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS, PHOTOS_BUCKET_ID } from "@/lib/appwrite/config";
import { requireHousehold } from "@/lib/appwrite/household";
import { householdPermissions } from "@/lib/appwrite/permissions";
import { DEFAULT_RULES, DEFAULT_MINICHECKS } from "@/lib/maintenance/default-rules";

export async function createVehicle(formData: FormData) {
  const { household } = await requireHousehold();
  const { databases } = createSessionClient();
  const perms = householdPermissions(household.memberIds);

  const payload = {
    householdId: household.id,
    name: String(formData.get("name") || ""),
    brand: String(formData.get("brand") || "") || null,
    model: String(formData.get("model") || "") || null,
    engine: String(formData.get("engine") || "") || null,
    powerHp: formData.get("power_hp") ? Number(formData.get("power_hp")) : null,
    fuelType: String(formData.get("fuel_type") || "") || null,
    transmission: String(formData.get("transmission") || "") || null,
    gears: formData.get("gears") ? Number(formData.get("gears")) : null,
    firstRegistration: String(formData.get("first_registration") || "") || null,
    purchaseDate: String(formData.get("purchase_date") || "") || null,
  };

  let vehicleId: string;
  try {
    const vehicle = await databases.createDocument(DATABASE_ID, COLLECTIONS.vehicles, ID.unique(), payload, perms);
    vehicleId = vehicle.$id;
  } catch (e: any) {
    redirect(`/vehicules/nouveau?error=${encodeURIComponent(e.message || "Erreur inconnue")}`);
    return;
  }

  await Promise.all([
    ...DEFAULT_RULES.map((r) =>
      databases.createDocument(DATABASE_ID, COLLECTIONS.rules, ID.unique(), { ...r, vehicleId }, perms)
    ),
    ...DEFAULT_MINICHECKS.map((m) =>
      databases.createDocument(DATABASE_ID, COLLECTIONS.minichecks, ID.unique(), { ...m, vehicleId }, perms)
    ),
    databases.createDocument(DATABASE_ID, COLLECTIONS.integrations, ID.unique(),
      { vehicleId, provider: "stellantis", status: "disconnected" }, perms),
  ]);

  revalidatePath("/dashboard");
  redirect(`/vehicules/${vehicleId}`);
}

export async function deleteVehicle(vehicleId: string) {
  const { databases, storage } = createSessionClient();
  const byVehicle = [Query.equal("vehicleId", vehicleId), Query.limit(200)];

  // Supprime d'abord les données liées, pour ne pas laisser de documents orphelins.
  const relatedCollections = [
    COLLECTIONS.entries, COLLECTIONS.rules, COLLECTIONS.minichecks,
    COLLECTIONS.integrations, COLLECTIONS.telemetry, COLLECTIONS.fuelLogs,
  ];
  for (const col of relatedCollections) {
    const docs = await databases.listDocuments(DATABASE_ID, col, byVehicle);
    await Promise.all(docs.documents.map((d) => databases.deleteDocument(DATABASE_ID, col, d.$id)));
  }

  // Supprime les photos du véhicule dans Storage
  try {
    const vehicle = await databases.getDocument(DATABASE_ID, COLLECTIONS.vehicles, vehicleId);
    const photoIds: string[] = vehicle.photoFileIds || [];
    await Promise.all(photoIds.map((fid) => storage.deleteFile(PHOTOS_BUCKET_ID, fid).catch(() => {})));
  } catch {}

  await databases.deleteDocument(DATABASE_ID, COLLECTIONS.vehicles, vehicleId);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function toggleManufacturerTab(vehicleId: string, enabled: boolean) {
  const { databases } = createSessionClient();
  await databases.updateDocument(DATABASE_ID, COLLECTIONS.vehicles, vehicleId, { manufacturerEnabled: enabled });
  revalidatePath(`/vehicules/${vehicleId}`);
}

export async function updateVehicle(vehicleId: string, formData: FormData) {
  const { databases } = createSessionClient();

  const str = (key: string) => (String(formData.get(key) || "").trim() || null);
  const num = (key: string) => (formData.get(key) ? Number(formData.get(key)) : null);

  await databases.updateDocument(DATABASE_ID, COLLECTIONS.vehicles, vehicleId, {
    name: String(formData.get("name") || "").trim(),
    brand: str("brand"),
    model: str("model"),
    engine: str("engine"),
    powerHp: num("power_hp"),
    fuelType: str("fuel_type"),
    transmission: str("transmission"),
    gears: num("gears"),
    firstRegistration: str("first_registration"),
    purchaseDate: str("purchase_date"),
    registrationPlate: str("registration_plate"),
    vin: str("vin"),
    fiscalPowerCv: num("fiscal_power_cv"),
    vehicleCategory: str("vehicle_category"),
    co2ClassGkm: num("co2_class"),
  });

  revalidatePath(`/vehicules/${vehicleId}`);
}
