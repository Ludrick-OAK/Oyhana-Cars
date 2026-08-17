import { createVehicle } from "@/actions/vehicles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export default function NewVehiclePage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="max-w-xl">
      <p className="text-[11px] uppercase tracking-[0.18em] text-copper font-mono mb-1">Nouveau véhicule</p>
      <h1 className="font-display uppercase text-2xl font-semibold mb-6">Ajouter un véhicule</h1>

      <form action={createVehicle} className="space-y-4">
        <div>
          <Label htmlFor="name">Nom du véhicule</Label>
          <Input id="name" name="name" required placeholder="ex: DS3 Crossback" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="brand">Marque</Label>
            <Input id="brand" name="brand" placeholder="DS Automobiles" />
          </div>
          <div>
            <Label htmlFor="model">Modèle</Label>
            <Input id="model" name="model" placeholder="DS3 Crossback" />
          </div>
        </div>
        <div>
          <Label htmlFor="engine">Motorisation</Label>
          <Input id="engine" name="engine" placeholder="1.2 PureTech THP 12V S&S" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="power_hp">Puissance (ch)</Label>
            <Input id="power_hp" name="power_hp" type="number" placeholder="101" />
          </div>
          <div>
            <Label htmlFor="fuel_type">Carburant</Label>
            <Select id="fuel_type" name="fuel_type" defaultValue="essence">
              <option value="essence">Essence</option>
              <option value="diesel">Diesel</option>
              <option value="hybride">Hybride</option>
              <option value="electrique">Électrique</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="gears">Rapports</Label>
            <Input id="gears" name="gears" type="number" placeholder="6" />
          </div>
        </div>
        <div>
          <Label htmlFor="transmission">Boîte de vitesses</Label>
          <Select id="transmission" name="transmission" defaultValue="manuelle">
            <option value="manuelle">Manuelle</option>
            <option value="automatique">Automatique</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_registration">Mise en circulation</Label>
            <Input id="first_registration" name="first_registration" type="date" />
          </div>
          <div>
            <Label htmlFor="purchase_date">Date d'achat</Label>
            <Input id="purchase_date" name="purchase_date" type="date" />
          </div>
        </div>

        {searchParams.error && <p className="text-sm text-overdue">{decodeURIComponent(searchParams.error)}</p>}

        <Button type="submit" className="w-full">Créer le véhicule</Button>
      </form>
    </div>
  );
}
