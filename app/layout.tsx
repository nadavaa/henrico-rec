import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { ResidentSessionProvider } from "@/lib/resident/session-context";
import { AiAuditProvider } from "@/lib/ai/audit-context";
import { OutboxProvider } from "@/lib/communications/outbox-context";
import { getPrograms } from "@/lib/data";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Henrico Recreation & Parks",
  description:
    "Demo recreation management system for Henrico County Recreation and Parks.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const programs = await getPrograms();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-blue-700 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <OutboxProvider>
          <ResidentSessionProvider programs={programs}>
            <AiAuditProvider>{children}</AiAuditProvider>
          </ResidentSessionProvider>
        </OutboxProvider>
      </body>
    </html>
  );
}
