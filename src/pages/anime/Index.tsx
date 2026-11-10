import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Cancel01Icon, GridViewIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { loadCatalog, type AnimeWithGenres } from "@/hooks/catalog";
import { useAsync } from "@/hooks/useAsync";
import { ANIME_TYPES, SEASONS, STATUSES } from "@/lib/api";
import { SEASON_LABEL, STATUS_LABEL, TYPE_LABEL, displayTitle } from "@/lib/anime";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimeCard, AnimeCardSkeleton } from "@/components/anime/AnimeCard";
import { FilterSelect } from "@/components/anime/FilterSelect";
import { EmptyState, ErrorState } from "@/components/anime/States";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 24;
const ALL = "all";

const SORTS = {
  newest: { label: "Recently added", compare: (a: AnimeWithGenres, b: AnimeWithGenres) => Date.parse(b.createdAt) - Date.parse(a.createdAt) },
  title: { label: "Title (A–Z)", compare: (a: AnimeWithGenres, b: AnimeWithGenres) => displayTitle(a).localeCompare(displayTitle(b)) },
  year_desc: { label: "Year (newest)", compare: (a: AnimeWithGenres, b: AnimeWithGenres) => b.release_year - a.release_year },
  year_asc: { label: "Year (oldest)", compare: (a: AnimeWithGenres, b: AnimeWithGenres) => a.release_year - b.release_year },
} as const;
type SortKey = keyof typeof SORTS;

const withAll = (label: string, options: { value: string; label: string }[]) => [{ value: ALL, label }, ...options];

const TYPE_OPTIONS = withAll("All formats", ANIME_TYPES.map((t) => ({ value: t, label: TYPE_LABEL[t] })));
const STATUS_OPTIONS = withAll("Any status", STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] })));
const SEASON_OPTIONS = withAll("Any season", SEASONS.map((s) => ({ value: s, label: SEASON_LABEL[s] })));
const SORT_OPTIONS = Object.entries(SORTS).map(([value, s]) => ({ value, label: s.label }));

