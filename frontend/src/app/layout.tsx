import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Parallax Edge - Hyper-Local Price Aggregator",
  description: "Compare prices across Amazon, Flipkart, Blinkit & Zepto. See the true landed cost with delivery and platform fees included.",
  keywords: ["price comparison", "amazon", "flipkart", "blinkit", "zepto", "shopping", "deals"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
