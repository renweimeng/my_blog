import fs from "node:fs";
import type { Locale } from "@/lib/i18n/locales";
import { getPeoplePath } from "@/lib/content/paths";

export type TimelineItem = {
  date: string;
  title: string;
  description: string;
  links?: { label: string; url: string }[];
};

export type EducationItem = {
  degree: string;
  school: string;
  major: string;
  start: string;
  end: string;
  description: string;
  achievements?: string[];
  detail?: {
    schoolIntro: string;
    majorIntro: string;
    metrics?: {
      gpa?: string;
      rank?: string;
    };
    curriculum: {
      math: string[];
      csFundamentals: string[];
      advanced: string[];
      general: string[];
    };
    awards: string[];
    volunteering: string[];
  };
};

export type InternshipItem = {
  company: string;
  role: string;
  start: string;
  end: string;
  location?: string;
  summary: string;
  detail?: {
    companyIntro: string;
    roleIntro: string;
    highlights: string[];
    tech: string[];
    awards: string[];
    volunteering: string[];
  };
};

export type MusicProfile = {
  title: string;
  intro: string;
  instruments: string[];
  bandPhotos: string[];
  track?: string;
};

export type PersonProfile = {
  name: string;
  headline: string;
  bio: string;
  photos: string[];
  education?: EducationItem[];
  internships?: InternshipItem[];
  music?: MusicProfile;
  timeline: TimelineItem[];
  skills: { category: string; items: string[] }[];
  contacts: { label: string; value: string; url?: string }[];
};

export function getPerson(locale: Locale): PersonProfile {
  const filePath = getPeoplePath(locale);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as PersonProfile;
}
