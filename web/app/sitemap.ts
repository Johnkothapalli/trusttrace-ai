import type { MetadataRoute } from "next";

const siteUrl = "https://trusttrace-ai.vercel.app";
const routes = ["", "/traces", "/reviews", "/evaluations", "/settings", "/docs"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
