import { createClient } from "@/lib/supabase/server";
import type { TechStack } from "@/lib/database.types";
import { saveTech, deleteTech } from "../actions";
import { Field, Input, SaveButton, DeleteButton, Card } from "../ui";

function TechForm({ tech }: { tech?: TechStack }) {
  return (
    <form action={saveTech} className="flex flex-col gap-4">
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
        <Field label="…or upload logo">
          <Input name="logo_file" type="file" accept="image/*" />
        </Field>
        <Field label="Sort order">
          <Input name="sort_order" type="number" defaultValue={tech?.sort_order ?? 0} />
        </Field>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            name="needs_inversion"
            defaultChecked={tech?.needs_inversion ?? false}
          />
          Invert in dark mode
        </label>
      </div>
      <SaveButton>{tech ? "Save" : "Add tech"}</SaveButton>
    </form>
  );
}

export default async function TechPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tech_stack")
    .select("*")
    .order("sort_order");
  const items = (data ?? []) as TechStack[];

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

      {items.map((tech) => (
        <Card key={tech.id}>
          <TechForm tech={tech} />
          <form action={deleteTech} className="mt-3">
            <input type="hidden" name="id" value={tech.id} />
            <DeleteButton />
          </form>
        </Card>
      ))}
    </div>
  );
}
