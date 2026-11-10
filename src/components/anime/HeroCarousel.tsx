import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Building03Icon,
  Calendar03Icon,
  InformationCircleIcon,
  Layers01Icon,
  SparklesIcon,
  Tv01Icon,
} from "@hugeicons/core-free-icons";
import type { AnimeWithGenres } from "@/hooks/catalog";
import { SEASON_LABEL, TYPE_LABEL, displayTitle } from "@/lib/anime";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PosterImage } from "./PosterImage";
import { StatusBadge } from "./StatusBadge";

const ROTATE_MS = 7000;

export function HeroCarousel({ items }: { items: AnimeWithGenres[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = Math.min(index, items.length - 1);
  const current = items[active];

  useEffect(() => {
    if (paused || items.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % items.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused, items.length]);

  const title = displayTitle(current);
  const meta = [
    { icon: Tv01Icon, label: TYPE_LABEL[current.type] },
    { icon: Calendar03Icon, label: `${SEASON_LABEL[current.season]} ${current.release_year}` },
    current.total_episodes ? { icon: Layers01Icon, label: `${current.total_episodes} episodes` } : null,
    { icon: Building03Icon, label: current.studio },
  ].filter((m) => m !== null);

  return (
    <section
      className="relative isolate overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {items.map((anime, i) => (
        <div
          key={anime.id}
          aria-hidden
          className={cn(
            "absolute inset-0 -z-20 transition-opacity duration-1000",
            i === active ? "opacity-100" : "opacity-0",
          )}
        >
          <PosterImage
            src={anime.banner_url ?? anime.poster_url}
            alt=""
            loading={i === 0 ? "eager" : "lazy"}
            className={cn("size-full", !anime.banner_url && "scale-125 opacity-60 blur-3xl")}
          />
        </div>
      ))}
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-background via-background/85 to-background/30" />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-background via-transparent to-background/50" />

      <div className="mx-auto grid min-h-[560px] max-w-7xl items-center gap-12 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
        <div key={current.id} className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/30">
              <HugeiconsIcon icon={SparklesIcon} className="size-3.5" strokeWidth={2} />
              Featured
            </span>
            <StatusBadge status={current.status} className="py-1 text-xs" />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">{title}</h1>
          {(current.title_romaji !== title || current.title_japanese) && (
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              {[current.title_romaji !== title && current.title_romaji, current.title_japanese]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}

          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground/80">
            {meta.map((m) => (
              <li key={m.label} className="inline-flex items-center gap-1.5">
                <HugeiconsIcon icon={m.icon} className="size-4 text-primary" strokeWidth={2} />
                {m.label}
              </li>
            ))}
          </ul>

          <p className="mt-5 line-clamp-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {current.synopsis}
          </p>

          {current.genres.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {current.genres.map((g) => (
                <Link
                  key={g.id}
                  to={`/anime?genre=${g.slug}`}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/10 transition hover:bg-white/20"
                >
                  {g.name}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={`/anime/${current.id}`}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 bg-linear-to-r from-violet-500 to-fuchsia-500 px-6 text-white shadow-xl shadow-violet-500/30 hover:opacity-90",
              )}
            >
              <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} data-icon="inline-start" />
              View details
            </Link>
            <Link to="/anime" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-11 px-6 backdrop-blur")}>
              Browse catalogue
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
            </Link>
          </div>
        </div>

        <Link
          key={`poster-${current.id}`}
          to={`/anime/${current.id}`}
          className="group relative hidden animate-in fade-in zoom-in-95 duration-700 lg:block"
        >
          <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-linear-to-br from-violet-500/40 to-pink-500/30 opacity-60 blur-3xl transition-opacity group-hover:opacity-90" />
          <div className="aspect-[2/3] w-64 rotate-2 overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/15 transition duration-500 group-hover:rotate-0 xl:w-72">
            <PosterImage src={current.poster_url} alt={title} loading="eager" className="size-full" />
          </div>
        </Link>
      </div>

      {items.length > 1 && (
        <div className="absolute inset-x-0 bottom-8">
          <div className="mx-auto flex max-w-7xl gap-2 px-4 sm:px-6 lg:px-8">
            {items.map((anime, i) => (
              <button
                key={anime.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${displayTitle(anime)}`}
                aria-current={i === active}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i === active ? "w-10 bg-primary" : "w-4 bg-white/25 hover:bg-white/50",
                )}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function HeroSkeleton() {
  return (
    <section className="mx-auto grid min-h-[560px] max-w-7xl items-center gap-12 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
      <div className="max-w-2xl space-y-5">
        <Skeleton className="h-6 w-40 rounded-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-20 w-full" />
        <div className="flex gap-3">
          <Skeleton className="h-11 w-36 rounded-full" />
          <Skeleton className="h-11 w-44 rounded-full" />
        </div>
      </div>
      <Skeleton className="hidden aspect-[2/3] w-64 rounded-3xl lg:block xl:w-72" />
    </section>
  );
}
