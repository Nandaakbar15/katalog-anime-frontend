import type { AnimeStatus, AnimeType, Season } from "@/lib/api";

export const TYPE_LABEL: Record<AnimeType, string> = {
  TV: "TV",
  MOVIE: "Movie",
  OVA: "OVA",
  SPECIAL: "Special",
};

export const SEASON_LABEL: Record<Season, string> = {
  SPRING: "Spring",
  SUMMER: "Summer",
  FALL: "Fall",
  WINTER: "Winter",
};

export const STATUS_LABEL: Record<AnimeStatus, string> = {
  FINISHED: "Finished",
  RELEASING: "Airing",
  NOT_YET_RELEASED: "Upcoming",
};

export const STATUS_STYLE: Record<AnimeStatus, string> = {
  FINISHED: "bg-sky-500/15 text-sky-300 ring-sky-400/30",
  RELEASING: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  NOT_YET_RELEASED: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function displayTitle(anime: { title_english: string; title_romaji: string }) {
  return anime.title_english || anime.title_romaji;
}
