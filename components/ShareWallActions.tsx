"use client";

import { type RefObject, useState } from "react";
import {
  captureAndDownload,
  captureAsFile,
  shareImageFile,
  shareToTwitter,
  slugifyPeriodLabel,
} from "@/lib/share-wall";

type ShareWallActionsProps = {
  periodLabel: string;
  captureRef: RefObject<HTMLDivElement | null>;
};

type ShareStatus = "idle" | "loading" | "success" | "error";

export function ShareWallActions({
  periodLabel,
  captureRef,
}: ShareWallActionsProps) {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function withCapture(
    action: (element: HTMLDivElement) => Promise<void>,
  ) {
    const element = captureRef.current;

    if (!element) {
      setStatus("error");
      setMessage("Could not find the scene to capture.");
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      await action(element);
      setStatus("success");
    } catch {
      setStatus("error");
      setMessage("Something went wrong while creating your image.");
    }
  }

  async function handleDownload() {
    await withCapture(async (element) => {
      const filename = `corner-${slugifyPeriodLabel(periodLabel)}.png`;
      await captureAndDownload(element, filename);
      setMessage("Image saved.");
    });
  }

  async function handleInstagram() {
    await withCapture(async (element) => {
      const filename = `corner-${slugifyPeriodLabel(periodLabel)}.png`;
      const file = await captureAsFile(element, filename);
      const shared = await shareImageFile(
        file,
        "My Corner",
        `My top albums · ${periodLabel}`,
      );

      if (shared) {
        setMessage("Opened share sheet — pick Instagram Stories.");
        return;
      }

      await captureAndDownload(element, filename);
      setMessage("Image saved — open Instagram and add it to your Story.");
    });
  }

  async function handleTwitter() {
    await withCapture(async (element) => {
      const filename = `corner-${slugifyPeriodLabel(periodLabel)}.png`;
      const file = await captureAsFile(element, filename);
      const shared = await shareImageFile(
        file,
        "My Corner",
        `My top albums · ${periodLabel}`,
      );

      if (!shared) {
        await captureAndDownload(element, filename);
        shareToTwitter(periodLabel);
        setMessage("Image saved and X opened — attach the image to your post.");
        return;
      }

      setMessage("Shared to X.");
    });
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <ShareButton
          label="Save image"
          onClick={handleDownload}
          disabled={status === "loading"}
        />
        <ShareButton
          label="Instagram"
          onClick={handleInstagram}
          disabled={status === "loading"}
        />
        <ShareButton
          label="Twitter"
          onClick={handleTwitter}
          disabled={status === "loading"}
        />
      </div>

      {status === "loading" ? (
        <p className="text-xs text-[var(--text-muted)]">Creating image…</p>
      ) : null}

      {message ? (
        <p
          className={`max-w-md text-center text-xs ${
            status === "error" ? "text-red-700" : "text-[var(--text-muted)]"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

type ShareButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

function ShareButton({ label, onClick, disabled }: ShareButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center border border-[var(--border-strong)] bg-[var(--surface-raised)] px-5 py-2 text-[0.6875rem] uppercase tracking-[0.14em] text-[var(--text)] transition hover:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  );
}
