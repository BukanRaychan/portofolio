"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
  type Variants,
} from "motion/react";
import { List, X } from "@phosphor-icons/react";
import type { Portfolio } from "@/lib/data";
import type { Socials } from "@/lib/database.types";
import { Hero } from "./Hero";
import { About } from "./About";
import { Works } from "./Works";
import { Contact } from "./Contact";

const SLIDES = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "works", label: "Works" },
  { id: "contact", label: "Contact" },
];

export function Deck({ data }: { data: Portfolio }) {
  const reduce = useReducedMotion();
  const [[index, dir], setState] = useState<[number, number]>([0, 0]);
  const [menuOpen, setMenuOpen] = useState(false);
  const lock = useRef(false);

  const paginate = (next: number) => {
    const clamped = Math.max(0, Math.min(SLIDES.length - 1, next));
    if (clamped === index) return;
    setState([clamped, clamped > index ? 1 : -1]);
  };

  const goTo = (i: number) => {
    paginate(i);
    setMenuOpen(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setMenuOpen(false);
      if (menuOpen) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") paginate(index + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") paginate(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Wheel: scroll within a slide until its edge, then the next nudge paginates.
  const onWheel = (e: React.WheelEvent) => {
    if (menuOpen || lock.current || Math.abs(e.deltaY) < 4) return;
    const goingDown = e.deltaY > 0;

    let el = e.target as HTMLElement | null;
    while (el && el !== e.currentTarget) {
      const oy = getComputedStyle(el).overflowY;
      if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 1) {
        const atTop = el.scrollTop <= 0;
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
        if (!((goingDown && atBottom) || (!goingDown && atTop))) return;
        break;
      }
      el = el.parentElement;
    }

    const target = index + (goingDown ? 1 : -1);
    if (target < 0 || target >= SLIDES.length) return;
    lock.current = true;
    paginate(target);
    window.setTimeout(() => {
      lock.current = false;
    }, 800);
  };

  const onDragEnd = (_e: unknown, info: PanInfo) => {
    const power = info.offset.x + info.velocity.x * 0.25;
    if (power < -120) paginate(index + 1);
    else if (power > 120) paginate(index - 1);
  };

  const slideVariants = {
    enter: (d: number) =>
      reduce ? { opacity: 0 } : { x: d > 0 ? "100%" : "-100%", opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: (d: number) =>
      reduce ? { opacity: 0 } : { x: d > 0 ? "-100%" : "100%", opacity: 0 },
  };

  const settings = data.settings!;
  const socials = (settings.socials ?? {}) as Socials;

  const slideContent = [
    <Hero
      key="home"
      title={settings.hero_title}
      role={settings.hero_role}
      subtitle={settings.hero_subtitle}
      name={settings.name}
      avatar={settings.avatar_url}
      onExplore={() => paginate(2)}
    />,
    <About
      key="about"
      bio={settings.bio}
      tech={data.tech}
      education={data.education}
      interests={settings.interests}
      works={data.works}
    />,
    <Works key="works" works={data.works} tech={data.tech} />,
    <Contact key="contact" email={settings.email} socials={socials} />,
  ];

  const monogram = settings.name
    .split(" ")
    .slice(0, 3)
    .map((p) => p[0])
    .join("");

  const menuContainer: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
    exit: {},
  };
  const menuItem: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { type: "spring", duration: 0.5, bounce: 0.2 } },
    exit: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
  };

  return (
    <div
      onWheel={onWheel}
      className="relative h-dvh w-screen overflow-hidden"
    >
      {/* Brand */}
      <div className="absolute left-5 top-5 z-30 sm:left-8 sm:top-7">
        <span className="font-mono text-sm font-semibold tracking-tight">
          {monogram}
          <span className="text-accent">.</span>
        </span>
      </div>

      {/* Hamburger (top-right, always visible) */}
      <button
        onClick={() => setMenuOpen((o) => !o)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        className={`absolute right-5 top-5 z-50 grid size-10 place-items-center rounded-full border 
        border-foreground text-foreground transition-transform duration-150 ease-out active:scale-[0.94] 
        sm:right-8 sm:top-6 ${!menuOpen ? "bg-accent" : "bg-background"}`}
      >
        {menuOpen ? (
          <X weight="bold" className="size-5 text-foreground" />
        ) : (
          <List weight="bold" className="size-5 text-surface" />
        )}
      </button>

      {/* Slides — right gutter reserved so the rail never overlaps content */}
      <AnimatePresence custom={dir} initial={false}>
        <motion.div
          key={index}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", duration: 0.6, bounce: 0.12 }}
          drag={reduce ? false : "x"}
          dragElastic={0.12}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={onDragEnd}
          className="absolute inset-0 sm:pr-20"
        >
          {slideContent[index]}
        </motion.div>
      </AnimatePresence>

      {/* Desktop progress rail — dots + numbers only, label on hover */}
      <nav
        className="absolute right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3.5 sm:flex"
        aria-label="Sections"
      >
        {SLIDES.map((s, i) => {
          const activeItem = i === index;
          return (
            <button
              key={s.id}
              onClick={() => paginate(i)}
              aria-current={activeItem}
              aria-label={s.label}
              className="group relative flex h-5 items-center justify-end gap-2.5"
            >
              <span className="pointer-events-none absolute bottom-0.5 right-20 whitespace-nowrap text-sm text-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {s.label}
              </span>
              <span
                className={`font-mono text-[11px] tabular-nums transition-colors duration-200 ${
                  activeItem ? "text-accent" : "text-muted group-hover:text-foreground"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="relative flex h-3 w-9 items-center justify-end">
                {activeItem ? (
                  <motion.span
                    layoutId="nav-active"
                    className="h-[3px] w-9 rounded-full bg-accent"
                    transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                  />
                ) : (
                  <span className="h-px w-5 rounded-full bg-border transition-all duration-200 ease-out group-hover:w-8 group-hover:bg-muted" />
                )}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Mobile bar — dots + active section title */}
      <nav
        className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-surface/90 px-4 py-2 backdrop-blur-md sm:hidden"
        aria-label="Sections"
      >
        <span className="flex items-center gap-1.5">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => paginate(i)}
              aria-label={s.label}
              className="flex items-center py-1"
            >
              <span
                className={`h-2 rounded-full transition-all duration-300 ease-out ${
                  i === index ? "w-5 bg-accent" : "w-2 bg-border"
                }`}
              />
            </button>
          ))}
        </span>
        <span className="text-sm font-medium">{SLIDES[index].label}</span>
      </nav>

      {/* Full-screen menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-center bg-accent px-8 text-accent-foreground sm:px-16"
          >
            <motion.nav
              variants={menuContainer}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex flex-col gap-1"
            >
              {SLIDES.map((s, i) => (
                <motion.button
                  key={s.id}
                  variants={menuItem}
                  onClick={() => goTo(i)}
                  className="group flex w-fit items-center gap-4 text-left"
                >
                  <span className="font-mono text-base opacity-70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[clamp(2.5rem,11vw,6rem)] font-semibold leading-none tracking-tight transition-transform duration-200 ease-out group-hover:translate-x-2">
                    {s.label}
                  </span>
                </motion.button>
              ))}
            </motion.nav>

            <motion.a
              variants={menuItem}
              initial="hidden"
              animate="show"
              href={`mailto:${settings.email}`}
              className="mt-12 w-fit font-mono text-sm underline underline-offset-4 opacity-90"
            >
              {settings.email}
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
