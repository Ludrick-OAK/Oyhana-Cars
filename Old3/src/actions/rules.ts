"use server";

import { ID } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/config";
import { requireHousehold } from "@/lib/appwrite/household";
import { householdPermissions } from "@/lib/appwrite/permissions";

export async function addRule(vehicleId: string, formData: FormData) {
  const { household } = await requireHousehold();
  const { databases } = createSessionClient();

  const label = String(formData.get("label") || "").trim();
  const keywordsRaw = String(formData.get("keywords") || "").trim();
  const km = formData.get("km") ? Number(formData.get("km")) : null;
  const months = formData.get("months") ? Number(formData.get("months")) : null;
  const onlyReplacement = formData.get("only_replacement") === "on";

  if (!label || !keywordsRaw || (!km && !months)) return;

  const key = "custom_" + label.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") + "_" + Date.now();

  const match = keywordsRaw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

  await databases.createDocument(
    DATABASE_ID, COLLECTIONS.rules, ID.unique(),
    { vehicleId, key, label, match, onlyReplacement, intervalKm: km, intervalMonths: months, isDefault: false },
    householdPermissions(household.memberIds)
  );

  revalidatePath(`/vehicules/${vehicleId}`);
}

export async function deleteRule(vehicleId: string, ruleId: string) {
  const { databases } = createSessionClient();
  await databases.deleteDocument(DATABASE_ID, COLLECTIONS.rules, ruleId);
  revalidatePath(`/vehicules/${vehicleId}`);
}
