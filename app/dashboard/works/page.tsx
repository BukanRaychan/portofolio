import { createClient } from "@/lib/supabase/server";
import type { Work } from "@/lib/database.types";
import { saveWork, deleteWork } from "../actions";
import { Field, Input, Textarea, SaveButton, DeleteButton, Card } from "../ui";

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
      <Field label="Image URLs (comma or newline separated)">
        <Textarea name="images" defaultValue={work?.images.join("\n") ?? ""} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Place logo URL">
          <Input name="place_logo_url" defaultValue={work?.place_logo_url ?? ""} />
        </Field>
        <Field label="…or upload place logo">
          <Input name="logo_file" type="file" accept="image/*" />
        </Field>
      </div>
      <div className="flex items-center gap-3">
        <SaveButton>{work ? "Save" : "Add work"}</SaveButton>
      </div>
    </form>
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
          <details>
            <summary className="cursor-pointer font-medium">
              {work.title}
            </summary>
            <div className="mt-4 flex flex-col gap-4">
              <WorkForm work={work} />
              <form action={deleteWork}>
                <input type="hidden" name="id" value={work.id} />
                <DeleteButton />
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
