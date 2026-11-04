import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PadelVision | More People. Better Games.",
  description:
    "PadelVision verbindet Padel, Sport und Community. Entdecke unsere Vision und unsere Courts.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
