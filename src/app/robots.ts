import type { MetadataRoute } from "next";

import { getCanonicalAppUrl } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const appUrl = getCanonicalAppUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/dashboard/", "/checkout/", "/payment/", "/orders/", "/projects/"],
    },
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
