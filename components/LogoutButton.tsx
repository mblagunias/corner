"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="border border-[var(--border-strong)] px-4 py-1.5 text-[0.625rem] uppercase tracking-[0.14em] text-[var(--text-muted)] transition hover:border-[var(--text)] hover:text-[var(--text)] disabled:opacity-50"
    >
      {loading ? "Disconnecting…" : "Disconnect"}
    </button>
  );
}
