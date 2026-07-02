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

// Result returned to forms (via useActionState) so the UI can toast success/error.
export type ActionResult = { ok: boolean; message: string };

// Wraps a form action's DB work: requireAdmin runs first (its redirect must
// propagate, not be swallowed), then anything that throws becomes an error toast.
async function run(
  fn: (supabase: Client) => Promise<string>,
): Promise<ActionResult> {
  const supabase = await requireAdmin();
  try {
    const message = await fn(supabase);
    return { ok: true, message };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Something went wrong",
    };
  }
}

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
export async function saveSettings(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return run(async (supabase) => {
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
      })
      .eq("id", 1);

    if (prev?.avatar_url && prev.avatar_url !== avatar_url) {
      await removeStorage(supabase, prev.avatar_url);
    }
    done();
    return "Settings saved";
  });
}

// ---- Works ----
export async function saveWork(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return run(async (supabase) => {
    const id = str(formData.get("id"));
    const uploaded = await uploadIfPresent(supabase, formData.get("logo_file"));
    const place_logo_url = uploaded ?? str(formData.get("place_logo_url"));
    const category = str(formData.get("category")) ?? "project";

    // sort_order is owned by drag-to-reorder, not the form. images too.
    const row = {
      category,
      title: str(formData.get("title")) ?? "",
      position: str(formData.get("position")),
      place: str(formData.get("place")),
      place_logo_url,
      start_date: str(formData.get("start_date")),
      end_date: str(formData.get("end_date")),
      description: str(formData.get("description")),
      link: str(formData.get("link")),
      technologies: toArray(formData.get("technologies")),
      // Both are project-only: a project may link to a parent experience and
      // carry a GitHub repo. Experiences always clear them.
      github_link:
        category === "project" ? str(formData.get("github_link")) : null,
      experience_id:
        category === "project" ? str(formData.get("experience_id")) : null,
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
      done("/dashboard/works");
      return "Work saved";
    }

    const { count } = await supabase
      .from("works")
      .select("*", { count: "exact", head: true })
      .eq("category", category);
    await supabase.from("works").insert({ ...row, sort_order: count ?? 0 });
    done("/dashboard/works");
    return "Work added";
  });
}

export async function deleteWork(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return run(async (supabase) => {
    const id = String(formData.get("id"));
    const { data } = await supabase
      .from("works")
      .select("place_logo_url, images")
      .eq("id", id)
      .single();
    await supabase.from("works").delete().eq("id", id);
    await removeStorage(
      supabase,
      data?.place_logo_url ?? null,
      ...(data?.images ?? []),
    );
    done("/dashboard/works");
    return "Work deleted";
  });
}

export async function addWorkImage(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return run(async (supabase) => {
    const workId = String(formData.get("work_id"));
    const uploaded = await uploadIfPresent(supabase, formData.get("image_file"));
    const url = uploaded ?? str(formData.get("image_url"));
    if (!url) throw new Error("Provide an image URL or upload a file");
    const { data } = await supabase
      .from("works")
      .select("images")
      .eq("id", workId)
      .single();
    await supabase
      .from("works")
      .update({ images: [...(data?.images ?? []), url] })
      .eq("id", workId);
    done("/dashboard/works");
    return "Image added";
  });
}

export async function deleteWorkImage(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return run(async (supabase) => {
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
    return "Image deleted";
  });
}

// Persist a new image order from drag-to-reorder. Only revalidates the public
// site so the dashboard keeps its optimistic order without a refetch.
export async function reorderWorkImages(workId: string, urls: string[]) {
  const supabase = await requireAdmin();
  await supabase.from("works").update({ images: urls }).eq("id", workId);
  revalidatePath("/");
}

// ---- Tech stack ----
export async function saveTech(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return run(async (supabase) => {
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
      done("/dashboard/tech");
      return "Tech saved";
    }

    const { count } = await supabase
      .from("tech_stack")
      .select("*", { count: "exact", head: true });
    await supabase.from("tech_stack").insert({ ...row, sort_order: count ?? 0 });
    done("/dashboard/tech");
    return "Tech added";
  });
}

export async function deleteTech(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return run(async (supabase) => {
    const id = String(formData.get("id"));
    const { data } = await supabase
      .from("tech_stack")
      .select("logo_url")
      .eq("id", id)
      .single();
    await supabase.from("tech_stack").delete().eq("id", id);
    await removeStorage(supabase, data?.logo_url ?? null);
    done("/dashboard/tech");
    return "Tech deleted";
  });
}

// Persist a new tech order from drag-to-reorder. Only revalidates the public
// site so the dashboard keeps its optimistic order without a refetch.
export async function reorderTech(ids: string[]) {
  const supabase = await requireAdmin();
  await Promise.all(
    ids.map((id, i) =>
      supabase.from("tech_stack").update({ sort_order: i }).eq("id", id),
    ),
  );
  revalidatePath("/");
}

// Persist a new works order from drag-to-reorder (within a category).
export async function reorderWorks(ids: string[]) {
  const supabase = await requireAdmin();
  await Promise.all(
    ids.map((id, i) =>
      supabase.from("works").update({ sort_order: i }).eq("id", id),
    ),
  );
  revalidatePath("/");
}

