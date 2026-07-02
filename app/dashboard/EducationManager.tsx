"use client";

import { useState } from "react";
import { DotsSixVertical } from "@phosphor-icons/react";
import type { Education } from "@/lib/database.types";
import { saveEducation, deleteEducation, reorderEducation } from "./actions";
import { Field, Input, Textarea, SaveButton, InlineDelete, Card } from "./ui";
import { FileInput } from "./FileInput";
import { ActionForm } from "./ActionForm";
import { AccordionGroup, Accordion } from "./Accordion";
import { SortableList, SortableItem } from "./Sortable";

function EducationForm({ item }: { item?: Education }) {
  return (
    <ActionForm
      action={saveEducation}
      resetOnSuccess={!item}
      className="flex flex-col gap-4"
    >
      {item && <input type="hidden" name="id" value={item.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Institution">
          <Input name="institution" defaultValue={item?.institution ?? ""} required />
        </Field>
        <Field label="Degree / program">
          <Input name="degree" defaultValue={item?.degree ?? ""} required />
        </Field>
        <Field label="Period">
          <Input name="period" defaultValue={item?.period ?? ""} placeholder="2021 – 2025" />
        </Field>
        <Field label="GPA">
          <Input name="gpa" defaultValue={item?.gpa ?? ""} />
        </Field>
        <Field label="Logo URL">
          <Input name="logo_url" defaultValue={item?.logo_url ?? ""} />
        </Field>
        <Field label="…or upload logo">
          <FileInput name="logo_file" />
        </Field>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="ongoing" defaultChecked={item?.ongoing ?? false} />
          Ongoing
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_external"
            defaultChecked={item?.is_external ?? false}
          />
          External program (rocket)
        </label>
      </div>
      <Field label="Description">
        <Textarea name="description" defaultValue={item?.description ?? ""} />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <SaveButton>{item ? "Save" : "Add education"}</SaveButton>
        {item && <InlineDelete action={deleteEducation} id={item.id} />}
      </div>
    </ActionForm>
  );
}

export function EducationManager({ items }: { items: Education[] }) {
  const [order, setOrder] = useState(items);
  const [seen, setSeen] = useState(items);
  if (items !== seen) {
    setSeen(items);
    setOrder(items);
  }

  const ids = order.map((e) => e.id);
  function reorder(newIds: string[]) {
    const map = new Map(order.map((e) => [e.id, e]));
    setOrder(newIds.map((id) => map.get(id)!));
    reorderEducation(newIds);
  }

  return (
    <div className="flex flex-col gap-6">
      <details>
        <summary className="cursor-pointer text-sm font-medium text-accent">
          + Add new education
        </summary>
        <div className="mt-4">
          <Card>
            <EducationForm />
          </Card>
        </div>
      </details>

      <AccordionGroup>
        <SortableList ids={ids} onReorder={reorder}>
          <div className="flex flex-col gap-3">
            {order.map((item) => (
              <SortableItem key={item.id} id={item.id}>
                {({ handleProps, isDragging }) => (
                  <Card>
                    <div className={isDragging ? "opacity-60" : ""}>
                      <Accordion
                        id={item.id}
                        title={item.institution}
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
                        <EducationForm item={item} />
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
