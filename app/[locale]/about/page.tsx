import Image from "next/image";
import { AboutTimeline } from "@/components/sections/AboutTimeline";
import { Badge } from "@/components/ui/badge";
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
    title: dict.nav.about,
    description: dict.home.aboutBody,
    locale: resolvedLocale,
    path: `/${resolvedLocale}/about`,
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = isLocale(locale) ? locale : "zh";
  const dict = getDictionary(resolvedLocale);
  const person = getPerson(resolvedLocale);
  const photo = person.photos[0];
  const emailContacts = person.contacts.filter((contact) => contact.label === "Email");
  const otherContacts = person.contacts.filter((contact) => contact.label !== "Email");

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <div className="flex flex-col items-start gap-4">
          <div className="relative h-60 w-52 overflow-hidden rounded-3xl border border-border/60">
            <Image
              src={photo}
              alt={person.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 40vw, 240px"
            />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {person.name}
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              {person.headline}
            </p>
          </div>
        </div>
        <div className="space-y-6">
          <p className="text-base leading-relaxed text-muted-foreground">
            {person.bio}
          </p>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">
              {dict.labels.skills}
            </h2>
            <div className="space-y-4">
              {person.skills.map((group) => (
                <div key={group.category} className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {group.category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold tracking-tight">
            {dict.labels.timeline}
          </h2>
          <AboutTimeline items={person.timeline} />
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            {dict.labels.contacts}
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            {emailContacts.length > 0 ? (
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-widest">Email</span>
                <div className="mt-1 space-y-1">
                  {emailContacts.map((contact) => (
                    <a
                      key={`${contact.label}-${contact.value}`}
                      href={contact.url}
                      className="block font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {contact.value}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
            {otherContacts.map((contact) => (
              <div key={`${contact.label}-${contact.value}`} className="flex flex-col">
                <span className="text-xs uppercase tracking-widest">
                  {contact.label}
                </span>
                {contact.url ? (
                  <a
                    href={contact.url}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {contact.value}
                  </a>
                ) : (
                  <span className="font-medium text-foreground">
                    {contact.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
