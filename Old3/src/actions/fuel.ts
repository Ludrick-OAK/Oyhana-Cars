"use server";

import { ID } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/config";
import { requireHousehold } from "@/lib/appwrite/household";
import { householdPermissions } from "@/lib/appwrite/permissions";

export async function addFuelLog(vehicleId: string, formData: FormData) {
  const { household } = await requireHousehold();
  const { databases } = createSessionClient();

  const payload = {
    vehicleId,
    date: String(formData.get("date") || ""),
    km: Number(formData.get("km") || 0),
    liters: Number(formData.get("liters") || 0),
    totalPrice: Number(formData.get("totalPrice") || 0),
    fullTank: formData.get("fullTank") === "on",
  };
  if (!payload.date || !payload.km || !payload.liters || !payload.totalPrice) return;

  await databases.createDocument(
    DATABASE_ID, COLLECTIONS.fuelLogs, ID.unique(), payload, householdPermissions(household.memberIds)
  );
  revalidatePath(`/vehicules/${vehicleId}`);
}

export async function deleteFuelLog(vehicleId: string, fuelLogId: string) {
  const { databases } = createSessionClient();
  await databases.deleteDocument(DATABASE_ID, COLLECTIONS.fuelLogs, fuelLogId);
  revalidatePath(`/vehicules/${vehicleId}`);
}
