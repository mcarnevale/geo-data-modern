import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoData",
  description: "Explore geopolitical and macroeconomic models through narrative, time-based data overlays.",
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
