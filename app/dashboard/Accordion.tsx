"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { CaretDown } from "@phosphor-icons/react";

// Exclusive accordion group: opening one item closes the rest.
const Ctx = createContext<{ open: string | null; toggle: (id: string) => void }>(
  { open: null, toggle: () => {} },
);

export function AccordionGroup({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (id: string) => setOpen((cur) => (cur === id ? null : id));
  return <Ctx.Provider value={{ open, toggle }}>{children}</Ctx.Provider>;
}

export function Accordion({
  id,
  title,
  handle,
  children,
}: {
  id: string;
  title: ReactNode;
  handle?: ReactNode;
  children: ReactNode;
}) {
  const { open, toggle } = useContext(Ctx);
  const isOpen = open === id;

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => toggle(id)}
          aria-expanded={isOpen}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <span className="flex-1 font-medium">{title}</span>
          <CaretDown
            weight="bold"
            className={`size-4 shrink-0 transition-transform duration-300 ease-[var(--ease-out)] ${
              isOpen ? "rotate-180 text-accent" : "text-muted"
            }`}
          />
        </button>
        {handle}
      </div>

      {/* grid-rows 0fr→1fr gives a smooth, CSS-only height transition */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-[var(--ease-out)]"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="pt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
