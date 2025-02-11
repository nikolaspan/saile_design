// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // use Inter instead of Geist
import { ThemeProvider } from "@/components/ui/theme-provider";
import "./globals.css";

// Configure the font
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SAIL-E",
  description: "SAIL-E Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
