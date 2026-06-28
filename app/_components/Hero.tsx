"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";

export function Hero({
  title,
  role,
  subtitle,
  name,
  avatar,
  onExplore,
}: {
  title: string;
  role: string;
  subtitle: string;
  name: string;
  avatar: string | null;
  onExplore?: () => void;
}) {
  const reduce = useReducedMotion();
  const portrait =
    avatar ?? "https://picsum.photos/seed/ray-portrait/640/800";

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.07, delayChildren: 0.1 },
    },
  };
  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", duration: 0.7, bounce: 0.18 },
    },
  };

  return (
    <section className="grid h-full w-full place-items-center px-6 sm:px-10">
      <div className="grid w-full max-w-6xl items-center gap-10 md:grid-cols-[1.35fr_1fr]">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-start gap-7"
        >
          <motion.p
            variants={item}
            className="font-mono text-xs uppercase tracking-[0.25em] text-muted"
          >
            {name}
          </motion.p>

          <motion.h1
            variants={item}
            className="text-[clamp(2.75rem,8vw,6.5rem)] font-semibold leading-[1.2] tracking-tight"
          >
            {title.replace(/\.$/, "")}
            <br />
            <span className="marker">{role.replace(/\.$/, "")}</span>
          </motion.h1>

          <motion.div className="flex flex-col items-start gap-2  text-[clamp(0.75rem,1vw+0.5rem,1rem)]">
            {subtitle.split("|").map((str) => (
              <motion.p
                key={str}
                variants={item}
                className="font-mono max-w-md  text-muted "
              >
                {str}
              </motion.p>
            ))}
          </motion.div>



          {onExplore && (
            <motion.button
              variants={item}
              onClick={onExplore}
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-base font-medium text-background transition-transform duration-150 ease-out active:scale-[0.97]"
            >
              See my work
              <ArrowRight
                weight="bold"
                className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1"
              />
            </motion.button>
          )}
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.2, rotate: 0 }}
          animate={{ opacity: 1, scale: 1, rotate: -2 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.15 }}
          className="relative mx-auto hidden aspect-4/5 w-full max-w-xs overflow-hidden rounded-3xl border border-border md:block"
        >
          <Image
            src={portrait}
            alt="Portrait"
            fill
            priority
            sizes="20rem"
            className="object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
