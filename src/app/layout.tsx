import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kiramira-Lex AI | Uganda Legal Research",
  description:
    "A source-grounded legal research and early case-triage assistant for Ugandan practice.",
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
