import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ListLaunch",
  description: "Directory planner for usesubwise.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
            <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
              <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                <div className="text-lg font-semibold text-white">ListLaunch</div>
                <nav className="flex gap-4 text-sm text-slate-200">
                  <Link className="hover:text-white" href="/">
                    Home
                  </Link>
                  <Link className="hover:text-white" href="/site">
                    Site
                  </Link>
                  <Link className="hover:text-white" href="/directories">
                    Directories
                  </Link>
                  <Link className="hover:text-white" href="/plan">
                    Plan
                  </Link>
                  <Link className="hover:text-white" href="/report">
                    Report
                  </Link>
                </nav>
              </div>
            </header>
            <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

