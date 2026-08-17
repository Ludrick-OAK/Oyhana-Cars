"use client";
import { Client, Databases } from "appwrite";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from "./config";

// Client navigateur, utilisé uniquement pour s'abonner au Realtime Appwrite
// (mise à jour live entre les appareils du foyer, sans recharger la page).
export function createBrowserClient() {
  const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
  return { client, databases: new Databases(client) };
}
