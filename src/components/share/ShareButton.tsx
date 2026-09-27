"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui";
import { toast } from "@/components/ui";
import { drawShareCard, type ShareCardData } from "./shareCard";

export interface ShareButtonProps {
  data: ShareCardData;
}

/** Renders the run's share card to a canvas and shares (or downloads) a PNG. */
export function ShareButton({ data }: ShareButtonProps) {
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350;
      drawShareCard(canvas, data);
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
      if (!blob) throw new Error("no blob");
      const file = new File([blob], "split-signal.png", { type: "image/png" });

      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (typeof navigator.share === "function" && nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Split Signal", text: data.escaped ? "We escaped!" : "Signal lost." });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "split-signal.png";
        a.click();
        URL.revokeObjectURL(url);
        toast("Share card downloaded", "accent");
      }
    } catch {
      toast("Couldn't create share card", "warn");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="secondary" fullWidth loading={busy} leftIcon={<Share2 size={16} />} onClick={run}>
      Share
    </Button>
  );
}
