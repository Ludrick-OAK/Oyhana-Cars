import { joinHousehold, repairHouseholdPermissions } from "@/actions/household";
import { updateOwnPassword } from "@/actions/auth";
import { requireHousehold } from "@/lib/appwrite/household";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function SettingsPage({
  searchParams,
}: { searchParams: { error?: string; pwError?: string; pwSuccess?: string } }) {
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
            Partage ce code avec un autre utilisateur : depuis son propre compte, il pourra l'utiliser ci-dessous pour rejoindre ce foyer et voir les mêmes véhicules que toi.
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

      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-semibold mb-2">Réparer l'accès aux données du foyer</p>
          <p className="text-xs text-muted mb-3">
            Si un membre du foyer ne voit pas des véhicules créés avant qu'il ne rejoigne, clique ici pour réappliquer les permissions à toutes les données existantes. Sans risque, peut être relancé à tout moment.
          </p>
          <form action={repairHouseholdPermissions}>
            <Button type="submit" variant="ghost" size="sm">Réparer les permissions</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-semibold mb-3">Changer mon mot de passe</p>
          <form action={updateOwnPassword} className="space-y-3">
            <div>
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input id="currentPassword" name="currentPassword" type="password" required />
            </div>
            <div>
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input id="newPassword" name="newPassword" type="password" required minLength={8} />
            </div>
            <div>
              <Label htmlFor="newPasswordConfirm">Confirme le nouveau mot de passe</Label>
              <Input id="newPasswordConfirm" name="newPasswordConfirm" type="password" required minLength={8} />
            </div>
            {searchParams.pwError && <p className="text-sm text-overdue">{decodeURIComponent(searchParams.pwError)}</p>}
            {searchParams.pwSuccess && <p className="text-sm text-ok">Mot de passe mis à jour avec succès.</p>}
            <Button type="submit" size="sm">Mettre à jour</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
