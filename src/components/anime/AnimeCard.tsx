import { Link } from "react-router-dom";
import type { Anime, Genre } from "@/lib/api";
import { SEASON_LABEL, TYPE_LABEL, displayTitle } from "@/lib/anime";
import { Skeleton } from "@/components/ui/skeleton";
import { PosterImage } from "./PosterImage";
import { StatusBadge } from "./StatusBadge";

export function AnimeCard({ anime, genres = [] }: { anime: Anime; genres?: Genre[] }) {
  const title = displayTitle(anime);

  return (
    <Link to={`/anime/${anime.id}`} className="group block rounded-2xl outline-none" aria-label={title}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-muted ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-violet-500/20 group-hover:ring-violet-400/50 group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <PosterImage
          src={anime.poster_url}
          alt={title}
          className="size-full transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/20 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

        <span className="absolute top-2 left-2 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-semibold text-white ring-1 ring-white/10 backdrop-blur">
          {TYPE_LABEL[anime.type]}
        </span>
        <StatusBadge status={anime.status} className="absolute top-2 right-2 bg-black/60" />

        <div className="absolute inset-x-0 bottom-0 translate-y-3 p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="line-clamp-4 text-xs leading-relaxed text-white/85">{anime.synopsis}</p>
          {genres.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {genres.slice(0, 3).map((g) => (
                <span key={g.id} className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white">
                  {g.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-0.5 px-0.5">
        <h3 className="line-clamp-1 text-sm font-semibold transition-colors group-hover:text-primary">{title}</h3>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {SEASON_LABEL[anime.season]} {anime.release_year}
          {anime.total_episodes ? ` · ${anime.total_episodes} eps` : ""}
        </p>
      </div>
    </Link>
  );
}

export function AnimeCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[2/3] rounded-2xl" />
      <Skeleton className="mt-3 h-4 w-4/5" />
      <Skeleton className="mt-1.5 h-3 w-1/2" />
    </div>
  );
}
