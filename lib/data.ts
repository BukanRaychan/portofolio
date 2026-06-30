import { createClient } from "@/lib/supabase/server";
import type {
  SiteSettings,
  Education,
  TechStack,
  Work,
  AboutEntry,
  SocialLink,
} from "@/lib/database.types";

export async function getPortfolio() {
  const supabase = await createClient();

  const [settings, education, tech, works, aboutEntries, socials] =
    await Promise.all([
      supabase.from("site_settings").select("*").eq("id", 1).single(),
      supabase.from("education").select("*").order("sort_order"),
      supabase.from("tech_stack").select("*").order("sort_order"),
      supabase.from("works").select("*").order("category").order("sort_order"),
      supabase.from("about_entries").select("*").order("kind").order("sort_order"),
      supabase.from("social_links").select("*").order("sort_order"),
    ]);

  return {
    settings: settings.data as SiteSettings | null,
    education: (education.data ?? []) as Education[],
    tech: (tech.data ?? []) as TechStack[],
    works: (works.data ?? []) as Work[],
    aboutEntries: (aboutEntries.data ?? []) as AboutEntry[],
    socials: (socials.data ?? []) as SocialLink[],
  };
}

export type Portfolio = Awaited<ReturnType<typeof getPortfolio>>;
