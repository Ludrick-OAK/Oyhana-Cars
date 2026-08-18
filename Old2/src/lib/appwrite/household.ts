import "server-only";
import { redirect } from "next/navigation";
import { ID, Permission, Role } from "node-appwrite";
import { createSessionClient } from "./server";
import { DATABASE_ID, COLLECTIONS } from "./config";
import { mapHousehold } from "./mappers";
import type { Household } from "./types";

// Récupère le foyer de l'utilisateur connecté (prefs.householdId -> document).
// Lève une redirection vers /login si non connecté.
// Auto-réparation : si prefs.householdId pointe vers un document qui n'existe
// plus (foyer supprimé manuellement, base recréée pendant des tests, etc.),
// recrée automatiquement un foyer neuf pour l'utilisateur plutôt que de planter.
export async function requireHousehold(): Promise<{ userId: string; household: Household }> {
  const { account, databases } = createSessionClient();

  let user;
  try {
    user = await account.get();
  } catch {
    redirect("/login");
    return undefined as never; // ne s'exécute jamais : redirect() interrompt le rendu
  }

  const householdId = (user.prefs as any)?.householdId as string | undefined;

  if (householdId) {
    try {
      const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.households, householdId);
      if (doc?.$id) return { userId: user.$id, household: mapHousehold(doc) };
    } catch {
      // Le document référencé n'existe plus : on retombe sur la création ci-dessous.
    }
  }

  const household = await databases.createDocument(
    DATABASE_ID, COLLECTIONS.households, ID.unique(),
    { name: `Foyer de ${user.name || user.email.split("@")[0]}`, inviteCode: generateInviteCode(), memberIds: [user.$id] },
    [Permission.read(Role.user(user.$id)), Permission.update(Role.user(user.$id)), Permission.delete(Role.user(user.$id))]
  );
  await account.updatePrefs({ householdId: household.$id });

  if (!household?.$id) {
    // Ne devrait jamais arriver : on préfère une erreur explicite à une requête
    // Appwrite plus loin avec un householdId vide (message d'erreur cryptique).
    throw new Error(`requireHousehold: échec de création du foyer pour l'utilisateur ${user.$id}`);
  }

  return { userId: user.$id, household: mapHousehold(household) };
}

export function generateInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
