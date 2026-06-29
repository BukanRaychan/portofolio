"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Site Settings" },
  { href: "/dashboard/works", label: "Works" },
  { href: "/dashboard/tech", label: "Tech Stack" },
  { href: "/dashboard/education", label: "Education" },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [target, setTarget] = useState<string | null>(null);

  function go(href: string) {
    if (href === pathname) return;
    setTarget(href);
    // The transition keeps the current page (and active pill) until the
    // destination has loaded, so the selected style only appears AFTER load.
    startTransition(() => router.push(href));
  }

  return (
    <>
      {isPending && (
        <div className="fixed inset-x-0 top-0 z-[60] h-[3px] overflow-hidden">
          <div className="top-loader h-full w-full bg-accent" />
        </div>
      )}

      <nav className="mb-8 flex flex-wrap gap-1.5 text-sm">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const loading = isPending && target === item.href;
          return (
            <button
              key={item.href}
              onClick={() => go(item.href)}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-4 py-2 font-medium transition-colors duration-200 ${
                active
                  ? "bg-accent text-accent-foreground"
                  : loading
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-foreground/[0.06] hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}
