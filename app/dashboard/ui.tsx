import type { ComponentProps, ReactNode } from "react";

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

export function SaveButton({ children = "Save" }: { children?: ReactNode }) {
  return (
    <button
      type="submit"
      className="w-fit rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform duration-150 ease-out active:scale-[0.97]"
    >
      {children}
    </button>
  );
}

export function DeleteButton() {
  return (
    <button
      type="submit"
      className="w-fit rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
    >
      Delete
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
