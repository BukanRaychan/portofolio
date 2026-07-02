"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { CaretDown, ArrowSquareOut, SignOut } from "@phosphor-icons/react";
import { signOut } from "./actions";

const NAV = [
  { href: "/dashboard", label: "Site Settings" },
  { href: "/dashboard/works", label: "Works" },
  { href: "/dashboard/tech", label: "Tech Stack" },
  { href: "/dashboard/education", label: "Education" },
  { href: "/dashboard/credentials", label: "Credentials" },
  { href: "/dashboard/social", label: "Social" },
];

const num = (i: number) => String(i + 1).padStart(2, "0");

export function DashboardNav({ user }: { user?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [isPending, startTransition] = useTransition();
  const [target, setTarget] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function go(href: string) {
    setOpen(false);
    if (href === pathname) return;
    setTarget(href);
    // Keep the current active style until the destination has loaded, so the
    // selected style only appears AFTER load (same feel as the rest of the app).
    startTransition(() => router.push(href));
  }

  const activeLabel =
    NAV.find((n) => n.href === pathname)?.label ?? "Dashboard";

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05, delayChildren: 0.06 } },
    exit: {},
  };
  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: "spring", duration: 0.5, bounce: 0.2 } },
    exit: reduce ? { opacity: 0 } : { opacity: 0, y: 14 },
  };

  return (
    <>
      {/* Top loading bar */}
      {isPending && (
        <div className="fixed inset-x-0 top-0 z-[70] h-0.75 overflow-hidden">
          <div className="top-loader h-full w-full bg-accent" />
        </div>
      )}

      {/* Desktop / tablet: persistent numbered sidebar */}
      <aside className="no-scrollbar hidden h-dvh w-60 shrink-0 flex-col overflow-y-auto  px-7 py-10 sm:flex">
        <div className="mb-10">
          <p className="text-lg font-semibold tracking-tight">
            Dashboard<span className="text-accent">.</span>
          </p>
          {user && <p className="mt-1 font-mono text-xs text-muted">@{user}</p>}
        </div>

        <nav className="flex flex-col justify-center h-full gap-4">
          {NAV.map((it, i) => {
            const active = pathname === it.href;
            const loading = isPending && target === it.href;
            return (
              <button
                key={it.href}
                onClick={() => go(it.href)}
                aria-current={active ? "page" : undefined}
                className="group flex items-center gap-3 text-left"
              >
                <span className="font-mono text-[11px] tabular-nums text-muted/60">
                  {num(i)}
                </span>
                <span
                  className={`text-2xl font-semibold tracking-tight transition-all duration-200 ease-out ${
                    active
                      ? "text-accent translate-x-1"
                      : loading
                        ? "text-accent/60 translate-x-1"
                        : "text-foreground/20 translate-x-0 group-hover:translate-x-1 group-hover:text-foreground"
                  }`}
                >
                  {it.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-2 pt-10 text-sm">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-1.5 text-muted transition-colors hover:text-foreground"
          >
            <ArrowSquareOut weight="bold" className="size-4" />
            View site
          </Link>
          <form action={signOut}>
            <button className="inline-flex w-fit items-center gap-1.5 text-muted transition-colors hover:text-accent">
              <SignOut weight="bold" className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile: top bar with arrow toggle + active section */}
      <div className="fixed inset-x-0 top-0 z-50 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-2.5 backdrop-blur-md sm:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-surface/90 shadow-sm transition-transform duration-150 ease-out active:scale-[0.94]"
        >
          <CaretDown weight="bold" className="size-5 text-accent" />
        </button>
        <span className="truncate text-sm font-semibold">{activeLabel}</span>
      </div>

      {/* Mobile: full-screen overlay menu — same look as the site */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-60 flex flex-col justify-center bg-accent px-8 text-accent-foreground sm:hidden"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute left-4 top-4 grid size-10 place-items-center rounded-full border border-accent-foreground/30 transition-transform duration-150 ease-out active:scale-[0.94]"
            >
              <CaretDown weight="bold" className="size-5 rotate-180" />
            </button>

            <motion.nav
              variants={container}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex flex-col gap-1"
            >
              {NAV.map((it, i) => {
                const active = pathname === it.href;
                return (
                  <motion.button
                    key={it.href}
                    variants={item}
                    onClick={() => go(it.href)}
                    className="group flex w-fit items-center gap-4 text-left"
                  >
                    <span className="font-mono text-base opacity-70">
                      {num(i)}
                    </span>
                    <span
                      className={`text-[clamp(1.9rem,9vw,3.5rem)] font-semibold leading-none tracking-tight transition-transform duration-200 ease-out group-hover:translate-x-2 ${
                        active
                          ? "underline decoration-accent-foreground/60 decoration-2 underline-offset-8"
                          : ""
                      }`}
                    >
                      {it.label}
                    </span>
                  </motion.button>
                );
              })}
            </motion.nav>

            <motion.div
              variants={item}
              initial="hidden"
              animate="show"
              className="mt-12 flex items-center gap-5 font-mono text-sm"
            >
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="underline underline-offset-4 opacity-90"
              >
                View site
              </Link>
              <form action={signOut}>
                <button className="underline underline-offset-4 opacity-90">
                  Sign out
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
