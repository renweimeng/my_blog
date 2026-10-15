import fs from "node:fs";
import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/locales";
import { getAllArticles } from "@/lib/content/articles";
import { getAllProjects } from "@/lib/content/projects";
import { getAllResearch } from "@/lib/content/research";
import { getPeoplePath, getSectionDir } from "@/lib/content/paths";
import { siteConfig } from "@/lib/seo/metadata";
import { pageInfo as cortexPages } from "@/lib/cortex-loop/content";

function getExistingMtime(filePath: string) {
  try {
    return fs.statSync(filePath).mtime;
  } catch {
    return undefined;
  }
}

function getDirectoryMtime(directoryPath: string) {
  try {
    const files = fs.readdirSync(directoryPath);
    const mtimes = files
      .map((file) => getExistingMtime(`${directoryPath}/${file}`))
      .filter((date): date is Date => Boolean(date))
      .map((date) => date.getTime());

    if (mtimes.length === 0) return undefined;
    return new Date(Math.max(...mtimes));
  } catch {
    return undefined;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = ["", "research", "projects", "articles", "about", "contact"];
  const entries: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    cortexPages.forEach((page) => {
      const tail = page.id === "home" ? "" : `/${page.id}`;
      entries.push({
        url: new URL(`/${locale}/projects/cortex-loop${tail}`, siteConfig.url).toString(),
        lastModified: getExistingMtime("components/cortex-loop/CortexApp.tsx") ?? now,
        alternates: {
          languages: Object.fromEntries(locales.map(lang => [lang, new URL(`/${lang}/projects/cortex-loop${tail}`, siteConfig.url).toString()])),
        },
      });
    });
    staticRoutes.forEach((route) => {
      const lastModified =
        route === "" || route === "about" || route === "contact"
          ? getExistingMtime(getPeoplePath(locale)) ?? now
          : getDirectoryMtime(getSectionDir(route as "research" | "projects" | "articles", locale)) ?? now;

      entries.push({
        url: new URL(`/${locale}/${route}`.replace(/\/$/, ""), siteConfig.url)
          .toString(),
        lastModified,
      });
    });

    getAllResearch(locale).forEach((item) => {
      entries.push({
        url: new URL(`/${locale}/research/${item.slug}`, siteConfig.url).toString(),
        lastModified:
          getExistingMtime(`${getSectionDir("research", locale)}/${item.slug}.mdx`) ?? now,
      });
    });

    getAllProjects(locale).forEach((item) => {
      entries.push({
        url: new URL(`/${locale}/projects/${item.slug}`, siteConfig.url).toString(),
        lastModified:
          getExistingMtime(`${getSectionDir("projects", locale)}/${item.slug}.mdx`) ?? now,
      });
    });

    getAllArticles(locale).forEach((item) => {
      entries.push({
        url: new URL(`/${locale}/articles/${item.slug}`, siteConfig.url).toString(),
        lastModified:
          getExistingMtime(`${getSectionDir("articles", locale)}/${item.slug}.mdx`) ?? now,
      });
    });
  });

  return entries;
}
