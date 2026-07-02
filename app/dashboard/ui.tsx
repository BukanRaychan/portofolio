"use client";

import { useTransition, type ComponentProps, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { CircleNotch } from "@phosphor-icons/react";
import { toast } from "./Toast";
import type { ActionResult } from "./actions";

const fieldBase =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={fieldBase} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea {...props} className={`${fieldBase} min-h-20`} />;
}

function Spinner() {
  return (
    <CircleNotch
      weight="bold"
      className="size-4 shrink-0 animate-spin [animation-duration:0.6s]"
    />
  );
}

export function SaveButton({ children = "Save" }: { children?: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-fit items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background outline-none transition-[transform,background-color] duration-150 ease-[var(--ease-out)] hover:bg-foreground/90 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-wait"
    >
      {pending && <Spinner />}
      {children}
    </button>
  );
}

// Delete as a plain button (not a nested form) so it can sit in the same footer
// row as SaveButton. Calls the server action directly and toasts the result.
export function InlineDelete({
  action,
  id,
  children = "Delete",
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  id: string;
  children?: ReactNode;
}) {
  const [pending, start] = useTransition();
  function onDelete() {
    start(async () => {
      const fd = new FormData();
      fd.set("id", id);
      const res = await action({ ok: true, message: "" }, fd);
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    });
  }
  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      className="inline-flex w-fit items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted outline-none transition-[transform,color,border-color] duration-150 ease-[var(--ease-out)] hover:border-accent hover:text-accent active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-wait"
    >
      {pending && <Spinner />}
      {children}
    </button>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-foreground/[0.02] p-5">
      {children}
    </div>
  );
}
