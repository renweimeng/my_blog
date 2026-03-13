import Link from "next/link";
import { siteConfig } from "@/lib/seo/metadata";
import type { Dictionary } from "@/lib/i18n/routing";

export function SiteFooter({ dict }: { dict: Dictionary }) {
  const year = new Date().getFullYear();

  const social = [
    ...siteConfig.links.emails.map((email, index) => ({
      label: index === 0 ? "Email" : `Email ${index + 1}`,
      href: `mailto:${email}`,
    })),
    { label: "GitHub", href: siteConfig.links.github },
    { label: "LinkedIn", href: siteConfig.links.linkedin },
    { label: "Scholar", href: siteConfig.links.scholar },
  ];

  return (
    <footer className="mt-16 border-t border-border/60 bg-gradient-to-r from-background/40 via-muted/30 to-background/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-muted-foreground sm:px-6">
        <p>{dict.footer.note}</p>
        <div className="flex flex-wrap items-center gap-4">
          {social.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-full border border-border/60 bg-card/70 px-3 py-1.5 transition-colors hover:bg-muted hover:text-foreground"
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noreferrer" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <p className="text-xs">© {year} {siteConfig.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
