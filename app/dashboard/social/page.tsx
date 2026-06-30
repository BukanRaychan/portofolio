import { createClient } from "@/lib/supabase/server";
import type { SocialLink } from "@/lib/database.types";
import { SocialManager } from "../SocialManager";

export default async function SocialPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("social_links")
    .select("*")
    .order("sort_order");

  return <SocialManager links={(data ?? []) as SocialLink[]} />;
}
