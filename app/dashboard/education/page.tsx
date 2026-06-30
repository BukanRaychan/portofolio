import { createClient } from "@/lib/supabase/server";
import type { Education } from "@/lib/database.types";
import { EducationManager } from "../EducationManager";

export default async function EducationPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("education")
    .select("*")
    .order("sort_order");

  return <EducationManager items={(data ?? []) as Education[]} />;
}
