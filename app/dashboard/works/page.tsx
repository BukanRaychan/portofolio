/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import type { Work } from "@/lib/database.types";
import {
  saveWork,
  deleteWork,
  addWorkImage,
  deleteWorkImage,
} from "../actions";
import { Field, Input, Textarea, SaveButton, DeleteButton, Card } from "../ui";
import { FileInput } from "../FileInput";

function WorkForm({ work }: { work?: Work }) {
  return (
    <form action={saveWork} className="flex flex-col gap-4">
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
        <Field label="Sort order">
          <Input name="sort_order" type="number" defaultValue={work?.sort_order ?? 0} />
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
        <Field label="Period">
          <Input name="period" defaultValue={work?.period ?? ""} />
        </Field>
        <Field label="Link (optional)">
          <Input name="link" defaultValue={work?.link ?? ""} />
        </Field>
        <Field label="Technologies (slugs, comma separated)">
          <Input
            name="technologies"
            defaultValue={work?.technologies.join(", ") ?? ""}
          />
        </Field>
      </div>
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
    </form>
  );
}

function WorkImages({ work }: { work: Work }) {
  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      <span className="text-xs font-medium text-muted">Images</span>
      {work.images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {work.images.map((url) => (
            <div
              key={url}
              className="group relative aspect-video overflow-hidden rounded-lg border border-border"
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
              <form
                action={deleteWorkImage}
                className="absolute right-1 top-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              >
                <input type="hidden" name="work_id" value={work.id} />
                <input type="hidden" name="url" value={url} />
                <button className="rounded-md bg-background/90 px-1.5 py-0.5 text-xs font-medium text-accent outline-none transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.94] focus-visible:ring-2 focus-visible:ring-accent">
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
      <form
        action={addWorkImage}
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
      </form>
    </div>
  );
}

export default async function WorksPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("works")
    .select("*")
    .order("category")
    .order("sort_order");
  const works = (data ?? []) as Work[];
  const experiences = works.filter((w) => w.category === "experience");
  const projects = works.filter((w) => w.category === "project");

  const column = (heading: string, items: Work[]) => (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight">{heading}</h2>
      {items.map((work) => (
        <Card key={work.id}>
          <details name="works">
            <summary className="cursor-pointer font-medium">
              {work.title}
            </summary>
            <div className="mt-4 flex flex-col gap-4">
              <WorkForm work={work} />
              <WorkImages work={work} />
              <form action={deleteWork}>
                <input type="hidden" name="id" value={work.id} />
                <DeleteButton>Delete work</DeleteButton>
              </form>
            </div>
          </details>
        </Card>
      ))}
    </div>
  );

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

      <div className="grid gap-8 lg:grid-cols-2">
        {column("Experience", experiences)}
        {column("Projects", projects)}
      </div>
    </div>
  );
}
