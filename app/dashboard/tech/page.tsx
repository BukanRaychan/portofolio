import { createClient } from "@/lib/supabase/server";
import type { TechStack } from "@/lib/database.types";
import { TechManager } from "../TechManager";

export default async function TechPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tech_stack")
    .select("*")
    .order("sort_order");

  return <TechManager techs={(data ?? []) as TechStack[]} />;
}
