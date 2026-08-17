"use client";

import { useState } from "react";
import { addEntry } from "@/actions/entries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function AddEntryForm({ vehicleId }: { vehicleId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6">
      <Button variant="ghost" onClick={() => setOpen((o) => !o)}>
        {open ? "Fermer" : "+ Ajouter une intervention"}
      </Button>

      {open && (
        <form
          action={async (fd) => { await addEntry(vehicleId, fd); setOpen(false); }}
          className="mt-4 rounded-xl2 border border-border bg-panel p-5 space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required />
            </div>
            <div>
              <Label htmlFor="km">Kilométrage</Label>
              <Input id="km" name="km" type="number" required placeholder="ex: 112450" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select id="type" name="type" defaultValue="revision">
                <option value="revision">Révision / entretien</option>
                <option value="vidange">Vidange</option>
                <option value="ct">Contrôle technique</option>
                <option value="achat">Achat / autre</option>
                <option value="autre">Autre</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input id="title" name="title" placeholder="ex: Révision annuelle" />
            </div>
          </div>
          <div>
            <Label htmlFor="items">Opérations effectuées (une par ligne)</Label>
            <Textarea id="items" name="items" placeholder={"Huile moteur (vidange)\nFiltre à huile (remplacement)"} />
            <p className="text-[11px] text-muted mt-1">
              Utilise "remplacement" / "appoint", et précise "avant"/"arrière" pour pneus et freins.
            </p>
          </div>
          <div>
            <Label htmlFor="note">Note (optionnel)</Label>
            <Input id="note" name="note" placeholder="ex: défaut relevé au CT" />
          </div>
          <Button type="submit">Enregistrer</Button>
        </form>
      )}
    </div>
  );
}
