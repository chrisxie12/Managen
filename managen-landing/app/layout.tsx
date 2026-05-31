import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Managen — School Management for Ghanaian Schools",
  description:
    "Attendance, fees, exams, and WhatsApp reports — all automated. Built for Ghanaian schools.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
