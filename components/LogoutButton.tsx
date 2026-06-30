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
      className="rounded-full border border-[#6b5640]/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#c9b08a] transition hover:border-[#c9b08a] hover:text-[#f5e6d0] disabled:opacity-60"
    >
      {loading ? "Disconnecting..." : "Disconnect"}
    </button>
  );
}
