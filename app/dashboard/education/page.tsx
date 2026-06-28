import { createClient } from "@/lib/supabase/server";
import type { Education } from "@/lib/database.types";
import { saveEducation, deleteEducation } from "../actions";
import { Field, Input, Textarea, SaveButton, DeleteButton, Card } from "../ui";
import { FileInput } from "../FileInput";

function EducationForm({ item }: { item?: Education }) {
  return (
    <form action={saveEducation} className="flex flex-col gap-4">
      {item && <input type="hidden" name="id" value={item.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Institution">
          <Input name="institution" defaultValue={item?.institution ?? ""} required />
        </Field>
        <Field label="Period">
          <Input name="period" defaultValue={item?.period ?? ""} />
        </Field>
        <Field label="Degree">
          <Input name="degree" defaultValue={item?.degree ?? ""} required />
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
        <Field label="Sort order">
          <Input name="sort_order" type="number" defaultValue={item?.sort_order ?? 0} />
        </Field>
      </div>
      <Field label="Description">
        <Textarea name="description" defaultValue={item?.description ?? ""} />
      </Field>
      <SaveButton>{item ? "Save" : "Add education"}</SaveButton>
    </form>
  );
}

export default async function EducationPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("education")
    .select("*")
    .order("sort_order");
  const items = (data ?? []) as Education[];

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

      {items.map((item) => (
        <Card key={item.id}>
          <EducationForm item={item} />
          <form action={deleteEducation} className="mt-3">
            <input type="hidden" name="id" value={item.id} />
            <DeleteButton />
          </form>
        </Card>
      ))}
    </div>
  );
}
