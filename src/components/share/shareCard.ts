/**
 * Renders a 1080×1350 share card for a finished run onto a canvas. Pure drawing
 * (no assets): mission-control palette, ESCAPED / SIGNAL LOST headline, key
 * stats, both call-signs and the app URL. Fonts fall back to system faces so it
 * works even before the web fonts finish loading.
 */
export interface ShareCardData {
  escaped: boolean;
  timeLeftMs: number;
  score: number;
  strikes: number;
  hintsUsed: number;
  stagesCleared: number;
  total: number;
  players: string[];
  dailyLabel?: string;
  appUrl: string;
}

const W = 1080;
const H = 1350;
const DISPLAY = '"Space Grotesk", ui-sans-serif, system-ui, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';

function fmtTime(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function stat(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, value: string): void {
  ctx.textAlign = "left";
  ctx.fillStyle = "#6B7885";
  ctx.font = `600 30px ${DISPLAY}`;
  ctx.fillText(label.toUpperCase(), x, y);
  ctx.fillStyle = "#EAF2F7";
  ctx.font = `600 68px ${MONO}`;
  ctx.fillText(value, x, y + 74);
}

/** Draw the full card. The canvas must be sized 1080×1350 by the caller. */
export function drawShareCard(canvas: HTMLCanvasElement, data: ShareCardData): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const accent = data.escaped ? "#3CF2D6" : "#FF5468";

  ctx.fillStyle = "#07090C";
  ctx.fillRect(0, 0, W, H);

  // Top hairline + wordmark.
  ctx.textAlign = "left";
  ctx.font = `600 46px ${DISPLAY}`;
  ctx.fillStyle = "#EAF2F7";
  ctx.fillText("Split", 80, 140);
  const splitW = ctx.measureText("Split ").width;
  ctx.fillStyle = "#3CF2D6";
  ctx.fillText("Signal", 80 + splitW, 140);

  if (data.dailyLabel) {
    ctx.textAlign = "right";
    ctx.font = `600 30px ${MONO}`;
    ctx.fillStyle = "#9AA7B4";
    ctx.fillText(data.dailyLabel.toUpperCase(), W - 80, 140);
  }

  // Headline.
  ctx.textAlign = "center";
  ctx.fillStyle = accent;
  ctx.font = `700 150px ${DISPLAY}`;
  ctx.fillText(data.escaped ? "ESCAPED" : "SIGNAL LOST", W / 2, 480);

  ctx.fillStyle = "#9AA7B4";
  ctx.font = `500 40px ${DISPLAY}`;
  ctx.fillText(`${data.stagesCleared}/${data.total} stages cleared`, W / 2, 560);

  // Stat grid.
  stat(ctx, 80, 720, data.escaped ? "Time left" : "Result", data.escaped ? fmtTime(data.timeLeftMs) : "—");
  stat(ctx, 580, 720, "Score", data.escaped ? String(data.score) : "0");
  stat(ctx, 80, 900, "Strikes", `${data.strikes}/3`);
  stat(ctx, 580, 900, "Hints used", String(data.hintsUsed));

  // Call-signs.
  ctx.textAlign = "left";
  ctx.fillStyle = "#6B7885";
  ctx.font = `600 30px ${DISPLAY}`;
  ctx.fillText("OPERATORS", 80, 1080);
  ctx.fillStyle = "#EAF2F7";
  ctx.font = `600 54px ${DISPLAY}`;
  ctx.fillText(data.players.filter(Boolean).join("  ·  ") || "Operators", 80, 1150);

  // Footer URL.
  ctx.fillStyle = accent;
  ctx.fillRect(80, 1230, 60, 6);
  ctx.fillStyle = "#9AA7B4";
  ctx.font = `500 34px ${MONO}`;
  ctx.fillText(data.appUrl.replace(/^https?:\/\//, ""), 80, 1290);
}
