"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  ArrowUpRight,
  GithubLogo,
  LinkedinLogo,
  InstagramLogo,
  TiktokLogo,
} from "@phosphor-icons/react";
import type { Socials } from "@/lib/database.types";

const ICONS = {
  github: GithubLogo,
  linkedin: LinkedinLogo,
  instagram: InstagramLogo,
  tiktok: TiktokLogo,
} as const;

export function Contact({
  email,
  socials,
}: {
  email: string;
  socials: Socials;
}) {
  const reduce = useReducedMotion();
  const links = (Object.keys(ICONS) as (keyof typeof ICONS)[])
    .filter((k) => socials[k])
    .map((k) => ({ key: k, href: socials[k]!, Icon: ICONS[k] }));

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: 0.1 } },
  };
  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 26 },
    show: { opacity: 1, y: 0, transition: { type: "spring", duration: 0.7, bounce: 0.18 } },
  };

  return (
    <section className="grid h-full w-full place-items-center px-6 text-center sm:px-10">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center gap-8"
      >
        <motion.p
          variants={item}
          className="font-mono text-xs uppercase tracking-[0.25em] text-muted"
        >
          Available for work
        </motion.p>

        <motion.h2
          variants={item}
          className="text-[clamp(2.5rem,9vw,7rem)] font-semibold leading-[1.12] tracking-tight"
        >
          Let&apos;s build
          <br />
          <span className="marker">something</span>
        </motion.h2>

        <motion.a
          variants={item}
          href={`mailto:${email}?subject=Hello%20Ray`}
          className="group inline-flex items-center gap-2 text-lg font-medium underline decoration-accent decoration-2 underline-offset-4 transition-transform duration-150 ease-out active:scale-[0.98] sm:text-2xl"
        >
          {email}
          <ArrowUpRight
            weight="bold"
            className="size-5 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </motion.a>

        {links.length > 0 && (
          <motion.div variants={item} className="flex items-center gap-2">
            {links.map(({ key, href, Icon }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={key}
                className="grid size-12 place-items-center rounded-full border border-border text-muted transition-all duration-200 ease-out hover:border-accent hover:text-foreground active:scale-[0.95]"
              >
                <Icon weight="fill" className="size-5" />
              </a>
            ))}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
