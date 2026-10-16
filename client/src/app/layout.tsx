import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { Suspense } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "LMS Academy - Learning Management System",
  description:
    "A comprehensive learning management system with courses, quizzes, certificates, and progress tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${dmSans.variable} ${spaceGrotesk.variable} font-sans`}>
          <Providers>
            <AnimatedBackground />
            <Suspense fallback={null}>
              <div className="root-layout">{children}</div>
            </Suspense>
            <Toaster richColors closeButton theme="dark" position="top-right" />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
