import type { Metadata, Viewport } from "next";
import { fontVariables } from "./fonts";
import { Providers } from "./providers";
import { Backdrop } from "@/components/shell/Backdrop";
import { ServiceWorkerRegistrar } from "@/components/shell/ServiceWorkerRegistrar";
import "./globals.css";

const title = "Split Signal — two phones, one escape";
const description =
  "A two-player co-op escape game. Each phone sees half of every puzzle — you only escape by talking.";

export const metadata: Metadata = {
  title,
  description,
  applicationName: "Split Signal",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Split Signal" },
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "Split Signal",
  },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#07090C",
  viewportFit: "cover",
  initialScale: 1,
  width: "device-width",
  userScalable: true,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="min-h-dvh bg-canvas text-fg antialiased">
        <Backdrop />
        <Providers>{children}</Providers>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
