"use client";

import { GithubLogo, ArrowRight } from "@phosphor-icons/react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const reduce = useReducedMotion();

  async function signIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };
  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 22 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", duration: 0.6, bounce: 0.2 },
    },
  };

  return (
    <main className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden bg-background px-6 pb-16 pt-24 sm:px-12 sm:pb-24">
      {/* Oversized word bleeding off the top-right edge */}
      <motion.span
        aria-hidden
        initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
        className="pointer-events-none absolute -right-3 top-1 select-none text-right font-semibold leading-[0.8] tracking-tighter text-accent/10 text-[clamp(6.5rem,25vw,21rem)] sm:-right-6"
      >
        DASH
        <br />
        BOARD
      </motion.span>

      {/* Brand */}
      <motion.span
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="absolute left-6 top-6 z-10 font-mono text-sm font-semibold tracking-tight sm:left-12 sm:top-8"
      >
        FRM<span className="text-accent">.</span>
      </motion.span>

      {/* Foreground content, anchored bottom-left */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex max-w-xl flex-col items-start gap-6"
      >
        <motion.p
          variants={item}
          className="font-mono text-xs uppercase tracking-[0.25em] text-muted"
        >
          01 / Admin access
        </motion.p>
        <motion.h1
          variants={item}
          className="text-[clamp(2.5rem,9vw,5rem)] font-semibold leading-[1.05] tracking-tight"
        >
          Let&rsquo;s get you <span className="marker">in</span>.
        </motion.h1>
        <motion.p
          variants={item}
          className="max-w-sm font-mono text-sm text-muted"
        >
          Sign in to shape the portfolio: the hero, works, tech stack, and
          everything in between.
        </motion.p>
        <motion.button
          variants={item}
          onClick={signIn}
          className="group inline-flex items-center gap-2.5 rounded-full bg-foreground px-6 py-3.5 text-base font-medium text-background outline-none transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <GithubLogo weight="fill" className="size-5" />
          Continue with GitHub
          <ArrowRight
            weight="bold"
            className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1"
          />
        </motion.button>
      </motion.div>
    </main>
  );
}
