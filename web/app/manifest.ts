import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TrustTrace",
    short_name: "TrustTrace",
    description: "Explainable AI reliability and security operations dashboard.",
    start_url: "/",
    display: "standalone",
    background_color: "#080b12",
    theme_color: "#080b12",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
