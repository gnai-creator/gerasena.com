import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ServiceWorker from "../components/ServiceWorker";
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
  metadataBase: new URL("https://gerasena.com"),
  title: {
    default: "Gerasena",
    template: "%s | Gerasena",
  },
  description: "Gere Jogos da Mega-Sena",
  keywords: ["mega-sena", "loteria", "gerador", "jogos", "sorteio"],
  authors: [{ name: "Gerasena" }],
  applicationName: "Gerasena",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Gerasena",
    description: "Gere Jogos da Mega-Sena",
    url: "https://gerasena.com",
    siteName: "Gerasena",
    locale: "pt_BR",
    type: "website",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gerasena",
    description: "Gere Jogos da Mega-Sena",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://gerasena.com",
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    title: "Gerasena",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#64de95",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
