import { requestPasswordReset } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ForgotPasswordPage({ searchParams }: { searchParams: { sent?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <p className="text-[11px] uppercase tracking-[0.18em] text-copper mb-1 font-mono">Oyhana Cars</p>
        <h1 className="font-display uppercase text-3xl font-semibold mb-2">Mot de passe oublié</h1>

        {searchParams.sent ? (
          <>
            <p className="text-sm text-muted mb-6">
              Si un compte existe avec cette adresse, un email vient de t'être envoyé avec un lien pour définir un nouveau mot de passe. Vérifie aussi tes spams.
            </p>
            <Link href="/login" className="text-sm text-copper hover:underline">Retour à la connexion</Link>
          </>
        ) : (
          <>
            <p className="text-sm text-muted mb-6">
              Indique l'email de ton compte : tu recevras un lien pour définir un nouveau mot de passe.
            </p>
            <form action={requestPasswordReset} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="toi@exemple.com" />
              </div>
              <Button type="submit" className="w-full">Envoyer le lien</Button>
            </form>
            <p className="text-sm text-muted mt-5">
              <Link href="/login" className="text-copper hover:underline">Retour à la connexion</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
