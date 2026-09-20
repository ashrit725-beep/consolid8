import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AppShell } from "@/components/layout";
import { RuntimeProvider } from "@/lib/state";
import { BRAND } from "@/config/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — ${BRAND.descriptor}`,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.promise,
};

export const viewport: Viewport = {
  themeColor: "#07080a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-sm focus:bg-surface-overlay focus:px-3 focus:py-2 focus:text-[12px] focus:text-fg"
        >
          Skip to content
        </a>
        <RuntimeProvider>
          <AppShell>
            <div id="content">{children}</div>
          </AppShell>
        </RuntimeProvider>
      </body>
    </html>
  );
}
