import "server-only";
import { redirect } from "next/navigation";
import { Query } from "node-appwrite";
import { createSessionClient } from "./server";
import { DATABASE_ID, COLLECTIONS } from "./config";
import { mapHousehold } from "./mappers";
import type { Household } from "./types";

// Récupère le foyer de l'utilisateur connecté (prefs.householdId -> document).
// Lève une redirection vers /login si non connecté.
export async function requireHousehold(): Promise<{ userId: string; household: Household }> {
  const { account, databases } = createSessionClient();

  let user;
  try {
    user = await account.get();
  } catch {
    redirect("/login");
  }

  const householdId = (user!.prefs as any)?.householdId as string | undefined;
  if (!householdId) redirect("/login");

  const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.households, householdId!);
  return { userId: user!.$id, household: mapHousehold(doc) };
}

export function generateInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
