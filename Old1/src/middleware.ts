import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/appwrite/config";

// Vérification légère (présence du cookie de session) : la validation réelle
// (cookie valide, non expiré) se fait dans chaque page/action via
// createSessionClient().account.get(), qui redirige vers /login si invalide.
export function middleware(request: NextRequest) {
  const hasSession = !!request.cookies.get(SESSION_COOKIE)?.value;
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");

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
