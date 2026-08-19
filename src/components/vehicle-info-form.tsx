"use client";

import { useState } from "react";
import { updateVehicle } from "@/actions/vehicles";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { fmtDate } from "@/lib/utils";
import type { Vehicle } from "@/lib/appwrite/types";

const FUEL_LABELS: Record<string, string> = { essence: "Essence", diesel: "Diesel", hybride: "Hybride", electrique: "Électrique" };
const TRANSMISSION_LABELS: Record<string, string> = { manuelle: "Manuelle", automatique: "Automatique" };

export function VehicleInfoForm({ vehicle }: { vehicle: Vehicle }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-[13.5px] font-semibold">Informations du véhicule</p>
          <Button variant="ghost" size="sm" onClick={() => setOpen((o) => !o)}>
            {open ? "Fermer" : "Modifier"}
          </Button>
        </div>

        {!open ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 mt-4 text-[13px]">
            <Info label="Nom" value={vehicle.name} />
            <Info label="Marque" value={vehicle.brand} />
            <Info label="Modèle" value={vehicle.model} />
            <Info label="Immatriculation" value={vehicle.registrationPlate} />
            <Info label="VIN" value={vehicle.vin} mono />
            <Info label="Catégorie (J)" value={vehicle.vehicleCategory} />
            <Info label="Motorisation" value={vehicle.engine} />
            <Info label="Puissance" value={vehicle.powerHp ? `${vehicle.powerHp} ch` : null} />
            <Info label="Puissance fiscale" value={vehicle.fiscalPowerCv ? `${vehicle.fiscalPowerCv} CV` : null} />
            <Info label="Énergie" value={vehicle.fuelType ? FUEL_LABELS[vehicle.fuelType] ?? vehicle.fuelType : null} />
            <Info label="Boîte" value={vehicle.transmission ? `${TRANSMISSION_LABELS[vehicle.transmission] ?? vehicle.transmission}${vehicle.gears ? ` (${vehicle.gears} rapports)` : ""}` : null} />
            <Info label="Émissions CO2" value={vehicle.co2ClassGkm != null ? `${vehicle.co2ClassGkm} g/km` : null} />
            <Info label="Mise en circulation" value={vehicle.firstRegistration ? fmtDate(vehicle.firstRegistration) : null} />
            <Info label="Date d'achat" value={vehicle.purchaseDate ? fmtDate(vehicle.purchaseDate) : null} />
          </div>
        ) : (
          <form
            action={async (fd) => { await updateVehicle(vehicle.id, fd); setSaved(true); setTimeout(() => { setSaved(false); setOpen(false); }, 900); }}
            className="mt-4 space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="name">Nom du véhicule</Label>
                <Input id="name" name="name" defaultValue={vehicle.name} required />
              </div>
              <div>
                <Label htmlFor="registration_plate">Immatriculation (A)</Label>
                <Input id="registration_plate" name="registration_plate" defaultValue={vehicle.registrationPlate ?? ""} placeholder="AA-123-AA" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="brand">Marque (D.1)</Label>
                <Input id="brand" name="brand" defaultValue={vehicle.brand ?? ""} />
              </div>
              <div>
                <Label htmlFor="model">Modèle (D.3)</Label>
                <Input id="model" name="model" defaultValue={vehicle.model ?? ""} />
              </div>
            </div>

            <div>
              <Label htmlFor="vin">N° d'identification / VIN (E)</Label>
              <Input id="vin" name="vin" defaultValue={vehicle.vin ?? ""} maxLength={17} placeholder="17 caractères" className="font-mono" />
            </div>

            <div>
              <Label htmlFor="engine">Motorisation</Label>
              <Input id="engine" name="engine" defaultValue={vehicle.engine ?? ""} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="power_hp">Puissance (ch DIN)</Label>
                <Input id="power_hp" name="power_hp" type="number" defaultValue={vehicle.powerHp ?? ""} />
              </div>
              <div>
                <Label htmlFor="fiscal_power_cv">Puissance fiscale (P.6)</Label>
                <Input id="fiscal_power_cv" name="fiscal_power_cv" type="number" defaultValue={vehicle.fiscalPowerCv ?? ""} placeholder="CV" />
              </div>
              <div>
                <Label htmlFor="gears">Rapports</Label>
                <Input id="gears" name="gears" type="number" defaultValue={vehicle.gears ?? ""} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="fuel_type">Énergie (P.3)</Label>
                <Select id="fuel_type" name="fuel_type" defaultValue={vehicle.fuelType ?? "essence"}>
                  <option value="essence">Essence</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybride">Hybride</option>
                  <option value="electrique">Électrique</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="transmission">Boîte de vitesses</Label>
                <Select id="transmission" name="transmission" defaultValue={vehicle.transmission ?? "manuelle"}>
                  <option value="manuelle">Manuelle</option>
                  <option value="automatique">Automatique</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="vehicle_category">Catégorie (J)</Label>
                <Input id="vehicle_category" name="vehicle_category" defaultValue={vehicle.vehicleCategory ?? ""} placeholder="ex: M1" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="co2_class">Émissions CO2 (V.7)</Label>
                <Input id="co2_class" name="co2_class" type="number" defaultValue={vehicle.co2ClassGkm ?? ""} placeholder="g/km" />
              </div>
              <div>
                <Label htmlFor="first_registration">Mise en circulation (B)</Label>
                <Input id="first_registration" name="first_registration" type="date" defaultValue={vehicle.firstRegistration ?? ""} />
              </div>
              <div>
                <Label htmlFor="purchase_date">Date d'achat</Label>
                <Input id="purchase_date" name="purchase_date" type="date" defaultValue={vehicle.purchaseDate ?? ""} />
              </div>
            </div>

            <Button type="submit">{saved ? "Enregistré ✓" : "Enregistrer"}</Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function Info({ label, value, mono }: { label: string; value: string | null; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className={mono ? "font-mono" : ""}>{value || <span className="text-muted">—</span>}</p>
    </div>
  );
}
