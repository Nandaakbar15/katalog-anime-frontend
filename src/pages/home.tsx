import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Building03Icon,
  Film01Icon,
  PlayIcon,
  SparklesIcon,
  Tag01Icon,
  Tv01Icon,
  VideoReplayIcon,
} from "@hugeicons/core-free-icons";
import { loadCatalog } from "@/hooks/catalog";
import { useAsync } from "@/hooks/useAsync";
import { ANIME_TYPES } from "@/lib/api";
import { TYPE_LABEL } from "@/lib/anime";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimeRow, SectionHeader } from "@/components/anime/AnimeRow";
import { HeroCarousel, HeroSkeleton } from "@/components/anime/HeroCarousel";
import { ErrorState } from "@/components/anime/States";
import { cn } from "@/lib/utils";

const GENRE_GRADIENTS = [
  "from-violet-500/30 to-fuchsia-500/10",
  "from-sky-500/30 to-cyan-500/10",
  "from-rose-500/30 to-orange-500/10",
  "from-emerald-500/30 to-teal-500/10",
  "from-amber-500/30 to-yellow-500/10",
  "from-pink-500/30 to-purple-500/10",
];

const TYPE_ICON = { TV: Tv01Icon, MOVIE: Film01Icon, OVA: VideoReplayIcon, SPECIAL: SparklesIcon };

function WelcomeHero() {
  return (
    <section className="mx-auto flex min-h-[480px] max-w-4xl flex-col items-center justify-center px-4 py-20 text-center">
      <span className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/30">
        <HugeiconsIcon icon={SparklesIcon} className="size-3.5" strokeWidth={2} />
        Your personal anime library
      </span>
      <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
        Catalogue every anime <span className="text-gradient">you love</span>
      </h1>
      <p className="mt-5 max-w-xl text-lg text-muted-foreground">
        Your catalogue is empty. Add your first title to start building your collection.
      </p>
      <Link
        to="/anime/new"
        className={cn(
          buttonVariants({ size: "lg" }),
          "mt-8 h-11 bg-linear-to-r from-violet-500 to-fuchsia-500 px-6 text-white shadow-xl shadow-violet-500/30 hover:opacity-90",
        )}
      >
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2.5} data-icon="inline-start" />
        Add your first anime
      </Link>
    </section>
  );
}

export default function Home() {
  const { data, loading, error, reload } = useAsync("catalog", loadCatalog);

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  const animes = data?.animes ?? [];
  const genres = data?.genres ?? [];
  const recent = [...animes].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const withBanner = recent.filter((a) => a.banner_url);
  const featured = (withBanner.length > 0 ? withBanner : recent).slice(0, 5);
  const airing = recent.filter((a) => a.status === "RELEASING");
  const upcoming = recent.filter((a) => a.status === "NOT_YET_RELEASED");

  const genreCounts = genres
    .map((g) => ({ ...g, count: animes.filter((a) => a.genres.some((ag) => ag.id === g.id)).length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const stats = [
    { label: "Titles", value: animes.length, icon: PlayIcon },
    { label: "Airing now", value: airing.length, icon: Tv01Icon },
    { label: "Genres", value: genres.length, icon: Tag01Icon },
    { label: "Studios", value: new Set(animes.map((a) => a.studio)).size, icon: Building03Icon },
  ];

  if (!loading && animes.length === 0) return <WelcomeHero />;

  return (
    <>
      {loading ? <HeroSkeleton /> : <HeroCarousel items={featured} />}

      <div className="mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
        <section className="-mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-4 rounded-2xl border border-white/5 bg-card/60 p-4 backdrop-blur sm:p-5"
            >
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                <HugeiconsIcon icon={s.icon} className="size-5" strokeWidth={2} />
              </div>
              <div>
                {loading ? (
                  <Skeleton className="mb-1 h-7 w-10" />
                ) : (
                  <p className="text-2xl font-bold tabular-nums">{s.value}</p>
                )}
                <p className="text-xs text-muted-foreground sm:text-sm">{s.label}</p>
              </div>
            </div>
          ))}
        </section>

        <AnimeRow
          title="Recently added"
          description="The latest additions to your catalogue"
          items={recent.slice(0, 15)}
          loading={loading}
          href="/anime?sort=newest"
        />

        {airing.length > 0 && (
          <AnimeRow
            title="Airing now"
            description="Shows currently releasing new episodes"
            items={airing.slice(0, 15)}
            href="/anime?status=RELEASING"
          />
        )}

        {upcoming.length > 0 && (
          <AnimeRow
            title="Coming soon"
            description="Upcoming titles on your radar"
            items={upcoming.slice(0, 15)}
            href="/anime?status=NOT_YET_RELEASED"
          />
        )}

        {genreCounts.length > 0 && (
          <section>
            <SectionHeader title="Browse by genre" description="Jump straight into what you're in the mood for" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {genreCounts.map((g, i) => (
                <Link
                  key={g.id}
                  to={`/anime?genre=${g.slug}`}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border border-white/5 bg-linear-to-br p-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/15",
                    GENRE_GRADIENTS[i % GENRE_GRADIENTS.length],
                  )}
                >
                  <p className="font-semibold">{g.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {g.count} {g.count === 1 ? "title" : "titles"}
                  </p>
                  <HugeiconsIcon
                    icon={Tag01Icon}
                    className="absolute -right-2 -bottom-2 size-14 text-white/5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12"
                  />
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionHeader title="Browse by format" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {ANIME_TYPES.map((type) => {
              const count = animes.filter((a) => a.type === type).length;
              return (
                <Link
                  key={type}
                  to={`/anime?type=${type}`}
                  className="group flex items-center justify-between rounded-2xl border border-white/5 bg-card/60 p-5 transition hover:border-primary/40 hover:bg-card"
                >
                  <div>
                    <p className="text-lg font-semibold">{TYPE_LABEL[type]}</p>
                    <p className="text-sm text-muted-foreground">
                      {count} {count === 1 ? "title" : "titles"}
                    </p>
                  </div>
                  <div className="grid size-12 place-items-center rounded-2xl bg-white/5 text-muted-foreground transition group-hover:bg-primary/15 group-hover:text-primary">
                    <HugeiconsIcon icon={TYPE_ICON[type]} className="size-6" strokeWidth={1.8} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
