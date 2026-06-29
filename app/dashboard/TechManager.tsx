"use client";

import { useState } from "react";
import { DotsSixVertical } from "@phosphor-icons/react";
import type { TechStack } from "@/lib/database.types";
import { saveTech, deleteTech, reorderTech } from "./actions";
import { Field, Input, SaveButton, DeleteButton, Card } from "./ui";
import { FileInput } from "./FileInput";
import { ActionForm } from "./ActionForm";
import { AccordionGroup, Accordion } from "./Accordion";
import { SortableList, SortableItem } from "./Sortable";

function TechForm({ tech }: { tech?: TechStack }) {
  return (
    <ActionForm
      action={saveTech}
      resetOnSuccess={!tech}
      className="flex flex-col gap-4"
    >
      {tech && <input type="hidden" name="id" value={tech.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Slug (e.g. react)">
          <Input name="slug" defaultValue={tech?.slug ?? ""} required />
        </Field>
        <Field label="Display name">
          <Input name="name" defaultValue={tech?.name ?? ""} required />
        </Field>
        <Field label="Logo URL">
          <Input name="logo_url" defaultValue={tech?.logo_url ?? ""} />
        </Field>
        <Field label="…or upload logo (takes priority)">
          <FileInput name="logo_file" />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="needs_inversion"
          defaultChecked={tech?.needs_inversion ?? false}
        />
        Invert in dark mode
      </label>
      <SaveButton>{tech ? "Save" : "Add tech"}</SaveButton>
    </ActionForm>
  );
}

export function TechManager({ techs }: { techs: TechStack[] }) {
  const [order, setOrder] = useState(techs);
  // Resync to server truth only when new data arrives (after save/add/delete);
  // a reorder revalidates "/" only, so this keeps the optimistic drag order.
  const [seen, setSeen] = useState(techs);
  if (techs !== seen) {
    setSeen(techs);
    setOrder(techs);
  }

  const ids = order.map((t) => t.id);
  function reorder(newIds: string[]) {
    const map = new Map(order.map((t) => [t.id, t]));
    setOrder(newIds.map((id) => map.get(id)!));
    reorderTech(newIds);
  }

  return (
    <div className="flex flex-col gap-6">
      <details>
        <summary className="cursor-pointer text-sm font-medium text-accent">
          + Add new tech
        </summary>
        <div className="mt-4">
          <Card>
            <TechForm />
          </Card>
        </div>
      </details>

      <AccordionGroup>
        <SortableList ids={ids} onReorder={reorder}>
          <div className="flex flex-col gap-3">
            {order.map((tech) => (
              <SortableItem key={tech.id} id={tech.id}>
                {({ handleProps, isDragging }) => (
                  <Card>
                    <div className={isDragging ? "opacity-60" : ""}>
                      <Accordion
                        id={tech.id}
                        title={
                          <span className="flex items-center gap-2">
                            {tech.logo_url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={tech.logo_url}
                                alt=""
                                aria-hidden
                                className="size-5 object-contain"
                              />
                            )}
                            {tech.name}
                          </span>
                        }
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
                          <TechForm tech={tech} />
                          <ActionForm action={deleteTech}>
                            <input type="hidden" name="id" value={tech.id} />
                            <DeleteButton>Delete tech</DeleteButton>
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
      </AccordionGroup>
    </div>
  );
}
