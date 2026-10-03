import type { Metadata } from "next";
import "./globals.css";

import { CartProvider } from "../components/CartProvider";

export const metadata: Metadata = {
  title: {
    default: "Pet PWA",
    template: "%s | Pet PWA",
  },

  description:
    "Pet shopping, digital Pet ID, Paw Points and easy reordering.",

  keywords: [
    "Pet PWA",
    "Pet Store",
    "Pet Food",
    "Dog Food",
    "Cat Food",
    "Pet ID",
    "Digital Pet ID",
    "Pet QR Code",
    "Paw Points",
    "Pet Rewards",
  ],

  authors: [
    {
      name: "Pet PWA",
    },
  ],

  creator: "Pet PWA",

  applicationName: "Pet PWA",

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}