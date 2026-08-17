import "server-only";
import { Client, Account, Databases, Storage, Users } from "node-appwrite";
import { cookies } from "next/headers";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, SESSION_COOKIE } from "./config";

// Client agissant AVEC la session de l'utilisateur connecté (respecte les permissions
// posées sur chaque document — c'est l'équivalent du client "server" + RLS de Supabase).
export function createSessionClient() {
  const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
  const session = cookies().get(SESSION_COOKIE)?.value;
  if (session) client.setSession(session);
  return {
    client,
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
  };
}

// Client "admin", authentifié par clé API serveur, qui outrepasse toutes les permissions.
// Utilisé UNIQUEMENT côté serveur (jamais exposé au navigateur) pour :
// - la recherche d'un foyer par code d'invitation (avant que le nouvel arrivant en soit membre)
// - les scripts d'installation / de seed
export function createAdminClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY!);
  return {
    client,
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
    users: new Users(client),
  };
}

export async function getCurrentUser() {
  try {
    const { account } = createSessionClient();
    return await account.get();
  } catch {
    return null;
  }
}
