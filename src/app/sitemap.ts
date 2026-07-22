import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";

const base = "https://hamdi-van-buuren.netlify.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/portfolio",
    "/hvb-weddings",
    "/hvb-studio",
    "/about",
    "/booking",
    "/contact",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
  const projectRoutes = projects.map((p) => ({
    url: `${base}/projects/${p.slug}`,
    lastModified: new Date(),
  }));
  return [...routes, ...projectRoutes];
}
