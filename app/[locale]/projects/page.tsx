import { ProjectCard } from "@/components/cards/ProjectCard";
import { FeaturedTutorialCard } from "@/components/cards/FeaturedTutorialCard";
import { AigcEegProjectCard } from "@/components/cards/AigcEegProjectCard";
import { InternshipSection } from "@/components/sections/InternshipSection";
import { getAllProjects } from "@/lib/content/projects";
import { getPerson } from "@/lib/content/people";
import { createMetadata } from "@/lib/seo/metadata";
import { getDictionary } from "@/lib/i18n/routing";
import { isLocale } from "@/lib/i18n/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = isLocale(locale) ? locale : "zh";
  const dict = getDictionary(resolvedLocale);
  return createMetadata({
    title: dict.nav.projects,
    description: dict.sections.featuredProjects,
    locale: resolvedLocale,
    path: `/${resolvedLocale}/projects`,
  });
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = isLocale(locale) ? locale : "zh";
  const dict = getDictionary(resolvedLocale);
  const items = getAllProjects(resolvedLocale);
  const person = getPerson(resolvedLocale);
  const internships = person.internships ?? [];

  return (
    <div className="space-y-8">
      <InternshipSection locale={resolvedLocale} internships={internships} />
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {dict.nav.projects}
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          {dict.sections.featuredProjects}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AigcEegProjectCard />
        <FeaturedTutorialCard locale={resolvedLocale} />
        {items.map((item) => (
          <ProjectCard key={item.slug} item={item} locale={resolvedLocale} />
        ))}
      </div>
    </div>
  );
}
