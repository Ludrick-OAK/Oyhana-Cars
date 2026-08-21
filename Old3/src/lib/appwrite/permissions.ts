import { Permission, Role } from "node-appwrite";

// Construit les permissions d'un document (vehicle, entry, rule...) à partir
// de la liste des membres du foyer : chacun peut lire/modifier/supprimer.
// C'est l'équivalent des policies RLS "household_id = current_household_id()"
// qu'on avait avec Supabase, mais posées explicitement à chaque document.
export function householdPermissions(memberIds: string[]) {
  return memberIds.flatMap((uid) => [
    Permission.read(Role.user(uid)),
    Permission.update(Role.user(uid)),
    Permission.delete(Role.user(uid)),
  ]);
}
