"use client";

/* eslint-disable @next/next/no-img-element */
import { motion, useReducedMotion, type Variants } from "motion/react";
import { GraduationCap } from "@phosphor-icons/react";
import type { TechStack, Education, Work } from "@/lib/database.types";

export function About({
  bio,
  tech,
  education,
  interests,
  works,
}: {
  bio: string | null;
  tech: TechStack[];
  education: Education[];
  interests: string[];
  works: Work[];
}) {
  const reduce = useReducedMotion();

  const projectCount = works.filter((w) => w.category === "project").length;
  const years = (() => {
    const yrs = works.flatMap((w) =>
      (w.period?.match(/20\d{2}/g) ?? []).map(Number),
    );
    if (!yrs.length) return null;
    return Math.max(1, new Date().getFullYear() - Math.min(...yrs));
  })();

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
              <span className="text-sm leading-relaxed text-muted">
                {s.desc}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Education + Interests + Tech */}
        <div className="grid gap-12 md:grid-cols-2">
          <motion.div variants={item} className="flex flex-col gap-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Education
            </h3>
            {education.map((e) => (
              <div
                key={e.id}
                className="flex gap-4 rounded-2xl border border-border p-5"
              >
                <span className="mt-1 grid size-10 shrink-0 place-items-center rounded-xl border border-border text-accent">
                  <GraduationCap weight="duotone" className="size-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="font-semibold">{e.institution}</h4>
                    <span className="font-mono text-xs text-muted">
                      {e.period}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{e.degree}</p>
                  {e.gpa && (
                    <p className="mt-2 inline-block text-sm font-semibold">
                      <span className="marker">GPA {e.gpa}</span>
                    </p>
                  )}
                  {e.description && (
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {e.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
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