// ---- Education ----
export async function saveEducation(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return run(async (supabase) => {
    const id = str(formData.get("id"));
    const uploaded = await uploadIfPresent(supabase, formData.get("logo_file"));
    const logo_url = uploaded ?? str(formData.get("logo_url"));
    const row = {
      institution: str(formData.get("institution")) ?? "",
      degree: str(formData.get("degree")) ?? "",
      period: str(formData.get("period")),
      gpa: str(formData.get("gpa")),
      description: str(formData.get("description")),
      ongoing: formData.get("ongoing") === "on",
      is_external: formData.get("is_external") === "on",
      logo_url,
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
      done("/dashboard/education");
      return "Education saved";
    }

    const { count } = await supabase
      .from("education")
      .select("*", { count: "exact", head: true });
    await supabase.from("education").insert({ ...row, sort_order: count ?? 0 });
    done("/dashboard/education");
    return "Education added";
  });
}

// Persist a new education order from drag-to-reorder.
export async function reorderEducation(ids: string[]) {
  const supabase = await requireAdmin();
  await Promise.all(
    ids.map((id, i) =>
      supabase.from("education").update({ sort_order: i }).eq("id", id),
    ),
  );
  revalidatePath("/");
}

export async function deleteEducation(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return run(async (supabase) => {
    const id = String(formData.get("id"));
    const { data } = await supabase
      .from("education")
      .select("logo_url")
      .eq("id", id)
      .single();
    await supabase.from("education").delete().eq("id", id);
    await removeStorage(supabase, data?.logo_url ?? null);
    done("/dashboard/education");
    return "Education deleted";
  });
}

// ---- About entries (certification / achievement / organization) ----
export async function saveAboutEntry(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return run(async (supabase) => {
    const id = str(formData.get("id"));
    const kind = str(formData.get("kind")) ?? "certification";
    const uploaded = await uploadIfPresent(supabase, formData.get("logo_file"));
    const logo_url = uploaded ?? str(formData.get("logo_url"));
    const row = {
      kind,
      title: str(formData.get("title")) ?? "",
      subtitle: str(formData.get("subtitle")),
      period: str(formData.get("period")),
      description: str(formData.get("description")),
      link: str(formData.get("link")),
      logo_url,
    };

    if (id) {
      const { data: prev } = await supabase
        .from("about_entries")
        .select("logo_url")
        .eq("id", id)
        .single();
      await supabase.from("about_entries").update(row).eq("id", id);
      if (prev?.logo_url && prev.logo_url !== logo_url) {
        await removeStorage(supabase, prev.logo_url);
      }
      done("/dashboard/credentials");
      return "Entry saved";
    }

    const { count } = await supabase
      .from("about_entries")
      .select("*", { count: "exact", head: true })
      .eq("kind", kind);
    await supabase
      .from("about_entries")
      .insert({ ...row, sort_order: count ?? 0 });
    done("/dashboard/credentials");
    return "Entry added";
  });
}

export async function deleteAboutEntry(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return run(async (supabase) => {
    const id = String(formData.get("id"));
    const { data } = await supabase
      .from("about_entries")
      .select("logo_url")
      .eq("id", id)
      .single();
    await supabase.from("about_entries").delete().eq("id", id);
    await removeStorage(supabase, data?.logo_url ?? null);
    done("/dashboard/credentials");
    return "Entry deleted";
  });
}

export async function reorderAboutEntries(ids: string[]) {
  const supabase = await requireAdmin();
  await Promise.all(
    ids.map((id, i) =>
      supabase.from("about_entries").update({ sort_order: i }).eq("id", id),
    ),
  );
  revalidatePath("/");
}

// ---- Social links ----
export async function saveSocial(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return run(async (supabase) => {
    const id = str(formData.get("id"));
    const uploaded = await uploadIfPresent(supabase, formData.get("logo_file"));
    const logo_url = uploaded ?? str(formData.get("logo_url"));
    const row = {
      label: str(formData.get("label")) ?? "",
      link: str(formData.get("link")) ?? "",
      logo_url,
    };
    if (!row.label || !row.link) throw new Error("Label and link are required");

    if (id) {
      const { data: prev } = await supabase
        .from("social_links")
        .select("logo_url")
        .eq("id", id)
        .single();
      await supabase.from("social_links").update(row).eq("id", id);
      if (prev?.logo_url && prev.logo_url !== logo_url) {
        await removeStorage(supabase, prev.logo_url);
      }
      done("/dashboard/social");
      return "Link saved";
    }

    const { count } = await supabase
      .from("social_links")
      .select("*", { count: "exact", head: true });
    await supabase
      .from("social_links")
      .insert({ ...row, sort_order: count ?? 0 });
    done("/dashboard/social");
    return "Link added";
  });
}

export async function deleteSocial(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return run(async (supabase) => {
    const id = String(formData.get("id"));
    const { data } = await supabase
      .from("social_links")
      .select("logo_url")
      .eq("id", id)
      .single();
    await supabase.from("social_links").delete().eq("id", id);
    await removeStorage(supabase, data?.logo_url ?? null);
    done("/dashboard/social");
    return "Link deleted";
  });
}

export async function reorderSocial(ids: string[]) {
  const supabase = await requireAdmin();
  await Promise.all(
    ids.map((id, i) =>
      supabase.from("social_links").update({ sort_order: i }).eq("id", id),
    ),
  );
  revalidatePath("/");
}

// ---- Auth ----
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
