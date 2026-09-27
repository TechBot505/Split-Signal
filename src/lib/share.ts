import { toast } from "@/components/ui";

export interface ShareResult {
  shared: boolean;
}

/**
 * Share text via the Web Share API when available, otherwise copy to clipboard.
 * Both paths surface a toast. Never throws (user-cancelled shares are ignored).
 */
export async function shareText(text: string, title = "Split Signal"): Promise<ShareResult> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text });
      return { shared: true };
    } catch {
      return { shared: false }; // user cancelled or unavailable
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    toast("Copied to clipboard", "accent");
    return { shared: true };
  } catch {
    toast("Couldn't share on this device", "fail");
    return { shared: false };
  }
}
