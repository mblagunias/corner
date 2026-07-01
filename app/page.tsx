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
    <main className="vinyl-room min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        <header className="mb-12 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#a88d67]">
              Corner
            </p>
            <h1 className="font-serif text-2xl text-[#f5e6d0] sm:text-3xl">
              Vinyl Wall
            </h1>
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
