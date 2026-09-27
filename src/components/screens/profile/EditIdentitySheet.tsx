"use client";

import { useEffect, useState } from "react";
import { Dice5, Radio } from "lucide-react";
import { AvatarBuilder } from "@/components/avatar";
import { Button, Input, Sheet } from "@/components/ui";
import { type AvatarConfig } from "@/lib/avatar";
import { randomCallsign } from "@/lib/callsign";

export interface EditIdentitySheetProps {
  open: boolean;
  onClose: () => void;
  initialName: string;
  initialAvatar: AvatarConfig;
  onSave: (name: string, avatar: AvatarConfig) => void;
}

/** Sheet to edit call-sign + avatar. Commits only on Save. */
export function EditIdentitySheet({
  open,
  onClose,
  initialName,
  initialAvatar,
  onSave,
}: EditIdentitySheetProps) {
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState<AvatarConfig>(initialAvatar);

  // Re-seed the draft each time the sheet opens.
  useEffect(() => {
    if (open) {
      setName(initialName);
      setAvatar(initialAvatar);
    }
  }, [open, initialName, initialAvatar]);

  const trimmed = name.trim();
  const valid = trimmed.length >= 1 && trimmed.length <= 16;

  const save = () => {
    if (!valid) return;
    onSave(trimmed, avatar);
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Edit your look"
      footer={
        <Button fullWidth disabled={!valid} onClick={save}>
          Save
        </Button>
      }
    >
      <div className="flex flex-col gap-4 pt-1">
        <AvatarBuilder value={avatar} onChange={setAvatar} />
        <div className="flex flex-col gap-2">
          <Input
            label="Call sign"
            name="callsign"
            value={name}
            maxLength={16}
            leftIcon={<Radio size={16} />}
            autoComplete="off"
            onChange={(e) => setName(e.target.value.slice(0, 16))}
            onKeyDown={(e) => e.key === "Enter" && save()}
            hint={`${trimmed.length}/16`}
          />
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Dice5 size={15} />}
            onClick={() => setName(randomCallsign())}
            className="self-start"
          >
            Surprise me
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
