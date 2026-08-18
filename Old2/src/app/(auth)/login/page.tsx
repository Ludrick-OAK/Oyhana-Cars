import { signIn } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <p className="text-[11px] uppercase tracking-[0.18em] text-copper mb-1 font-mono">Oyhana Cars</p>
        <h1 className="font-display uppercase text-3xl font-semibold mb-6">Connexion</h1>

        <form action={signIn} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="toi@exemple.com" />
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" name="password" type="password" required />
          </div>

          {searchParams.error && (
            <p className="text-sm text-overdue">{decodeURIComponent(searchParams.error)}</p>
          )}

          <Button type="submit" className="w-full">Se connecter</Button>
        </form>

        <p className="text-sm text-muted mt-5">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-copper hover:underline">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
