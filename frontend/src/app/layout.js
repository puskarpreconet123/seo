import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

import { SeoProvider } from "@/context/SeoContext";
import DashboardLayoutShell from "@/components/layout/DashboardLayoutShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SEO Dashboard - Local SEO & Web Insights",
  description: "Track website authority, search visibility, backlink profile, and Google Business Profile performance in one SEO dashboard.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <SeoProvider>
          <DashboardLayoutShell>{children}</DashboardLayoutShell>
        </SeoProvider>
      </body>
    </html>
  );
}
