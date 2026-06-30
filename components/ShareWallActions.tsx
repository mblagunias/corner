"use client";

import { type RefObject, useState } from "react";
import {
  captureAndDownload,
  captureAsFile,
  shareImageFile,
  shareToTwitter,
  slugifyMonthLabel,
} from "@/lib/share-wall";

type ShareWallActionsProps = {
  monthLabel: string;
  captureRef: RefObject<HTMLDivElement | null>;
};

type ShareStatus = "idle" | "loading" | "success" | "error";

export function ShareWallActions({
  monthLabel,
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
      setMessage("Could not find the wall to capture.");
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
      const filename = `vinyl-wall-${slugifyMonthLabel(monthLabel)}.png`;
      await captureAndDownload(element, filename);
      setMessage("Image downloaded.");
    });
  }

  async function handleInstagram() {
    await withCapture(async (element) => {
      const filename = `vinyl-wall-${slugifyMonthLabel(monthLabel)}.png`;
      const file = await captureAsFile(element, filename);
      const shared = await shareImageFile(
        file,
        "My Vinyl Wall",
        `My top albums from ${monthLabel}`,
      );

      if (shared) {
        setMessage("Opened share sheet — pick Instagram Stories.");
        return;
      }

      await captureAndDownload(element, filename);
      setMessage("Image downloaded — open Instagram and add it to your Story.");
    });
  }

  async function handleTwitter() {
    await withCapture(async (element) => {
      const filename = `vinyl-wall-${slugifyMonthLabel(monthLabel)}.png`;
      const file = await captureAsFile(element, filename);
      const shared = await shareImageFile(
        file,
        "My Vinyl Wall",
        `My top albums from ${monthLabel}`,
      );

      if (!shared) {
        await captureAndDownload(element, filename);
        shareToTwitter(monthLabel);
        setMessage("Image downloaded and X opened — attach the image to your post.");
        return;
      }

      setMessage("Shared to X.");
    });
  }

  return (
    <div className="mt-12 flex flex-col items-center gap-4">
      <p className="text-xs uppercase tracking-[0.35em] text-[#a88d67]">
        Share your wall
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <ShareButton
          label="Download image"
          onClick={handleDownload}
          disabled={status === "loading"}
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M12 3a1 1 0 0 1 1 1v9.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.42l2.3 2.3V4a1 1 0 0 1 1-1Zm-7 14a1 1 0 0 1 1 1v2h12v-2a1 1 0 1 1 2 0v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z" />
            </svg>
          }
        />
        <ShareButton
          label="Instagram Story"
          onClick={handleInstagram}
          disabled={status === "loading"}
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.51 5.51 0 0 1 12 7.5Zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5Zm5.75-3.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25Z" />
            </svg>
          }
        />
        <ShareButton
          label="Post on X"
          onClick={handleTwitter}
          disabled={status === "loading"}
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M17.3 3H20l-6.5 7.4L21 21h-6.1l-4.7-6.2L4.6 21H2l7.2-8.2L2 3h6.2l4.2 5.6L17.3 3Zm-2.1 16h1.7L8.9 4.9H7.1l8.1 14.1Z" />
            </svg>
          }
        />
      </div>

      {status === "loading" ? (
        <p className="text-sm text-[#c9b08a]">Creating your image…</p>
      ) : null}

      {message ? (
        <p
          className={`max-w-md text-center text-sm ${
            status === "error" ? "text-red-200" : "text-[#c9b08a]"
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
  icon: React.ReactNode;
};

function ShareButton({ label, onClick, disabled, icon }: ShareButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-full border border-[#6b5640]/70 bg-[#2a2118]/80 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#f5e6d0] transition hover:border-[#c9b08a] hover:bg-[#3d3024]/80 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {icon}
      {label}
    </button>
  );
}
