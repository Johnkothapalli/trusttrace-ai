import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://trusttrace-ai.vercel.app"),
  title: {
    default: "TrustTrace — AI Reliability & Security Operations",
    template: "%s · TrustTrace",
  },
  description:
    "Observe, evaluate, and secure production AI systems with trace-level guardrails and human review workflows.",
  applicationName: "TrustTrace",
  keywords: ["AI observability", "LLM security", "AI evaluation", "prompt injection", "guardrails"],
  authors: [{ name: "John Kothapalli" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "TrustTrace — AI Reliability & Security Operations",
    description: "Trace-level visibility, deterministic guardrails, evaluations, and human review for production AI.",
    type: "website",
    siteName: "TrustTrace",
    url: "/",
    images: [
      {
        url: "/trusttrace-dashboard.png",
        width: 1440,
        height: 900,
        alt: "TrustTrace AI reliability and security operations dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TrustTrace - AI Reliability & Security Operations",
    description: "Explainable guardrails, trace observability, evaluations, and human review workflows.",
    images: ["/trusttrace-dashboard.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#080b12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
