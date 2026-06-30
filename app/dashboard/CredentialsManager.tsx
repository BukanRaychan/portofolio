"use client";

import { useState } from "react";
import { DotsSixVertical } from "@phosphor-icons/react";
import type { AboutEntry, AboutKind } from "@/lib/database.types";
import {
  saveAboutEntry,
  deleteAboutEntry,
  reorderAboutEntries,
} from "./actions";
import { Field, Input, Textarea, SaveButton, DeleteButton, Card } from "./ui";
import { FileInput } from "./FileInput";
import { ActionForm } from "./ActionForm";
import { AccordionGroup, Accordion } from "./Accordion";
import { SortableList, SortableItem } from "./Sortable";

function EntryForm({ kind, entry }: { kind: AboutKind; entry?: AboutEntry }) {
  return (
    <ActionForm
      action={saveAboutEntry}
      resetOnSuccess={!entry}
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="kind" value={entry?.kind ?? kind} />
      {entry && <input type="hidden" name="id" value={entry.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title">
          <Input name="title" defaultValue={entry?.title ?? ""} required />
        </Field>
        <Field label="Subtitle (issuer / role)">
          <Input name="subtitle" defaultValue={entry?.subtitle ?? ""} />
        </Field>
        <Field label="Period / date">
          <Input name="period" defaultValue={entry?.period ?? ""} />
        </Field>
        <Field label="Link (optional)">
          <Input name="link" defaultValue={entry?.link ?? ""} />
        </Field>
        <Field label="Logo URL">
          <Input name="logo_url" defaultValue={entry?.logo_url ?? ""} />
        </Field>
        <Field label="…or upload logo">
          <FileInput name="logo_file" />
        </Field>
      </div>
      <Field label="Description">
        <Textarea name="description" defaultValue={entry?.description ?? ""} />
      </Field>
      <SaveButton>{entry ? "Save" : "Add"}</SaveButton>
    </ActionForm>
  );
}

function Column({
  heading,
  kind,
  entries,
}: {
  heading: string;
  kind: AboutKind;
  entries: AboutEntry[];
}) {
  const [order, setOrder] = useState(() =>
    entries.filter((e) => e.kind === kind),
  );
  const [seen, setSeen] = useState(entries);
  if (entries !== seen) {
    setSeen(entries);
    setOrder(entries.filter((e) => e.kind === kind));
  }

  const ids = order.map((e) => e.id);
  function reorder(newIds: string[]) {
    const map = new Map(order.map((e) => [e.id, e]));
    setOrder(newIds.map((id) => map.get(id)!));
    reorderAboutEntries(newIds);
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight">{heading}</h2>

      <details>
        <summary className="cursor-pointer text-sm font-medium text-accent">
          + Add {heading.toLowerCase()}
        </summary>
        <div className="mt-4">
          <Card>
            <EntryForm kind={kind} />
          </Card>
        </div>
      </details>

      <SortableList ids={ids} onReorder={reorder}>
        <div className="flex flex-col gap-3">
          {order.map((entry) => (
            <SortableItem key={entry.id} id={entry.id}>
              {({ handleProps, isDragging }) => (
                <Card>
                  <div className={isDragging ? "opacity-60" : ""}>
                    <Accordion
                      id={entry.id}
                      title={entry.title}
                      handle={
                        <span
                          {...handleProps}
                          aria-label="Drag to reorder"
                          className="cursor-grab touch-none rounded-md p-1 text-muted transition-colors hover:text-foreground active:cursor-grabbing"
                        >
                          <DotsSixVertical weight="bold" className="size-5" />
                        </span>
                      }
                    >
                      <div className="flex flex-col gap-4">
                        <EntryForm kind={kind} entry={entry} />
                        <ActionForm action={deleteAboutEntry}>
                          <input type="hidden" name="id" value={entry.id} />
                          <DeleteButton>Delete</DeleteButton>
                        </ActionForm>
                      </div>
                    </Accordion>
                  </div>
                </Card>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableList>
    </div>
  );
}

export function CredentialsManager({ entries }: { entries: AboutEntry[] }) {
  return (
    <AccordionGroup>
      <div className="grid gap-8 lg:grid-cols-3">
        <Column heading="Certification" kind="certification" entries={entries} />
        <Column heading="Achievements" kind="achievement" entries={entries} />
        <Column heading="Organization" kind="organization" entries={entries} />
      </div>
    </AccordionGroup>
  );
}
