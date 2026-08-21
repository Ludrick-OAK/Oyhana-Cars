"use server";

import { ID } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/config";
import { requireHousehold } from "@/lib/appwrite/household";
import { householdPermissions } from "@/lib/appwrite/permissions";

export async function markMiniCheckDone(vehicleId: string, miniCheckId: string) {
  const { userId } = await requireHousehold();
  const { databases } = createSessionClient();

  await databases.updateDocument(DATABASE_ID, COLLECTIONS.minichecks, miniCheckId, {
    lastDone: new Date().toISOString().slice(0, 10),
    lastDoneBy: userId,
  });
  revalidatePath(`/vehicules/${vehicleId}`);
}

export async function addMiniCheck(vehicleId: string, formData: FormData) {
  const { household } = await requireHousehold();
  const { databases } = createAdminClient();

  const label = String(formData.get("label") || "").trim();
  if (!label) return;

  await databases.createDocument(
    DATABASE_ID, COLLECTIONS.minichecks, ID.unique(),
    { vehicleId, label, intervalDays: 60 },
    householdPermissions(household.memberIds)
  );
  revalidatePath(`/vehicules/${vehicleId}`);
}

export async function deleteMiniCheck(vehicleId: string, miniCheckId: string) {
  const { databases } = createSessionClient();
  await databases.deleteDocument(DATABASE_ID, COLLECTIONS.minichecks, miniCheckId);
  revalidatePath(`/vehicules/${vehicleId}`);
}
