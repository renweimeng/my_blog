import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/locales";

export const siteConfig = {
  name: "Renwei Meng",
  title: "Renwei Meng — Research & Projects",
  description:
    "Personal research and product portfolio spanning AI systems, engineering projects, and writing.",
  url: "https://example.com",
  ogImage: "/covers/og-default.svg",
  links: {
    emails: [
      "406987331@qq.com",
      "JingShangPiao@gmail.com",
      "R32314095@stu.ahu.edu.cn",
    ],
    github: "https://github.com/your-handle",
    linkedin: "https://linkedin.com/in/your-handle",
    scholar: "https://scholar.google.com",
  },
};

export function getSiteName(locale: Locale) {
  return locale === "zh" ? "孟任巍" : "Renwei Meng";
}

export type MetadataOptions = {
  title: string;
  description?: string;
  locale: Locale;
  path: string;
  image?: string;
  type?: "website" | "article";
};

export function createMetadata({
  title,
  description,
  locale,
  path,
  image,
  type = "website",
}: MetadataOptions): Metadata {
  const siteName = getSiteName(locale);
  const fullTitle = title ? `${title} | ${siteName}` : siteConfig.title;
  const url = new URL(path, siteConfig.url).toString();
  const imageUrl = image ?? siteConfig.ogImage;

  return {
    title: fullTitle,
    description: description ?? siteConfig.description,
    alternates: {
      canonical: url,
      languages: {
        en: new URL(`/en${path.replace(/^\/en/, "")}`, siteConfig.url).toString(),
        zh: new URL(`/zh${path.replace(/^\/zh/, "")}`, siteConfig.url).toString(),
      },
    },
    openGraph: {
      title: fullTitle,
      description: description ?? siteConfig.description,
      url,
      siteName,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: description ?? siteConfig.description,
      images: [imageUrl],
    },
  };
}
