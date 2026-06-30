import { createClient } from "@/lib/supabase/server";
import { saveSettings } from "./actions";
import { Field, Input, Textarea, SaveButton, Card } from "./ui";
import { FileInput } from "./FileInput";
import { ActionForm } from "./ActionForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (!data) return <p className="text-muted">No settings row found.</p>;

  return (
    <Card>
      <ActionForm action={saveSettings} className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name">
            <Input name="name" defaultValue={data.name} />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" defaultValue={data.email} />
          </Field>
          <Field label="Hero title">
            <Input name="hero_title" defaultValue={data.hero_title} />
          </Field>
          <Field label="Hero role">
            <Input name="hero_role" defaultValue={data.hero_role} />
          </Field>
        </div>
        <Field label="Hero subtitle">
          <Textarea name="hero_subtitle" defaultValue={data.hero_subtitle} />
        </Field>
        <Field label="About bio (the big statement on the About page)">
          <Textarea name="bio" defaultValue={data.bio ?? ""} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Avatar URL (Home portrait)">
            <Input name="avatar_url" defaultValue={data.avatar_url ?? ""} />
          </Field>
          <Field label="…or upload avatar">
            <FileInput name="avatar_file" />
          </Field>
        </div>
        <Field label="Interests (comma or newline separated)">
          <Textarea name="interests" defaultValue={data.interests.join(", ")} />
        </Field>
        <p className="text-xs text-muted">
          Contact links moved to the{" "}
          <span className="font-medium text-foreground">Social</span> tab — add
          and reorder them there.
        </p>
        <SaveButton>Save settings</SaveButton>
      </ActionForm>
    </Card>
  );
}
