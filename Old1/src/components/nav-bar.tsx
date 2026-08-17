import Link from "next/link";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Car, Settings, LogOut } from "lucide-react";

export function NavBar({ userEmail }: { userEmail?: string }) {
  return (
    <header className="border-b border-border">
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Car className="h-5 w-5 text-copper" />
          <span className="font-display uppercase tracking-wide text-lg">Oyhana Cars</span>
        </Link>
        <div className="flex items-center gap-3">
          {userEmail && <span className="text-xs text-muted hidden sm:inline">{userEmail}</span>}
          <Link href="/parametres">
            <Button variant="ghost" size="icon" title="Paramètres">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <form action={signOut}>
            <Button variant="ghost" size="icon" title="Se déconnecter">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
