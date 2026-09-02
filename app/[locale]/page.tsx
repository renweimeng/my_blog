import Link from "next/link";
import { SectionScene } from "@/components/animations/SectionScene";
import { HomeHero } from "@/components/sections/HomeHero";
import { HomePublications } from "@/components/sections/HomePublications";
import { HomeFeatured } from "@/components/sections/HomeFeatured";
import { HomeLatestArticles } from "@/components/sections/HomeLatestArticles";
import { HomeEducation } from "@/components/sections/HomeEducation";
import { HomeWhatIDo } from "@/components/sections/HomeWhatIDo";
import { ResearchCard } from "@/components/cards/ResearchCard";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { getAllResearch } from "@/lib/content/research";
import { getAllProjects } from "@/lib/content/projects";
import { getAllArticles } from "@/lib/content/articles";
import { getPerson } from "@/lib/content/people";
import { createMetadata } from "@/lib/seo/metadata";
import { personJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
import { getDictionary } from "@/lib/i18n/routing";
import { isLocale } from "@/lib/i18n/locales";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = isLocale(locale) ? locale : "zh";
  const dict = getDictionary(resolvedLocale);
  return createMetadata({
    title: dict.nav.home,
    description: dict.home.heroSubtitle,
    locale: resolvedLocale,
    path: `/${resolvedLocale}`,
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = isLocale(locale) ? locale : "zh";
  const dict = getDictionary(resolvedLocale);

  const research = getAllResearch(resolvedLocale).slice(0, 3);
  const projects = getAllProjects(resolvedLocale).slice(0, 3);
  const articles = getAllArticles(resolvedLocale).slice(0, 3);
  const person = getPerson(resolvedLocale);
  const portrait = person.photos[0] ?? "/avatar/portrait.svg";
  const education = person.education ?? [];
  const websiteLd = websiteJsonLd(resolvedLocale);
  const personLd = personJsonLd({
    locale: resolvedLocale,
    description: person.bio,
    image: portrait,
  });

  return (
    <div className="space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
      <SectionScene>
        <HomeHero
          dict={dict}
          locale={resolvedLocale}
          photo={portrait}
          name={person.name}
        />
      </SectionScene>

      <SectionScene>
        <HomePublications locale={resolvedLocale} />
      </SectionScene>

      <SectionScene>
        <HomeEducation locale={resolvedLocale} education={education} />
      </SectionScene>
      <SectionScene>
        <HomeWhatIDo locale={resolvedLocale} music={person.music} />
      </SectionScene>

      <SectionScene>
        <HomeFeatured
          title={dict.sections.featuredResearch}
          viewAllHref={`/${resolvedLocale}/research`}
          viewAllLabel={dict.actions.viewAll}
        >
          {research.map((item) => (
            <ResearchCard key={item.slug} item={item} locale={resolvedLocale} />
          ))}
        </HomeFeatured>
      </SectionScene>

      <SectionScene>
        <HomeFeatured
          title={dict.sections.featuredProjects}
          viewAllHref={`/${resolvedLocale}/projects`}
          viewAllLabel={dict.actions.viewAll}
        >
          {projects.map((item) => (
            <ProjectCard key={item.slug} item={item} locale={resolvedLocale} />
          ))}
        </HomeFeatured>
      </SectionScene>

      <SectionScene>
        <HomeLatestArticles
          title={dict.sections.latestArticles}
          viewAllHref={`/${resolvedLocale}/articles`}
          viewAllLabel={dict.actions.viewAll}
        >
          {articles.map((item) => (
            <ArticleCard key={item.slug} item={item} locale={resolvedLocale} />
          ))}
        </HomeLatestArticles>
      </SectionScene>

      <SectionScene>
        <section className="relative overflow-hidden rounded-[2rem] border border-white/45 bg-gradient-to-br from-card via-card to-accent/45 px-6 py-10 shadow-[0_20px_50px_rgba(15,23,42,0.1)] dark:border-white/10 dark:to-accent/20 sm:px-10">
          <div className="pointer-events-none absolute -right-10 bottom-0 h-36 w-36 rounded-full bg-primary/20 blur-2xl" />
          <p className="text-xs uppercase tracking-[0.3em] text-primary/85 dark:text-primary">
            {dict.home.aboutKicker}
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            {dict.home.aboutTitle}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {dict.home.aboutBody}
          </p>
          <Button asChild className="mt-6">
            <Link href={`/${resolvedLocale}/about`}>{dict.nav.about}</Link>
          </Button>
        </section>
      </SectionScene>
    </div>
  );
}
