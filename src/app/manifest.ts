import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Split Signal",
    short_name: "Split Signal",
    description: "Two phones, one escape. Co-op asymmetric-information escape game.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#07090C",
    theme_color: "#07090C",
    categories: ["games", "entertainment"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
