"use server";

import { ID, Permission, Role } from "node-appwrite";
import { cookies, headers } from "next/headers";
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

function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  const h = headers();
  const proto = h.get("x-forwarded-proto") || "https";
  const host = h.get("host");
  return `${proto}://${host}`;
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const { account } = createAdminClient();

  if (email) {
    try {
      await account.createRecovery(email, `${getAppUrl()}/reinitialiser-mot-de-passe`);
    } catch {
      // On ne révèle jamais si l'email existe ou non (évite l'énumération de comptes) :
      // le message affiché est identique en cas de succès ou d'échec silencieux.
    }
  }

  redirect("/mot-de-passe-oublie?sent=1");
}

export async function resetPassword(formData: FormData) {
  const userId = String(formData.get("userId") || "");
  const secret = String(formData.get("secret") || "");
  const password = String(formData.get("password") || "");
  const passwordConfirm = String(formData.get("passwordConfirm") || "");

  if (password.length < 8) {
    redirect(`/reinitialiser-mot-de-passe?userId=${userId}&secret=${secret}&error=${encodeURIComponent("Le mot de passe doit contenir au moins 8 caractères.")}`);
  }
  if (password !== passwordConfirm) {
    redirect(`/reinitialiser-mot-de-passe?userId=${userId}&secret=${secret}&error=${encodeURIComponent("Les deux mots de passe ne correspondent pas.")}`);
  }

  const { account } = createAdminClient();
  try {
    await account.updateRecovery(userId, secret, password);
  } catch (e: any) {
    redirect(`/reinitialiser-mot-de-passe?userId=${userId}&secret=${secret}&error=${encodeURIComponent("Ce lien a expiré ou n'est plus valide. Refais une demande.")}`);
  }

  redirect("/login?reset=1");
}
