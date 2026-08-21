"use client";

import { useState } from "react";
import { fmtDate, fmtKm } from "@/lib/utils";
import { deleteEntry, updateEntry } from "@/actions/entries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { MaintenanceEntry } from "@/lib/appwrite/types";

const TYPE_DOT: Record<string, string> = {
  ct: "border-[#5b87a6]",
  achat: "border-[#6fa97a]",
  revision: "border-copper",
  vidange: "border-copper",
  autre: "border-copper",
};

export function HistoryTimeline({ vehicleId, entries }: { vehicleId: string; entries: MaintenanceEntry[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const sorted = [...entries].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  if (sorted.length === 0) {
    return <p className="text-sm text-muted">Aucune intervention enregistrée pour le moment.</p>;
  }

  return (
    <div className="relative pl-6 space-y-4">
      <div className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-gradient-to-b from-copper-dim to-border" />
      {sorted.map((e) => (
        <div key={e.id} className="relative">
          <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full bg-panel border-2 ${TYPE_DOT[e.type]}`} />

          {editingId === e.id ? (
            <form
              action={async (fd) => { await updateEntry(vehicleId, e.id, fd); setEditingId(null); }}
              className="rounded-xl2 border border-copper bg-panel p-4 space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`date-${e.id}`}>Date</Label>
                  <Input id={`date-${e.id}`} name="date" type="date" defaultValue={e.date} required />
                </div>
                <div>
                  <Label htmlFor={`km-${e.id}`}>Kilométrage</Label>
                  <Input id={`km-${e.id}`} name="km" type="number" defaultValue={e.km} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`type-${e.id}`}>Type</Label>
                  <Select id={`type-${e.id}`} name="type" defaultValue={e.type}>
                    <option value="revision">Révision / entretien</option>
                    <option value="vidange">Vidange</option>
                    <option value="ct">Contrôle technique</option>
                    <option value="achat">Achat / autre</option>
                    <option value="autre">Autre</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`title-${e.id}`}>Titre</Label>
                  <Input id={`title-${e.id}`} name="title" defaultValue={e.title} />
                </div>
              </div>
              <div>
                <Label htmlFor={`items-${e.id}`}>Opérations effectuées (une par ligne)</Label>
                <Textarea id={`items-${e.id}`} name="items" defaultValue={e.items.join("\n")} />
              </div>
              <div>
                <Label htmlFor={`note-${e.id}`}>Note (optionnel)</Label>
                <Input id={`note-${e.id}`} name="note" defaultValue={e.note ?? ""} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">Enregistrer</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(null)}>Annuler</Button>
              </div>
            </form>
          ) : (
            <div className="rounded-xl2 border border-border bg-panel p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="font-semibold text-[14.5px]">{e.title}</p>
                <div>
                  <span className="font-mono text-xs text-copper">{fmtDate(e.date)}</span>
                  <span className="text-xs text-muted ml-2">{fmtKm(e.km)}</span>
                </div>
              </div>
              {e.items?.length > 0 && (
                <ul className="list-disc list-inside text-[13px] text-muted mt-2 space-y-1">
                  {e.items.map((it, i) => <li key={i}>{it}</li>)}
                </ul>
              )}
              {e.note && <p className="text-[12.5px] text-muted italic mt-2">{e.note}</p>}
              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setEditingId(e.id)}
                  className="text-xs text-muted underline underline-offset-2 hover:text-copper"
                >
                  Modifier
                </button>
                <form action={deleteEntry.bind(null, vehicleId, e.id)}>
                  <button type="submit" className="text-xs text-muted underline underline-offset-2 hover:text-overdue">
                    Supprimer
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
