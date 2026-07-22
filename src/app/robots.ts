import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://hamdi-van-buuren.netlify.app/sitemap.xml",
  };
}
