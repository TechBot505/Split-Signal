import { Space_Grotesk, JetBrains_Mono } from "next/font/google";

/** Display / UI face — variable Space Grotesk, tight tracking on headings. */
export const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

/** Mono face — codes, timers, readouts. */
export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const fontVariables = `${fontDisplay.variable} ${fontMono.variable}`;
