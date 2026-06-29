import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { DashboardNav } from "./DashboardNav";
import { Toaster } from "./Toast";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user ||
    user.user_metadata?.user_name !== process.env.ADMIN_GITHUB_USERNAME
  ) {
    redirect("/login");
  }

  return (
    <div className="no-scrollbar mx-auto h-[100dvh] max-w-6xl overflow-y-auto px-5 py-10 sm:px-8">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted">
            Signed in as {user.user_metadata?.user_name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:text-foreground"
          >
            View site
          </Link>
          <form action={signOut}>
            <button className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:text-foreground">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <DashboardNav />

      {children}
      <Toaster />
    </div>
  );
}
