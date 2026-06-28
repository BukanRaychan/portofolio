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

type Client = Awaited<ReturnType<typeof requireAdmin>>;

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

// ---- Storage helpers ----
const MEDIA_PREFIX = "/storage/v1/object/public/media/";

// Returns the bucket path if the URL points at our media bucket, else null.
function storagePath(url: string | null | undefined): string | null {
  if (!url) return null;
  const i = url.indexOf(MEDIA_PREFIX);
  return i === -1
    ? null
    : decodeURIComponent(url.slice(i + MEDIA_PREFIX.length));
}

// Deletes any of the given URLs that live in our media bucket.
async function removeStorage(supabase: Client, ...urls: (string | null)[]) {
  const paths = urls
    .map(storagePath)
    .filter((p): p is string => p !== null);
  if (paths.length) await supabase.storage.from("media").remove(paths);
}

// Uploads a File form field to the media bucket, returns its public URL.
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
  const { data: prev } = await supabase
    .from("site_settings")
    .select("avatar_url")
    .eq("id", 1)
    .single();

  const uploadedAvatar = await uploadIfPresent(
    supabase,
    formData.get("avatar_file"),
  );
  const avatar_url = uploadedAvatar ?? str(formData.get("avatar_url"));

  await supabase
    .from("site_settings")
    .update({
      name: str(formData.get("name")) ?? "",
      hero_title: str(formData.get("hero_title")) ?? "",
      hero_role: str(formData.get("hero_role")) ?? "",
      hero_subtitle: str(formData.get("hero_subtitle")) ?? "",
      bio: str(formData.get("bio")),
      avatar_url,
      email: str(formData.get("email")) ?? "",
      interests: toArray(formData.get("interests")),
      socials: {
        github: str(formData.get("github")),
        linkedin: str(formData.get("linkedin")),
        instagram: str(formData.get("instagram")),
        tiktok: str(formData.get("tiktok")),
      },
    })
    .eq("id", 1);

  if (prev?.avatar_url && prev.avatar_url !== avatar_url) {
    await removeStorage(supabase, prev.avatar_url);
  }
  done();
}

// ---- Works ----
export async function saveWork(formData: FormData) {
  const supabase = await requireAdmin();
  const id = str(formData.get("id"));
  const uploaded = await uploadIfPresent(supabase, formData.get("logo_file"));
  const place_logo_url = uploaded ?? str(formData.get("place_logo_url"));

  // images are managed separately (add/delete), not touched on save.
  const row = {
    category: str(formData.get("category")) ?? "project",
    title: str(formData.get("title")) ?? "",
    position: str(formData.get("position")),
    place: str(formData.get("place")),
    place_logo_url,
    period: str(formData.get("period")),
    description: str(formData.get("description")),
    link: str(formData.get("link")),
    technologies: toArray(formData.get("technologies")),
    sort_order: Number(formData.get("sort_order") ?? 0),
  };

  if (id) {
    const { data: prev } = await supabase
      .from("works")
      .select("place_logo_url")
      .eq("id", id)
      .single();
    await supabase.from("works").update(row).eq("id", id);
    if (prev?.place_logo_url && prev.place_logo_url !== place_logo_url) {
      await removeStorage(supabase, prev.place_logo_url);
    }
  } else {
    await supabase.from("works").insert(row);
  }
  done("/dashboard/works");
}

export async function deleteWork(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const { data } = await supabase
    .from("works")
    .select("place_logo_url, images")
    .eq("id", id)
    .single();
  await supabase.from("works").delete().eq("id", id);
  await removeStorage(supabase, data?.place_logo_url ?? null, ...(data?.images ?? []));
  done("/dashboard/works");
}

