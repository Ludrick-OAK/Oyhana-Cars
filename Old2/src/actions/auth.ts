"use server";

import { ID, Permission, Role } from "node-appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS, SESSION_COOKIE } from "@/lib/appwrite/config";
import { generateInviteCode } from "@/lib/appwrite/household";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const { account } = createAdminClient();
  let session;
  try {
    session = await account.createEmailPasswordSession(email, password);
  } catch (e: any) {
    redirect(`/login?error=${encodeURIComponent(e.message || "Identifiants invalides")}`);
  }
  cookies().set(SESSION_COOKIE, session!.secret, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", expires: new Date(session!.expire),
  });
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("fullName") || "");

  const { users, databases: adminDb, account } = createAdminClient();

  let userId: string;
  try {
    const user = await users.create(ID.unique(), email, undefined, password, fullName);
    userId = user.$id;
  } catch (e: any) {
    redirect(`/register?error=${encodeURIComponent(e.message || "Erreur lors de la création du compte")}`);
    return;
  }

  // Crée son foyer (un foyer par défaut, rejoignable ensuite via code d'invitation)
  const household = await adminDb.createDocument(
    DATABASE_ID, COLLECTIONS.households, ID.unique(),
    { name: `Foyer de ${fullName || email.split("@")[0]}`, inviteCode: generateInviteCode(), memberIds: [userId] },
    [Permission.read(Role.user(userId)), Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))]
  );
  await users.updatePrefs(userId, { householdId: household.$id });

  // Session pour le nouvel utilisateur (endpoint public, pas besoin de droits admin)
  const session = await account.createEmailPasswordSession(email, password);
  cookies().set(SESSION_COOKIE, session.secret, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", expires: new Date(session.expire),
  });

  redirect("/dashboard");
}

export async function signOut() {
  const { account } = createSessionClient();
  try { await account.deleteSession("current"); } catch {}
  cookies().delete(SESSION_COOKIE);
  redirect("/login");
}
