"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/appwrite/client";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/config";

// S'abonne aux changements Appwrite Realtime pour ce véhicule et rafraîchit
// la page automatiquement — permet à tous les membres du foyer de voir les mêmes
// données se mettre à jour sans recharger, un peu comme avec Firebase avant.
export function RealtimeRefresher({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();

  useEffect(() => {
    const { client } = createBrowserClient();
    const watched = [COLLECTIONS.entries, COLLECTIONS.rules, COLLECTIONS.minichecks, COLLECTIONS.telemetry];
    const channels = watched.map((c) => `databases.${DATABASE_ID}.collections.${c}.documents`);

    const unsubscribe = client.subscribe(channels, (event) => {
      const payload = event.payload as any;
      if (payload?.vehicleId === vehicleId) {
        router.refresh();
      }
    });

    return () => unsubscribe();
  }, [vehicleId, router]);

  return null;
}
