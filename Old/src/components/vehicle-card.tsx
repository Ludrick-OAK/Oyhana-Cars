import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Car } from "lucide-react";
import type { Vehicle } from "@/lib/appwrite/types";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Link href={`/vehicules/${vehicle.id}`}>
      <Card className="hover:border-copper transition-colors cursor-pointer h-full">
        <CardContent className="p-5 flex flex-col gap-3">
          <div className="h-10 w-10 rounded-lg bg-panel2 flex items-center justify-center">
            <Car className="h-5 w-5 text-copper" />
          </div>
          <div>
            <p className="font-semibold text-base">{vehicle.name}</p>
            <p className="text-xs text-muted mt-1">
              {[vehicle.engine, vehicle.transmission].filter(Boolean).join(" · ") || "Aucune information technique"}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
