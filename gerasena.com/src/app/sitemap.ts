import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://gerasena.com";
  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/automatico`, lastModified: new Date() },
    { url: `${baseUrl}/manual`, lastModified: new Date() },
    { url: `${baseUrl}/estatisticas`, lastModified: new Date() },
    { url: `${baseUrl}/historico`, lastModified: new Date() },
    { url: `${baseUrl}/resultado`, lastModified: new Date() },
  ];
}
