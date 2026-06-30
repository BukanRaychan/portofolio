"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";
import { ArrowUpRight, CaretDown } from "@phosphor-icons/react";
import type { TechStack, Work } from "@/lib/database.types";
import { formatPeriod, isOngoing } from "@/lib/format";

function Ongoing() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
      <span className="size-1.5 rounded-full bg-accent" />
      Ongoing
    </span>
  );
}

export function Works({ works, tech }: { works: Work[]; tech: TechStack[] }) {
  const reduce = useReducedMotion();
  const techMap = useMemo(() => new Map(tech.map((t) => [t.slug, t])), [tech]);
  const [tab, setTab] = useState<"experience" | "project">("experience");
  const [openId, setOpenId] = useState<string | null>(null);
  const [hovered, setHovered] = useState<Work | null>(null);

  // Only reveal the cursor-following preview once a real pointer move has set
  // its position — otherwise it flashes at (0,0) when you scroll onto this
  // slide with the cursor already resting over a row.
  const [pointerMoved, setPointerMoved] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 250, damping: 28 });
  const y = useSpring(my, { stiffness: 250, damping: 28 });

  const items = works.filter((w) => w.category === tab);
  const preview = hovered?.images?.[0];

  return (
    <section
      className="no-scrollbar h-full w-full overflow-y-auto px-6 py-20 sm:px-10"
      onMouseMove={(e) => {
        mx.set(e.clientX + 24);
        my.set(e.clientY - 80);
        if (!pointerMoved) setPointerMoved(true);
      }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-none tracking-tight">
            Selected <span className="marker">work</span>
          </h2>
          <div className="flex gap-1 rounded-full border border-border  p-1 text-sm">
            {(["experience", "project"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setOpenId(null);
                }}
                className={`rounded-full px-4 py-1.5 capitalize transition-colors duration-200 ${
                  tab === t ? "bg-foreground text-background" : "text-muted"
                }`}
              >
                {t === "experience" ? "Experience" : "Projects"}
              </button>
            ))}
          </div>
        </div>

        <ul className="divide-y divide-border border-y border-border">
          {items.map((work, i) => {
            const isOpen = work.id === openId;
            return (
              <li
                key={work.id}
                onMouseEnter={() => setHovered(work)}
                onMouseLeave={() => setHovered(null)}
              >
                <button
                  onClick={() =>
                    setOpenId((p) => (p === work.id ? null : work.id))
                  }
                  className="group flex w-full items-center gap-4 py-5 text-left"
                >
                  <span className="font-mono text-xs text-muted tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-lg font-semibold tracking-tight transition-colors group-hover:text-accent sm:text-2xl">
                        {work.title}
                      </span>
                      {isOngoing(work.start_date, work.end_date) && <Ongoing />}
                    </span>
                    <span className="block truncate text-sm text-muted">
                      {work.place}
                    </span>
                  </span>
                  <span className="hidden font-mono text-xs text-muted sm:block">
                    {formatPeriod(work.start_date, work.end_date)}
                  </span>
                  <CaretDown
                    className={`size-4 flex-shrink-0 text-muted transition-transform duration-300 ease-out ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                      exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-4 pb-6">
                        {work.position && (
                          <p className="text-sm font-medium text-muted">
                            {work.position}
                          </p>
                        )}
                        {work.description && (
                          <p className="max-w-2xl leading-relaxed text-muted">
                            {work.description}
                          </p>
                        )}
                        {work.images.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {work.images.map((src, j) => (
                              <img
                                key={j}
                                src={src}
                                alt=""
                                aria-hidden
                                className="aspect-video w-full rounded-lg border border-border object-cover"
                              />
                            ))}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                          {work.technologies.map((slug) => {
                            const t = techMap.get(slug);
                            if (!t) return null;
                            return (
                              <span key={slug} className="flex items-center gap-2">
                                {t.logo_url && (
                                  <img
                                    src={t.logo_url}
                                    alt=""
                                    aria-hidden
                                    className={`h-5 w-5 object-contain opacity-80 ${
                                      t.needs_inversion ? "dark:invert" : ""
                                    }`}
                                  />
                                )}
                                <span className="text-sm text-muted">{t.name}</span>
                              </span>
                            );
                          })}
                        </div>
                        {work.link && (
                          <a
                            href={work.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-transform duration-150 ease-out active:scale-[0.97]"
                          >
                            View Product
                            <ArrowUpRight weight="bold" className="size-4" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Cursor-following preview (desktop, motion only) */}
      {!reduce && preview && pointerMoved && (
        <motion.img
          src={preview}
          alt=""
          aria-hidden
          style={{ x, y }}
          className="pointer-events-none fixed left-0 top-0 z-40 hidden h-40 w-64 rounded-xl border border-border object-cover shadow-2xl lg:block"
        />
      )}
    </section>
  );
}
