"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { DotsSixVertical, LinkSimple } from "@phosphor-icons/react";
import type { SocialLink } from "@/lib/database.types";
import { saveSocial, deleteSocial, reorderSocial } from "./actions";
import { Field, Input, SaveButton, DeleteButton, Card } from "./ui";
import { FileInput } from "./FileInput";
import { ActionForm } from "./ActionForm";
import { AccordionGroup, Accordion } from "./Accordion";
import { SortableList, SortableItem } from "./Sortable";

function SocialForm({ link }: { link?: SocialLink }) {
  return (
    <ActionForm
      action={saveSocial}
      resetOnSuccess={!link}
      className="flex flex-col gap-4"
    >
      {link && <input type="hidden" name="id" value={link.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Label (e.g. GitHub)">
          <Input name="label" defaultValue={link?.label ?? ""} required />
        </Field>
        <Field label="Link URL">
          <Input
            name="link"
            type="url"
            defaultValue={link?.link ?? ""}
            placeholder="https://…"
            required
          />
        </Field>
        <Field label="Logo URL">
          <Input
            name="logo_url"
            defaultValue={link?.logo_url ?? ""}
            placeholder="https://cdn.simpleicons.org/github"
          />
        </Field>
        <Field label="…or upload logo (takes priority)">
          <FileInput name="logo_file" />
        </Field>
      </div>
      <SaveButton>{link ? "Save" : "Add link"}</SaveButton>
    </ActionForm>
  );
}

export function SocialManager({ links }: { links: SocialLink[] }) {
  const [order, setOrder] = useState(links);
  const [seen, setSeen] = useState(links);
  if (links !== seen) {
    setSeen(links);
    setOrder(links);
  }

  const ids = order.map((l) => l.id);
  function reorder(newIds: string[]) {
    const map = new Map(order.map((l) => [l.id, l]));
    setOrder(newIds.map((id) => map.get(id)!));
    reorderSocial(newIds);
  }

  return (
    <div className="flex flex-col gap-6">
      <details>
        <summary className="cursor-pointer text-sm font-medium text-accent">
          + Add new link
        </summary>
        <div className="mt-4">
          <Card>
            <SocialForm />
          </Card>
        </div>
      </details>

      <AccordionGroup>
        <SortableList ids={ids} onReorder={reorder}>
          <div className="flex flex-col gap-3">
            {order.map((link) => (
              <SortableItem key={link.id} id={link.id}>
                {({ handleProps, isDragging }) => (
                  <Card>
                    <div className={isDragging ? "opacity-60" : ""}>
                      <Accordion
                        id={link.id}
                        title={
                          <span className="flex items-center gap-2">
                            <span className="grid size-5 place-items-center text-muted">
                              {link.logo_url ? (
                                <img
                                  src={link.logo_url}
                                  alt=""
                                  aria-hidden
                                  className="size-5 object-contain"
                                />
                              ) : (
                                <LinkSimple weight="bold" className="size-4" />
                              )}
                            </span>
                            {link.label}
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
                          <SocialForm link={link} />
                          <ActionForm action={deleteSocial}>
                            <input type="hidden" name="id" value={link.id} />
                            <DeleteButton>Delete link</DeleteButton>
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
