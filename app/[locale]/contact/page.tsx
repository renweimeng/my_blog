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
    title: dict.nav.contact,
    description: dict.labels.contacts,
    locale: resolvedLocale,
    path: `/${resolvedLocale}/contact`,
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = isLocale(locale) ? locale : "zh";
  const dict = getDictionary(resolvedLocale);
  const person = getPerson(resolvedLocale);
  const emailContacts = person.contacts.filter((contact) => contact.label === "Email");
  const otherContacts = person.contacts.filter((contact) => contact.label !== "Email");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {dict.nav.contact}
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          {dict.labels.contacts}
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {emailContacts.length > 0 ? (
          <div className="rounded-2xl border p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Email
            </p>
            <div className="mt-2 space-y-2">
              {emailContacts.map((contact) => (
                <a
                  key={`${contact.label}-${contact.value}`}
                  href={contact.url}
                  className="block text-base font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {contact.value}
                </a>
              ))}
            </div>
          </div>
        ) : null}
        {otherContacts.map((contact) => (
          <div key={`${contact.label}-${contact.value}`} className="rounded-2xl border p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {contact.label}
            </p>
            {contact.url ? (
              <a
                href={contact.url}
                className="mt-2 block text-base font-medium text-foreground underline-offset-4 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                {contact.value}
              </a>
            ) : (
              <p className="mt-2 text-base font-medium text-foreground">
                {contact.value}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
