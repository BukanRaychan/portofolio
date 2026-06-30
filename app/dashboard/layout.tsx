import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  const handle = user.user_metadata?.user_name as string | undefined;

  return (
    <div className="flex h-dvh overflow-hidden">
      <DashboardNav user={handle} />
      <main className="no-scrollbar flex-1 overflow-y-auto px-5 pb-16 pt-20 sm:px-10 sm:pt-12">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
      <Toaster />
    </div>
  );
}
