/** Clerk appearance mapped to the Split Signal design tokens. */
export const clerkAppearance = {
  variables: {
    // Clerk v7 (Core 3) variable names — colorText/colorInputText etc. were removed.
    colorPrimary: "#3CF2D6",
    colorPrimaryForeground: "#04110F",
    colorBackground: "#0E1217",
    colorForeground: "#EAF2F7",
    colorMutedForeground: "#9AA7B4",
    colorMuted: "#151A21",
    colorNeutral: "#EAF2F7",
    colorBorder: "rgba(160,200,255,0.14)",
    colorInput: "#151A21",
    colorInputForeground: "#EAF2F7",
    colorRing: "#3CF2D6",
    colorDanger: "#FF5468",
    colorSuccess: "#3CF2D6",
    colorWarning: "#FFB547",
    colorModalBackdrop: "rgba(7,9,12,0.8)",
    borderRadius: "10px",
    fontFamily: "var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif",
  },
} as const;
