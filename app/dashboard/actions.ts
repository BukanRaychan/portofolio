"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Server-side admin gate. RLS also enforces this, but we fail fast here.
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (
    !user ||
    user.user_metadata?.user_name !== process.env.ADMIN_GITHUB_USERNAME
  ) {
    redirect("/login");
  }
  return supabase;
}

// Splits a textarea/CSV field into a trimmed string array.
function toArray(value: FormDataEntryValue | null): string[] {
  if (!value) return [];
  return String(value)
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function str(value: FormDataEntryValue | null): string | null {
  const v = value ? String(value).trim() : "";
  return v.length ? v : null;
}

type Client = Awaited<ReturnType<typeof requireAdmin>>;

// Uploads a File from a form field to the media bucket, returns its public URL.
async function uploadIfPresent(
  supabase: Client,
  file: FormDataEntryValue | null,
): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

function done(path = "/dashboard") {
  revalidatePath("/");
  revalidatePath(path);
}

// ---- Site settings ----
export async function saveSettings(formData: FormData) {
  const supabase = await requireAdmin();
  const uploadedAvatar = await uploadIfPresent(
    supabase,
    formData.get("avatar_file"),
  );
  const uploadedFavicon = await uploadIfPresent(
    supabase,
    formData.get("favicon_file"),
  );
  await supabase.from("site_settings").update({
    name: str(formData.get("name")) ?? "",
    hero_title: str(formData.get("hero_title")) ?? "",
    hero_role: str(formData.get("hero_role")) ?? "",
    hero_subtitle: str(formData.get("hero_subtitle")) ?? "",
    bio: str(formData.get("bio")),
    avatar_url: uploadedAvatar ?? str(formData.get("avatar_url")),
    favicon_url: uploadedFavicon ?? str(formData.get("favicon_url")),
    email: str(formData.get("email")) ?? "",
    interests: toArray(formData.get("interests")),
    socials: {
      github: str(formData.get("github")),
      linkedin: str(formData.get("linkedin")),
      instagram: str(formData.get("instagram")),
      tiktok: str(formData.get("tiktok")),
    },
  }).eq("id", 1);
  done();
}

// ---- Works ----
export async function saveWork(formData: FormData) {
  const supabase = await requireAdmin();
  const id = str(formData.get("id"));
  const uploaded = await uploadIfPresent(supabase, formData.get("logo_file"));
  const row = {
    category: str(formData.get("category")) ?? "project",
    title: str(formData.get("title")) ?? "",
    position: str(formData.get("position")),
    place: str(formData.get("place")),
    place_logo_url: uploaded ?? str(formData.get("place_logo_url")),
    period: str(formData.get("period")),
    description: str(formData.get("description")),
    link: str(formData.get("link")),
    technologies: toArray(formData.get("technologies")),
    images: toArray(formData.get("images")),
    sort_order: Number(formData.get("sort_order") ?? 0),
  };
  if (id) await supabase.from("works").update(row).eq("id", id);
  else await supabase.from("works").insert(row);
  done("/dashboard/works");
}

export async function deleteWork(formData: FormData) {
  const supabase = await requireAdmin();
  await supabase.from("works").delete().eq("id", String(formData.get("id")));
  done("/dashboard/works");
}

// ---- Tech stack ----
export async function saveTech(formData: FormData) {
  const supabase = await requireAdmin();
  const id = str(formData.get("id"));
  const uploaded = await uploadIfPresent(supabase, formData.get("logo_file"));
  const row = {
    slug: str(formData.get("slug")) ?? "",
    name: str(formData.get("name")) ?? "",
    logo_url: uploaded ?? str(formData.get("logo_url")),
    needs_inversion: formData.get("needs_inversion") === "on",
    sort_order: Number(formData.get("sort_order") ?? 0),
  };
  if (id) await supabase.from("tech_stack").update(row).eq("id", id);
  else await supabase.from("tech_stack").insert(row);
  done("/dashboard/tech");
}

export async function deleteTech(formData: FormData) {
  const supabase = await requireAdmin();
  await supabase.from("tech_stack").delete().eq("id", String(formData.get("id")));
  done("/dashboard/tech");
}

// ---- Education ----
export async function saveEducation(formData: FormData) {
  const supabase = await requireAdmin();
  const id = str(formData.get("id"));
  const uploaded = await uploadIfPresent(supabase, formData.get("logo_file"));
  const row = {
    institution: str(formData.get("institution")) ?? "",
    degree: str(formData.get("degree")) ?? "",
    period: str(formData.get("period")),
    gpa: str(formData.get("gpa")),
    description: str(formData.get("description")),
    logo_url: uploaded ?? str(formData.get("logo_url")),
    sort_order: Number(formData.get("sort_order") ?? 0),
  };
  if (id) await supabase.from("education").update(row).eq("id", id);
  else await supabase.from("education").insert(row);
  done("/dashboard/education");
}

export async function deleteEducation(formData: FormData) {
  const supabase = await requireAdmin();
  await supabase.from("education").delete().eq("id", String(formData.get("id")));
  done("/dashboard/education");
}

// ---- Auth ----
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
