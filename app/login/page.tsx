"use client";

import { GithubLogo } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  async function signIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <main className="grid min-h-[100dvh] place-items-center px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-border bg-surface p-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted">
          Sign in to manage your portfolio content.
        </p>
        <button
          onClick={signIn}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 font-medium text-background transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          <GithubLogo weight="fill" className="size-5" />
          Continue with GitHub
        </button>
      </div>
    </main>
  );
}
