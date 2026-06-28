import { createClient } from "@/lib/supabase/server";
import type { TechStack } from "@/lib/database.types";
import { SwapyTech } from "./SwapyTech";

export default async function TechPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tech_stack")
    .select("*")
    .order("sort_order");
  const items = (data ?? []) as TechStack[];

  return <SwapyTech techs={items} />;
}
