import { resetPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ResetPasswordPage({
  searchParams,
}: { searchParams: { userId?: string; secret?: string; error?: string } }) {
  const { userId, secret, error } = searchParams;

  if (!userId || !secret) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <p className="text-[11px] uppercase tracking-[0.18em] text-copper mb-1 font-mono">Oyhana Cars</p>
          <h1 className="font-display uppercase text-3xl font-semibold mb-2">Lien invalide</h1>
          <p className="text-sm text-muted mb-6">
            Ce lien de réinitialisation est incomplet ou a déjà été utilisé.
          </p>
          <Link href="/mot-de-passe-oublie" className="text-sm text-copper hover:underline">
            Refaire une demande
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <p className="text-[11px] uppercase tracking-[0.18em] text-copper mb-1 font-mono">Oyhana Cars</p>
        <h1 className="font-display uppercase text-3xl font-semibold mb-6">Nouveau mot de passe</h1>

        <form action={resetPassword} className="space-y-4">
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="secret" value={secret} />
          <div>
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <Input id="password" name="password" type="password" required minLength={8} />
          </div>
          <div>
            <Label htmlFor="passwordConfirm">Confirme le mot de passe</Label>
            <Input id="passwordConfirm" name="passwordConfirm" type="password" required minLength={8} />
          </div>

          {error && <p className="text-sm text-overdue">{decodeURIComponent(error)}</p>}

          <Button type="submit" className="w-full">Définir le mot de passe</Button>
        </form>
      </div>
    </div>
  );
}
