"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { DotsSixVertical, SortAscending } from "@phosphor-icons/react";
import type { Work } from "@/lib/database.types";
import {
  saveWork,
  deleteWork,
  addWorkImage,
  deleteWorkImage,
  reorderWorks,
  reorderWorkImages,
} from "./actions";
import { Field, Input, Textarea, SaveButton, DeleteButton, Card } from "./ui";
import { FileInput } from "./FileInput";
import { ActionForm } from "./ActionForm";
import { AccordionGroup, Accordion } from "./Accordion";
import { SortableList, SortableItem } from "./Sortable";

function WorkForm({ work }: { work?: Work }) {
  return (
    <ActionForm
      action={saveWork}
      resetOnSuccess={!work}
      className="flex flex-col gap-4"
    >
      {work && <input type="hidden" name="id" value={work.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <select
            name="category"
            defaultValue={work?.category ?? "project"}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="experience">Experience</option>
            <option value="project">Project</option>
          </select>
        </Field>
        <Field label="Title">
          <Input name="title" defaultValue={work?.title ?? ""} required />
        </Field>
        <Field label="Position">
          <Input name="position" defaultValue={work?.position ?? ""} />
        </Field>
        <Field label="Place">
          <Input name="place" defaultValue={work?.place ?? ""} />
        </Field>
        <Field label="Link (optional)">
          <Input name="link" defaultValue={work?.link ?? ""} />
        </Field>
        <Field label="Start date">
          <Input
            name="start_date"
            defaultValue={work?.start_date ?? ""}
            placeholder="e.g. Jan 2024"
          />
        </Field>
        <Field label="End date (blank = Ongoing)">
          <Input
            name="end_date"
            defaultValue={work?.end_date ?? ""}
            placeholder="e.g. Mar 2025"
          />
        </Field>
      </div>
      <Field label="Technologies (slugs, comma separated)">
        <Input
          name="technologies"
          defaultValue={work?.technologies.join(", ") ?? ""}
        />
      </Field>
      <Field label="Description">
        <Textarea name="description" defaultValue={work?.description ?? ""} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Place logo URL">
          <Input name="place_logo_url" defaultValue={work?.place_logo_url ?? ""} />
        </Field>
        <Field label="…or upload place logo (takes priority)">
          <FileInput name="logo_file" />
        </Field>
      </div>
      <SaveButton>{work ? "Save" : "Add work"}</SaveButton>
    </ActionForm>
  );
}

function WorkImages({ work }: { work: Work }) {
  const [imgs, setImgs] = useState(work.images);
  const [seen, setSeen] = useState(work.images);
  if (work.images !== seen) {
    setSeen(work.images);
    setImgs(work.images);
  }

  function reorder(newOrder: string[]) {
    setImgs(newOrder);
    reorderWorkImages(work.id, newOrder);
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      <span className="text-xs font-medium text-muted">
        Images {imgs.length > 1 && "(drag the grip to reorder)"}
      </span>

      {imgs.length > 0 && (
        <SortableList ids={imgs} onReorder={reorder} strategy="grid">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {imgs.map((url) => (
              <SortableItem key={url} id={url}>
                {({ handleProps, isDragging }) => (
                  <div
                    className={`group relative aspect-video overflow-hidden rounded-lg border border-border ${
                      isDragging ? "opacity-60" : ""
                    }`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <span
                      {...handleProps}
                      aria-label="Drag to reorder"
                      className="absolute left-1 top-1 grid size-6 cursor-grab touch-none place-items-center rounded-md bg-background/90 text-muted opacity-100 transition-opacity duration-150 active:cursor-grabbing sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <DotsSixVertical weight="bold" className="size-4" />
                    </span>
                    <ActionForm
                      action={deleteWorkImage}
                      className="absolute right-1 top-1 opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <input type="hidden" name="work_id" value={work.id} />
                      <input type="hidden" name="url" value={url} />
                      <button className="rounded-md bg-background/90 px-1.5 py-0.5 text-xs font-medium text-accent outline-none transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.94] focus-visible:ring-2 focus-visible:ring-accent">
                        Delete
                      </button>
                    </ActionForm>
                  </div>
                )}
              </SortableItem>
            ))}
          </div>
        </SortableList>
      )}

      <ActionForm
        action={addWorkImage}
        resetOnSuccess
        className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-3"
      >
        <input type="hidden" name="work_id" value={work.id} />
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="Image URL">
            <Input name="image_url" placeholder="https://…" />
          </Field>
          <Field label="…or upload image (takes priority)">
            <FileInput name="image_file" />
          </Field>
        </div>
        <SaveButton>Add image</SaveButton>
      </ActionForm>
    </div>
  );
}

// Sort key for "sort by end date": ongoing (no end) floats to the top, then
// most-recent end year first.
function endKey(w: Work): number {
  if (!w.end_date?.trim()) return Number.POSITIVE_INFINITY;
  const y = w.end_date.match(/\d{4}/);
  return y ? Number(y[0]) : 0;
}

function Column({
  heading,
  category,
  works,
}: {
  heading: string;
  category: string;
  works: Work[];
}) {
  const [order, setOrder] = useState(() =>
    works.filter((w) => w.category === category),
  );
  // Resync only when new server data arrives; reorder revalidates "/" only.
  const [seen, setSeen] = useState(works);
  if (works !== seen) {
    setSeen(works);
    setOrder(works.filter((w) => w.category === category));
  }

  const ids = order.map((w) => w.id);
  function reorder(newIds: string[]) {
    const map = new Map(order.map((w) => [w.id, w]));
    setOrder(newIds.map((id) => map.get(id)!));
    reorderWorks(newIds);
  }

  function sortByEndDate() {
    const sorted = [...order].sort((a, b) => endKey(b) - endKey(a));
    setOrder(sorted);
    reorderWorks(sorted.map((w) => w.id));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">{heading}</h2>
        {order.length > 1 && (
          <button
            type="button"
            onClick={sortByEndDate}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted outline-none transition-[transform,color,border-color] duration-150 ease-[var(--ease-out)] hover:border-accent hover:text-accent active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-accent"
          >
            <SortAscending weight="bold" className="size-4" />
            End date
          </button>
        )}
      </div>
      <SortableList ids={ids} onReorder={reorder}>
        <div className="flex flex-col gap-4">
          {order.map((work) => (
            <SortableItem key={work.id} id={work.id}>
              {({ handleProps, isDragging }) => (
                <Card>
                  <div className={isDragging ? "opacity-60" : ""}>
                    <Accordion
                      id={work.id}
                      title={work.title}
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
                        <WorkForm work={work} />
                        <WorkImages work={work} />
                        <ActionForm action={deleteWork}>
                          <input type="hidden" name="id" value={work.id} />
                          <DeleteButton>Delete work</DeleteButton>
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

export function WorksManager({ works }: { works: Work[] }) {
  return (
    <div className="flex flex-col gap-8">
      <details>
        <summary className="cursor-pointer text-sm font-medium text-accent">
          + Add new work
        </summary>
        <div className="mt-4">
          <Card>
            <WorkForm />
          </Card>
        </div>
      </details>

      <AccordionGroup>
        <div className="grid gap-8 lg:grid-cols-2">
          <Column heading="Experience" category="experience" works={works} />
          <Column heading="Projects" category="project" works={works} />
        </div>
      </AccordionGroup>
    </div>
  );
}
