"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { toast } from "./Toast";
import type { ActionResult } from "./actions";

const INITIAL: ActionResult = { ok: true, message: "" };

// Wraps a server action with useActionState so every save/insert/delete reports
// success or error as a toast, and SaveButton/DeleteButton (useFormStatus) can
// show a spinner while it runs.
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction] = useActionState(action, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);
  const lastSeen = useRef<ActionResult>(INITIAL);

  useEffect(() => {
    if (state === lastSeen.current || !state.message) return;
    lastSeen.current = state;
    if (state.ok) {
      toast.success(state.message);
      if (resetOnSuccess) formRef.current?.reset();
    } else {
      toast.error(state.message);
    }
  }, [state, resetOnSuccess]);

  return (
    <form ref={formRef} action={formAction} className={className}>
      {children}
    </form>
  );
}
