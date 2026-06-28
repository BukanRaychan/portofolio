import { createClient } from "@/lib/supabase/server";
import type { Socials } from "@/lib/database.types";
import { saveSettings } from "./actions";
import { Field, Input, Textarea, SaveButton, Card } from "./ui";
import { FileInput } from "./FileInput";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (!data) return <p className="text-muted">No settings row found.</p>;
  const socials = (data.socials ?? {}) as Socials;

  return (
    <Card>
      <form action={saveSettings} className="flex flex-col gap-5">
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
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="GitHub URL">
            <Input name="github" defaultValue={socials.github ?? ""} />
          </Field>
          <Field label="LinkedIn URL">
            <Input name="linkedin" defaultValue={socials.linkedin ?? ""} />
          </Field>
          <Field label="Instagram URL">
            <Input name="instagram" defaultValue={socials.instagram ?? ""} />
          </Field>
          <Field label="TikTok URL">
            <Input name="tiktok" defaultValue={socials.tiktok ?? ""} />
          </Field>
        </div>
        <SaveButton>Save settings</SaveButton>
      </form>
    </Card>
  );
}
