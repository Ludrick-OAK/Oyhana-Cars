"use server";

import { ID, Permission, Role } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS, PHOTOS_BUCKET_ID, MAX_PHOTOS_PER_VEHICLE } from "@/lib/appwrite/config";
import { requireHousehold } from "@/lib/appwrite/household";

export async function uploadVehiclePhoto(vehicleId: string, formData: FormData) {
  const { household } = await requireHousehold();
  // Client admin nécessaire : on accorde des droits d'update/delete à TOUS les
  // membres du foyer sur ce fichier, pas seulement à la personne qui upload.
  const { databases, storage } = createAdminClient();

  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) return;

  const vehicle = await databases.getDocument(DATABASE_ID, COLLECTIONS.vehicles, vehicleId);
  const current: string[] = vehicle.photoFileIds || [];
  if (current.length >= MAX_PHOTOS_PER_VEHICLE) {
    return; // limite atteinte — le formulaire empêche déjà normalement d'arriver ici
  }

  // Lecture publique volontaire (photos peu sensibles) pour permettre un <img src>
  // direct sans dispositif d'authentification côté navigateur ; écriture/suppression
  // restreintes aux membres du foyer.
  const perms = [
    Permission.read(Role.any()),
    ...household.memberIds.flatMap((uid) => [Permission.update(Role.user(uid)), Permission.delete(Role.user(uid))]),
  ];

  const uploaded = await storage.createFile(PHOTOS_BUCKET_ID, ID.unique(), file, perms);

  await databases.updateDocument(DATABASE_ID, COLLECTIONS.vehicles, vehicleId, {
    photoFileIds: [...current, uploaded.$id],
  });

  revalidatePath(`/vehicules/${vehicleId}`);
}

export async function deleteVehiclePhoto(vehicleId: string, fileId: string) {
  const { databases, storage } = createSessionClient();

  const vehicle = await databases.getDocument(DATABASE_ID, COLLECTIONS.vehicles, vehicleId);
  const current: string[] = vehicle.photoFileIds || [];

  await databases.updateDocument(DATABASE_ID, COLLECTIONS.vehicles, vehicleId, {
    photoFileIds: current.filter((id) => id !== fileId),
  });
  await storage.deleteFile(PHOTOS_BUCKET_ID, fileId).catch(() => {});

  revalidatePath(`/vehicules/${vehicleId}`);
}
