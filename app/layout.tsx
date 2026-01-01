
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CasStudio",
  description: "Transform smartphone photos into professional e-commerce assets.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
