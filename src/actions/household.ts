"use server";

import { Query, Permission, Role } from "node-appwrite";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/config";
import { requireHousehold } from "@/lib/appwrite/household";
import { backfillHouseholdPermissions } from "@/lib/appwrite/backfill";

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

  // Sans ça, les véhicules/données créés AVANT que ce membre rejoigne le foyer
  // resteraient invisibles pour lui (leurs permissions ne listaient que les
  // membres présents au moment de leur création).
  await backfillHouseholdPermissions(target!.$id, newMemberIds);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// Permet de "réparer" un foyer déjà rejoint avant que le backfill automatique
// n'existe (ou si des données ont été ajoutées de façon incohérente). Sans risque
// à relancer plusieurs fois : ré-applique juste les mêmes permissions.
export async function repairHouseholdPermissions() {
  const { household } = await requireHousehold();
  await backfillHouseholdPermissions(household.id, household.memberIds);
  revalidatePath("/dashboard");
  revalidatePath("/parametres");
}
