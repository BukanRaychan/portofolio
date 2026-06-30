import { createClient } from "@/lib/supabase/server";
import type { AboutEntry } from "@/lib/database.types";
import { CredentialsManager } from "../CredentialsManager";

export default async function CredentialsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("about_entries")
    .select("*")
    .order("kind")
    .order("sort_order");

  return <CredentialsManager entries={(data ?? []) as AboutEntry[]} />;
}
