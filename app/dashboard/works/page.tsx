import { createClient } from "@/lib/supabase/server";
import type { Work } from "@/lib/database.types";
import { WorksManager } from "../WorksManager";

export default async function WorksPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("works")
    .select("*")
    .order("category")
    .order("sort_order");

  return <WorksManager works={(data ?? []) as Work[]} />;
}
