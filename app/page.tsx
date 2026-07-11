import { ConnectSpotify } from "@/components/ConnectSpotify";
import { LogoutButton } from "@/components/LogoutButton";
import { VinylWall } from "@/components/VinylWall";
import { getAppUrlFromHeaders } from "@/lib/app-url";
import { hasSession } from "@/lib/session";

type HomeProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const appUrl = await getAppUrlFromHeaders();
  const isConnected = await hasSession();

  return (
    <main className="min-h-screen px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto flex w-full max-w-2xl flex-col">
        <header className="mb-10 flex items-start justify-between gap-4 border-b border-[var(--border)] pb-6">
          <div>
            <h1 className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text)]">
              Corner
            </h1>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Top albums · last 4 weeks
            </p>
          </div>
          {isConnected ? <LogoutButton /> : null}
        </header>

        {isConnected ? (
          <VinylWall />
        ) : (
          <ConnectSpotify error={params.error ?? null} appUrl={appUrl} />
        )}
      </div>
    </main>
  );
}
