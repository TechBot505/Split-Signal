"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, QrCode, Share2 } from "lucide-react";
import { Button, Sheet, toast } from "@/components/ui";
import { appUrl } from "@/lib/env";
import { haptic } from "@/lib/haptics";
import { playSound } from "@/lib/sound";

export interface InviteControlsProps {
  code: string;
}

/** Copy / Web-Share / QR controls for inviting a partner to the room. */
export function InviteControls({ code }: InviteControlsProps) {
  const inviteUrl = `${appUrl}/join/${code}`;
  const [qrOpen, setQrOpen] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);

  useEffect(() => {
    if (!qrOpen || qrData) return;
    QRCode.toDataURL(inviteUrl, { margin: 1, width: 320, color: { dark: "#EAF2F7", light: "#0E1217" } })
      .then(setQrData)
      .catch(() => toast("Couldn't render QR code", "warn"));
  }, [qrOpen, qrData, inviteUrl]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      playSound("click");
      haptic("light");
      toast("Invite link copied", "accent");
    } catch {
      toast("Copy failed — share manually", "warn");
    }
  };

  const share = async () => {
    if (typeof navigator.share !== "function") return copy();
    try {
      await navigator.share({ title: "Split Signal", text: `Join my bunker — code ${code}`, url: inviteUrl });
    } catch {
      /* user cancelled — no-op */
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <Button variant="secondary" size="sm" leftIcon={<Copy size={15} />} onClick={copy}>
          Copy
        </Button>
        <Button variant="secondary" size="sm" leftIcon={<Share2 size={15} />} onClick={share}>
          Share
        </Button>
        <Button variant="secondary" size="sm" leftIcon={<QrCode size={15} />} onClick={() => setQrOpen(true)}>
          QR
        </Button>
      </div>

      <Sheet open={qrOpen} onClose={() => setQrOpen(false)} title="Scan to join">
        <div className="flex flex-col items-center gap-4 py-2">
          {qrData ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={qrData} alt={`QR code linking to room ${code}`} width={240} height={240} className="rounded-(--radius-card)" />
          ) : (
            <div className="h-[240px] w-[240px] animate-pulse rounded-(--radius-card) bg-surface-2" />
          )}
          <p className="break-all text-center text-xs text-faint">{inviteUrl}</p>
        </div>
      </Sheet>
    </>
  );
}
