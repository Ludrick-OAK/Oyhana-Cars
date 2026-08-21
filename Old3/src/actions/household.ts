"use server";

import { Query, Permission, Role } from "node-appwrite";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/config";
import { requireHousehold } from "@/lib/appwrite/household";

// Rejoindre le foyer d'une autre personne via son code d'invitation.
// Utilise le client admin car l'utilisateur qui rejoint n'est, par définition,
// pas encore autorisé à lire le document du foyer cible.
export async function joinHousehold(formData: FormData) {
  const { userId } = await requireHousehold();
  const code = String(formData.get("invite_code") || "").trim().toUpperCase();

  const { databases: adminDb, users } = createAdminClient();

  const found = await adminDb.listDocuments(DATABASE_ID, COLLECTIONS.households, [
    Query.equal("inviteCode", code),
  ]);
  const target = found.documents[0];
  if (!target) {
    redirect(`/parametres?error=${encodeURIComponent("Code d'invitation introuvable.")}`);
  }

  const newMemberIds = Array.from(new Set([...(target!.memberIds || []), userId]));
  const perms = newMemberIds.flatMap((uid: string) => [
    Permission.read(Role.user(uid)), Permission.update(Role.user(uid)), Permission.delete(Role.user(uid)),
  ]);

  await adminDb.updateDocument(DATABASE_ID, COLLECTIONS.households, target!.$id, { memberIds: newMemberIds }, perms);
  await users.updatePrefs(userId, { householdId: target!.$id });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
