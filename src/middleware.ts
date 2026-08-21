import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/appwrite/config";

// Vérification légère (présence du cookie de session) : la validation réelle
// (cookie valide, non expiré) se fait dans chaque page/action via
// createSessionClient().account.get(), qui redirige vers /login si invalide.
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Route pilotée par un jeton à usage unique dans l'URL, pas par l'état de
  // connexion : ne jamais rediriger, ni si connecté ni si déconnecté.
  if (path.startsWith("/reinitialiser-mot-de-passe")) {
    return NextResponse.next();
  }

  const hasSession = !!request.cookies.get(SESSION_COOKIE)?.value;
  const isAuthRoute = path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/mot-de-passe-oublie");

  if (!hasSession && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (hasSession && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
