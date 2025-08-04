import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;
  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/automatico`, lastModified: new Date() },
    { url: `${baseUrl}/manual`, lastModified: new Date() },
    { url: `${baseUrl}/estatisticas`, lastModified: new Date() },
    { url: `${baseUrl}/historico`, lastModified: new Date() },
    { url: `${baseUrl}/resultado`, lastModified: new Date() },
  ];
}
