import Link from "next/link";
import { getPortfolio } from "@/lib/data";
import { Deck } from "./_components/Deck";

export default async function Home() {
  const data = await getPortfolio();

  if (!data.settings) {
    return (
      <main className="grid min-h-dvh place-items-center px-6 text-center">
        <p className="text-muted">
          No content yet. Sign in to the{" "}
          <Link href="/dashboard" className="text-accent underline">
            dashboard
          </Link>{" "}
          to add it.
        </p>
      </main>
    );
  }

  return <Deck data={data} />;
}
