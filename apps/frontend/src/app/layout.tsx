import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinFlow — Multi-Agent Enterprise Dashboard",
  description:
    "Production-grade multi-agent orchestration layer managing polyglot microservices. Next.js + Node.js + Spring Boot unified by self-correcting agentic workflows.",
  keywords: [
    "multi-agent",
    "microservices",
    "LangGraph",
    "Next.js",
    "Spring Boot",
    "enterprise",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
