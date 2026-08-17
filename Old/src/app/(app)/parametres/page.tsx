import { joinHousehold } from "@/actions/household";
import { requireHousehold } from "@/lib/appwrite/household";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function SettingsPage({ searchParams }: { searchParams: { error?: string } }) {
  const { household } = await requireHousehold();

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-copper font-mono mb-1">Paramètres</p>
        <h1 className="font-display uppercase text-2xl font-semibold">Mon foyer</h1>
      </div>

      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted mb-2">Nom du foyer</p>
          <p className="font-semibold mb-4">{household.name}</p>

          <p className="text-sm text-muted mb-2">Code d'invitation</p>
          <p className="font-mono text-2xl text-copper tracking-widest mb-2">{household.inviteCode}</p>
          <p className="text-xs text-muted">
            Partage ce code avec ta femme : depuis son propre compte, elle pourra l'utiliser ci-dessous pour rejoindre ce foyer et voir les mêmes véhicules que toi.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-semibold mb-3">Rejoindre un autre foyer</p>
          <form action={joinHousehold} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="invite_code">Code d'invitation</Label>
              <Input id="invite_code" name="invite_code" placeholder="ex: A1B2C3" required />
            </div>
            <Button type="submit" className="self-end">Rejoindre</Button>
          </form>
          {searchParams.error && <p className="text-sm text-overdue mt-2">{decodeURIComponent(searchParams.error)}</p>}
          <p className="text-xs text-muted mt-3">
            Attention : rejoindre un autre foyer déplace ton compte vers ce foyer — tu perdras l'accès aux véhicules de ton foyer actuel (sauf si tu le rejoins à nouveau plus tard avec son propre code).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
