"use client";

import { useState } from "react";
import { Paperclip, CheckCircle } from "@phosphor-icons/react";

// File input with a clear "file selected" indicator.
export function FileInput({
  name,
  accept = "image/*",
}: {
  name: string;
  accept?: string;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const selected = fileName !== null;

  return (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors duration-150 ease-[var(--ease-out)] focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-background ${
        selected ? "border-accent" : "border-border hover:border-muted"
      }`}
    >
      <input
        type="file"
        name={name}
        accept={accept}
        className="sr-only"
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
      />
      {selected ? (
        <CheckCircle weight="fill" className="size-4 shrink-0 text-accent" />
      ) : (
        <Paperclip className="size-4 shrink-0 text-muted" />
      )}
      <span className={`truncate ${selected ? "text-foreground" : "text-muted"}`}>
        {fileName ?? "Choose file"}
      </span>
      {selected && (
        <span className="ml-auto shrink-0 text-xs font-medium text-accent">
          Selected
        </span>
      )}
    </label>
  );
}
