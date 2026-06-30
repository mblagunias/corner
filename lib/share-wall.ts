export async function captureElement(element: HTMLElement) {
  const { toPng } = await import("html-to-image");

  return toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#1a140f",
  });
}

export function dataUrlToBlob(dataUrl: string) {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mime });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function captureAndDownload(
  element: HTMLElement,
  filename: string,
) {
  const dataUrl = await captureElement(element);
  downloadBlob(dataUrlToBlob(dataUrl), filename);
}

export async function captureAsFile(
  element: HTMLElement,
  filename: string,
) {
  const dataUrl = await captureElement(element);
  const blob = dataUrlToBlob(dataUrl);
  return new File([blob], filename, { type: blob.type });
}

export function shareToTwitter(monthLabel: string) {
  const text = `My top albums from ${monthLabel} 🎵`;
  const url = new URL("https://twitter.com/intent/tweet");
  url.searchParams.set("text", text);
  window.open(url.toString(), "_blank", "noopener,noreferrer");
}

export async function shareImageFile(
  file: File,
  title: string,
  text: string,
) {
  if (!navigator.share || !navigator.canShare?.({ files: [file] })) {
    return false;
  }

  await navigator.share({
    title,
    text,
    files: [file],
  });

  return true;
}

export function slugifyMonthLabel(label: string) {
  return label.toLowerCase().replace(/\s+/g, "-");
}
