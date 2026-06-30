"use client";

/* eslint-disable @next/next/no-img-element */
import { type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  GraduationCap,
  RocketLaunch,
  Certificate,
  Trophy,
  UsersThree,
  ArrowUpRight,
  type Icon,
} from "@phosphor-icons/react";
import type {
  TechStack,
  Education,
  Work,
  AboutEntry,
} from "@/lib/database.types";

// Distinct, energetic accent per sub-chapter.
const COLORS = {
  education: "var(--accent)",
  certification: "#7c3aed",
  achievement: "#f59e0b",
  organization: "#10b981",
} as const;

function OngoingBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
      </span>
      Ongoing
    </span>
  );
}

function SubChapter({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3
        className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em]"
        style={{ color }}
      >
        <span className="size-1.5 rounded-full" style={{ background: color }} />
        {title}
      </h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Tile({ color, icon: I }: { color: string; icon: Icon }) {
  return (
    <span
      className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border"
      style={{ borderColor: `${color}33`, color }}
    >
      <I weight="duotone" className="size-4.5" />
    </span>
  );
}

export function About({
  bio,
  tech,
  education,
  aboutEntries,
  interests,
  works,
}: {
  bio: string | null;
  tech: TechStack[];
  education: Education[];
  aboutEntries: AboutEntry[];
  interests: string[];
  works: Work[];
}) {
  const reduce = useReducedMotion();

  const projectCount = works.filter((w) => w.category === "project").length;
  const years = (() => {
    const yrs = works.flatMap((w) =>
      [w.start_date, w.end_date].flatMap((s) =>
        (s?.match(/20\d{2}/g) ?? []).map(Number),
      ),
    );
    if (!yrs.length) return null;
    return Math.max(1, new Date().getFullYear() - Math.min(...yrs));
  })();

  const byKind = (kind: AboutEntry["kind"]) =>
    aboutEntries.filter((e) => e.kind === kind);

  const stats = [
    {
      value: `${projectCount}+`,
      label: "Projects Built",
      desc: "Web apps, platforms, and tools shipped end to end.",
    },
    {
      value: years ? `${years}+` : "—",
      label: "Years Experience",
      desc: "Across healthcare, education, and research products.",
    },
    {
      value: `${tech.length}`,
      label: "Technologies",
      desc: "Languages, frameworks, and tools in active rotation.",
    },
  ];

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.06, delayChildren: 0.1 },
    },
  };
  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 22 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", duration: 0.6, bounce: 0.15 },
    },
  };

  return (
    <section className="no-scrollbar h-full w-full overflow-y-auto px-6 py-20 sm:px-10">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex max-w-5xl flex-col gap-16"
      >
        {/* Statement */}
        <div className="flex flex-col gap-6">
          <motion.p
            variants={item}
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-muted"
          >
            <span className="size-1.5 rounded-full bg-accent" />
            About
          </motion.p>
          <motion.h2
            variants={item}
            className="max-w-4xl text-[clamp(1.75rem,4.5vw,3.5rem)] font-semibold leading-[1.08] tracking-tight"
          >
            {bio ?? "A software engineer who likes shipping things that work."}
          </motion.h2>
        </div>

        {/* Stats */}
        <motion.div
          variants={item}
          className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3"
        >
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-2 bg-background p-6">
              <span className="text-[clamp(2.5rem,6vw,4rem)] font-semibold leading-none tracking-tight">
                {s.value}
              </span>
              <span className="text-sm font-semibold">{s.label}</span>
              <span className="text-sm leading-relaxed text-muted">{s.desc}</span>
            </div>
          ))}
        </motion.div>

        {/* Left: credentials stacked in one column (empty ones hidden).
            Right: Tech + Interests. */}
        <div className="grid gap-12 md:grid-cols-2">
          <motion.div variants={item} className="flex flex-col gap-10">
            {education.length > 0 && (
              <SubChapter title="Education" color={COLORS.education}>
                {education.map((e) => (
                  <div
                    key={e.id}
                    className="flex gap-3 rounded-2xl border border-border p-4"
                  >
                    <Tile
                      color={COLORS.education}
                      icon={e.is_external ? RocketLaunch : GraduationCap}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold leading-tight">
                          {e.institution}
                        </h4>
                        {e.ongoing && <OngoingBadge />}
                      </div>
                      <p className="mt-0.5 text-sm text-muted">{e.degree}</p>
                      {e.period && (
                        <p className="mt-1 font-mono text-xs text-muted">
                          {e.period}
                        </p>
                      )}
                      {e.gpa && (
                        <p className="mt-2 inline-block text-sm font-semibold">
                          <span className="marker">GPA {e.gpa}</span>
                        </p>
                      )}
                      {e.description && (
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          {e.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </SubChapter>
            )}

            {byKind("certification").length > 0 && (
              <SubChapter title="Certification" color={COLORS.certification}>
                <EntryList
                  entries={byKind("certification")}
                  color={COLORS.certification}
                  icon={Certificate}
                />
              </SubChapter>
            )}
            {byKind("achievement").length > 0 && (
              <SubChapter title="Achievements" color={COLORS.achievement}>
                <EntryList
                  entries={byKind("achievement")}
                  color={COLORS.achievement}
                  icon={Trophy}
                />
              </SubChapter>
            )}
            {byKind("organization").length > 0 && (
              <SubChapter title="Organization" color={COLORS.organization}>
                <EntryList
                  entries={byKind("organization")}
                  color={COLORS.organization}
                  icon={UsersThree}
                />
              </SubChapter>
            )}
          </motion.div>

          <div className="flex flex-col gap-10">
            <motion.div variants={item}>
              <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {tech.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-transform duration-200 ease-[var(--ease-out)] hover:-translate-y-0.5"
                  >
                    {t.logo_url && (
                      <img
                        src={t.logo_url}
                        alt=""
                        aria-hidden
                        className="h-5 w-5 object-contain"
                      />
                    )}
                    {t.name}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div variants={item}>
              <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted">
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full border border-border px-3 py-1.5 text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function EntryList({
  entries,
  color,
  icon,
}: {
  entries: AboutEntry[];
  color: string;
  icon: Icon;
}) {
  if (!entries.length) {
    return <p className="text-sm text-muted/70">Nothing here yet.</p>;
  }
  return (
    <>
      {entries.map((e) => (
        <div
          key={e.id}
          className="flex gap-3 rounded-2xl border border-border p-4"
        >
          {e.logo_url ? (
            <span
              className="mt-0.5 grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl border"
              style={{ borderColor: `${color}33` }}
            >
              <img
                src={e.logo_url}
                alt=""
                aria-hidden
                className="size-5 object-contain"
              />
            </span>
          ) : (
            <Tile color={color} icon={icon} />
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold leading-tight">{e.title}</h4>
            {e.subtitle && (
              <p className="mt-0.5 text-sm text-muted">{e.subtitle}</p>
            )}
            {e.period && (
              <p className="mt-1 font-mono text-xs text-muted">{e.period}</p>
            )}
            {e.description && (
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {e.description}
              </p>
            )}
            {e.link && (
              <a
                href={e.link}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium"
                style={{ color }}
              >
                View
                <ArrowUpRight weight="bold" className="size-3.5" />
              </a>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
