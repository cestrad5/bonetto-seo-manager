import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bonetto SEO Manager - Optimización WooCommerce",
  description: "Optimiza las fichas de productos de WooCommerce para Bonetto con Amor. Generación de contenido SEO con IA, compresión de imágenes y más.",
  keywords: ["SEO", "WooCommerce", "WordPress", "Optimización", "AI", "Bonetto", "Artesanía", "Madera"],
  authors: [{ name: "Bonetto con Amor" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Bonetto SEO Manager",
    description: "Optimización SEO para productos WooCommerce con IA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
