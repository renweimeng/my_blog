export const locales = ["zh", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value?: string | null): value is Locale {
  return locales.includes(value as Locale);
}
