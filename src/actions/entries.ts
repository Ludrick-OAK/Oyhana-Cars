"use server";

import { ID } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/config";
import { requireHousehold } from "@/lib/appwrite/household";
import { householdPermissions } from "@/lib/appwrite/permissions";
import type { EntryType } from "@/lib/appwrite/types";

export async function addEntry(vehicleId: string, formData: FormData) {
  const { userId, household } = await requireHousehold();
  const { databases } = createAdminClient();

  const itemsRaw = String(formData.get("items") || "");
  const items = itemsRaw.split("\n").map((s) => s.trim()).filter(Boolean);

  const payload = {
    vehicleId,
    date: String(formData.get("date") || ""),
    km: Number(formData.get("km") || 0),
    type: String(formData.get("type") || "revision") as EntryType,
    title: String(formData.get("title") || "Intervention"),
    items,
    note: String(formData.get("note") || "") || null,
    createdBy: userId,
  };

  await databases.createDocument(
    DATABASE_ID, COLLECTIONS.entries, ID.unique(), payload, householdPermissions(household.memberIds)
  );
  revalidatePath(`/vehicules/${vehicleId}`);
}

export async function updateEntry(vehicleId: string, entryId: string, formData: FormData) {
  const { databases } = createSessionClient();

  const itemsRaw = String(formData.get("items") || "");
  const items = itemsRaw.split("\n").map((s) => s.trim()).filter(Boolean);

  await databases.updateDocument(DATABASE_ID, COLLECTIONS.entries, entryId, {
    date: String(formData.get("date") || ""),
    km: Number(formData.get("km") || 0),
    type: String(formData.get("type") || "revision") as EntryType,
    title: String(formData.get("title") || "Intervention"),
    items,
    note: String(formData.get("note") || "") || null,
  });
  revalidatePath(`/vehicules/${vehicleId}`);
}

export async function deleteEntry(vehicleId: string, entryId: string) {
  const { databases } = createSessionClient();
  await databases.deleteDocument(DATABASE_ID, COLLECTIONS.entries, entryId);
  revalidatePath(`/vehicules/${vehicleId}`);
}
