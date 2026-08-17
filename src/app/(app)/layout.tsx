import { getCurrentUser } from "@/lib/appwrite/server";
import { NavBar } from "@/components/nav-bar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen">
      <NavBar userEmail={user?.email} />
      <main className="max-w-5xl mx-auto px-5 py-8">{children}</main>
    </div>
  );
}