export async function addWorkImage(formData: FormData) {
  const supabase = await requireAdmin();
  const workId = String(formData.get("work_id"));
  const uploaded = await uploadIfPresent(supabase, formData.get("image_file"));
  const url = uploaded ?? str(formData.get("image_url"));
  if (url) {
    const { data } = await supabase
      .from("works")
      .select("images")
      .eq("id", workId)
      .single();
    await supabase
      .from("works")
      .update({ images: [...(data?.images ?? []), url] })
      .eq("id", workId);
  }
  done("/dashboard/works");
}

export async function deleteWorkImage(formData: FormData) {
  const supabase = await requireAdmin();
  const workId = String(formData.get("work_id"));
  const url = String(formData.get("url"));
  const { data } = await supabase
    .from("works")
    .select("images")
    .eq("id", workId)
    .single();
  await supabase
    .from("works")
    .update({ images: (data?.images ?? []).filter((u) => u !== url) })
    .eq("id", workId);
  await removeStorage(supabase, url);
  done("/dashboard/works");
}

// ---- Tech stack ----
export async function saveTech(formData: FormData) {
  const supabase = await requireAdmin();
  const id = str(formData.get("id"));
  const uploaded = await uploadIfPresent(supabase, formData.get("logo_file"));
  const logo_url = uploaded ?? str(formData.get("logo_url"));
  const row = {
    slug: str(formData.get("slug")) ?? "",
    name: str(formData.get("name")) ?? "",
    logo_url,
    needs_inversion: formData.get("needs_inversion") === "on",
  };

  if (id) {
    const { data: prev } = await supabase
      .from("tech_stack")
      .select("logo_url")
      .eq("id", id)
      .single();
    await supabase.from("tech_stack").update(row).eq("id", id);
    if (prev?.logo_url && prev.logo_url !== logo_url) {
      await removeStorage(supabase, prev.logo_url);
    }
  } else {
    const { count } = await supabase
      .from("tech_stack")
      .select("*", { count: "exact", head: true });
    await supabase.from("tech_stack").insert({ ...row, sort_order: count ?? 0 });
  }
  done("/dashboard/tech");
}

export async function deleteTech(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const { data } = await supabase
    .from("tech_stack")
    .select("logo_url")
    .eq("id", id)
    .single();
  await supabase.from("tech_stack").delete().eq("id", id);
  await removeStorage(supabase, data?.logo_url ?? null);
  done("/dashboard/tech");
}

// Persist a new tech order from drag-to-reorder. Only revalidates the public
// site — not the dashboard route — so it doesn't re-render and fight Swapy.
export async function reorderTech(ids: string[]) {
  const supabase = await requireAdmin();
  await Promise.all(
    ids.map((id, i) =>
      supabase.from("tech_stack").update({ sort_order: i }).eq("id", id),
    ),
  );
  revalidatePath("/");
}

// ---- Education ----
export async function saveEducation(formData: FormData) {
  const supabase = await requireAdmin();
  const id = str(formData.get("id"));
  const uploaded = await uploadIfPresent(supabase, formData.get("logo_file"));
  const logo_url = uploaded ?? str(formData.get("logo_url"));
  const row = {
    institution: str(formData.get("institution")) ?? "",
    degree: str(formData.get("degree")) ?? "",
    period: str(formData.get("period")),
    gpa: str(formData.get("gpa")),
    description: str(formData.get("description")),
    logo_url,
    sort_order: Number(formData.get("sort_order") ?? 0),
  };

  if (id) {
    const { data: prev } = await supabase
      .from("education")
      .select("logo_url")
      .eq("id", id)
      .single();
    await supabase.from("education").update(row).eq("id", id);
    if (prev?.logo_url && prev.logo_url !== logo_url) {
      await removeStorage(supabase, prev.logo_url);
    }
  } else {
    await supabase.from("education").insert(row);
  }
  done("/dashboard/education");
}

export async function deleteEducation(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const { data } = await supabase
    .from("education")
    .select("logo_url")
    .eq("id", id)
    .single();
  await supabase.from("education").delete().eq("id", id);
  await removeStorage(supabase, data?.logo_url ?? null);
  done("/dashboard/education");
}

// ---- Auth ----
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