export default function AnimeIndex() {
  const { data, loading, error, reload } = useAsync("catalog", loadCatalog);
  const [params, setParams] = useSearchParams();

  const q = params.get("q") ?? "";
  const genre = params.get("genre") ?? ALL;
  const type = params.get("type") ?? ALL;
  const status = params.get("status") ?? ALL;
  const season = params.get("season") ?? ALL;
  const sortParam = params.get("sort") ?? "newest";
  const sort: SortKey = sortParam in SORTS ? (sortParam as SortKey) : "newest";

  const setParam = (key: string, value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value && value !== ALL) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );

  const animes = useMemo(() => data?.animes ?? [], [data]);
  const genres = data?.genres ?? [];

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return animes
      .filter(
        (a) =>
          (!term ||
            [a.title_english, a.title_romaji, a.title_japanese ?? "", a.studio].some((s) =>
              s.toLowerCase().includes(term),
            )) &&
          (type === ALL || a.type === type) &&
          (status === ALL || a.status === status) &&
          (season === ALL || a.season === season) &&
          (genre === ALL || a.genres.some((g) => g.slug === genre)),
      )
      .sort(SORTS[sort].compare);
  }, [animes, q, type, status, season, genre, sort]);

  const filterKey = [q, genre, type, status, season, sort].join("|");
  const [page, setPage] = useState({ key: filterKey, count: PAGE_SIZE });
  const visibleCount = page.key === filterKey ? page.count : PAGE_SIZE;
  const visible = results.slice(0, visibleCount);

  const activeFilters = [
    q && { key: "q", label: `"${q}"` },
    genre !== ALL && { key: "genre", label: genres.find((g) => g.slug === genre)?.name ?? genre },
    type !== ALL && { key: "type", label: TYPE_LABEL[type as keyof typeof TYPE_LABEL] ?? type },
    status !== ALL && { key: "status", label: STATUS_LABEL[status as keyof typeof STATUS_LABEL] ?? status },
    season !== ALL && { key: "season", label: SEASON_LABEL[season as keyof typeof SEASON_LABEL] ?? season },
  ].filter((f) => !!f);

  const clearAll = () => setParams(sort === "newest" ? {} : { sort }, { replace: true });

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Anime <span className="text-gradient">Catalogue</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            {loading ? "Loading your collection…" : `${animes.length} titles in your collection`}
          </p>
        </div>
      </header>

      <div className="sticky top-16 z-30 -mx-4 mt-8 space-y-3 border-b border-white/5 bg-background/80 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <HugeiconsIcon
              icon={Search01Icon}
              strokeWidth={2}
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={q}
              onChange={(e) => setParam("q", e.target.value)}
              placeholder="Search by title, Japanese title or studio…"
              aria-label="Search anime"
              className="h-10 pl-10"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex">
            <FilterSelect aria-label="Format" value={type} onChange={(v) => setParam("type", v)} options={TYPE_OPTIONS} className="h-10 lg:w-36" />
            <FilterSelect aria-label="Status" value={status} onChange={(v) => setParam("status", v)} options={STATUS_OPTIONS} className="h-10 lg:w-36" />
            <FilterSelect aria-label="Season" value={season} onChange={(v) => setParam("season", v)} options={SEASON_OPTIONS} className="h-10 lg:w-36" />
            <FilterSelect aria-label="Sort by" value={sort} onChange={(v) => setParam("sort", v === "newest" ? "" : v)} options={SORT_OPTIONS} className="h-10 lg:w-44" />
          </div>
        </div>

        {genres.length > 0 && (
          <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1">
            {[{ id: 0, name: "All genres", slug: ALL }, ...genres].map((g) => {
              const selected = genre === g.slug;
              return (
                <button
                  key={g.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setParam("genre", selected ? ALL : g.slug)}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition",
                    selected
                      ? "bg-primary text-primary-foreground ring-primary"
                      : "bg-white/5 text-muted-foreground ring-white/10 hover:bg-white/10 hover:text-foreground",
                  )}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 flex min-h-8 flex-wrap items-center gap-2 text-sm">
        {loading ? (
          <Skeleton className="h-5 w-40" />
        ) : (
          <span className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{results.length}</span>{" "}
            {results.length === 1 ? "result" : "results"}
          </span>
        )}
        {activeFilters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setParam(f.key, "")}
            className="inline-flex items-center gap-1 rounded-full bg-primary/15 py-1 pr-2 pl-3 text-xs font-medium text-primary ring-1 ring-primary/30 transition hover:bg-primary/25"
          >
            {f.label}
            <HugeiconsIcon icon={Cancel01Icon} className="size-3" strokeWidth={2.5} />
            <span className="sr-only">Remove filter</span>
          </button>
        ))}
        {activeFilters.length > 1 && (
          <button type="button" onClick={clearAll} className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Clear all
          </button>
        )}
      </div>

      <div className="mt-6">
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }, (_, i) => (
              <AnimeCardSkeleton key={i} />
            ))}
          </div>
        ) : animes.length === 0 ? (
          <EmptyState
            icon={GridViewIcon}
            title="Your catalogue is empty"
            description="Start building your collection by adding your first anime."
            action={
              <Link to="/anime/new" className={buttonVariants()}>
                <HugeiconsIcon icon={Add01Icon} strokeWidth={2.5} data-icon="inline-start" />
                Add anime
              </Link>
            }
          />
        ) : results.length === 0 ? (
          <EmptyState
            icon={Search01Icon}
            title="No matches found"
            description="Try a different keyword or loosen your filters."
            action={
              <Button variant="outline" onClick={clearAll}>
                Reset filters
              </Button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {visible.map((anime) => (
                <div key={anime.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <AnimeCard anime={anime} genres={anime.genres} />
                </div>
              ))}
            </div>
            {visibleCount < results.length && (
              <div className="mt-12 flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setPage({ key: filterKey, count: visibleCount + PAGE_SIZE })}
                >
                  Load more ({results.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
