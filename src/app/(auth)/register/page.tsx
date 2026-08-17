import { signUp } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function RegisterPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <p className="text-[11px] uppercase tracking-[0.18em] text-copper mb-1 font-mono">Oyhana Cars</p>
        <h1 className="font-display uppercase text-3xl font-semibold mb-2">Créer un compte</h1>
        <p className="text-sm text-muted mb-6">
          Un foyer est créé automatiquement. Pour rejoindre le foyer d'une autre personne, utilisez son code d'invitation depuis les Paramètres après connexion.
        </p>

        <form action={signUp} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Prénom</Label>
            <Input id="fullName" name="fullName" type="text" required placeholder="Ludrick" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="toi@exemple.com" />
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
          </div>

          {searchParams.error && (
            <p className="text-sm text-overdue">{decodeURIComponent(searchParams.error)}</p>
          )}

          <Button type="submit" className="w-full">Créer mon compte</Button>
        </form>

        <p className="text-sm text-muted mt-5">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-copper hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
