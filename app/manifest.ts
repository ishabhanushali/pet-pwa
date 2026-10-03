import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pet PWA",
    short_name: "Pet PWA",
    description:
      "Shop pet essentials, manage pet profiles, Digital Pet IDs, Paw Points, orders and reminders.",

    start_url: "/",
    scope: "/",
    display: "standalone",

    background_color: "#fafaf7",
    theme_color: "#f97316",

    orientation: "portrait-primary",

    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}