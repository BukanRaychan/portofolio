"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";

type Toast = { id: number; ok: boolean; message: string };

// Tiny pub/sub so any client component can call toast.success / toast.error
// without context wiring (Sonner-style DX). <Toaster/> is mounted once.
let listeners: ((t: Toast) => void)[] = [];
let counter = 0;

function push(ok: boolean, message: string) {
  const t = { id: ++counter, ok, message };
  listeners.forEach((l) => l(t));
}

export const toast = {
  success: (message: string) => push(true, message),
  error: (message: string) => push(false, message),
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (t: Toast) => {
      setToasts((prev) => [...prev, t]);
      window.setTimeout(
        () => setToasts((prev) => prev.filter((x) => x.id !== t.id)),
        3500,
      );
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[80] flex w-[min(92vw,22rem)] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
            transition={{ type: "spring", duration: 0.45, bounce: 0.25 }}
            className="pointer-events-auto flex items-center gap-2.5 rounded-xl border bg-surface px-4 py-3 text-sm shadow-lg shadow-foreground/5"
            style={{ borderColor: t.ok ? "var(--border)" : "#e5484d" }}
          >
            {t.ok ? (
              <CheckCircle weight="fill" className="size-5 shrink-0 text-accent" />
            ) : (
              <WarningCircle
                weight="fill"
                className="size-5 shrink-0"
                style={{ color: "#e5484d" }}
              />
            )}
            <span className="font-medium text-foreground">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
