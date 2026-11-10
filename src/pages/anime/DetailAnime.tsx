import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Building03Icon,
  Calendar03Icon,
  Clock01Icon,
  Delete02Icon,
  Layers01Icon,
  PencilEdit02Icon,
  Tv01Icon,
} from "@hugeicons/core-free-icons";
import { loadAnimeDetail } from "@/hooks/catalog";
import { useAsync } from "@/hooks/useAsync";
import { deleteAnime, getErrorMessage } from "@/lib/api";
import { SEASON_LABEL, STATUS_LABEL, TYPE_LABEL, displayTitle } from "@/lib/anime";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PosterImage } from "@/components/anime/PosterImage";
import { StatusBadge } from "@/components/anime/StatusBadge";
import { ErrorState } from "@/components/anime/States";
import { cn } from "@/lib/utils";

function BackLink() {
  return (
    <Link
      to="/anime"
      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "bg-black/40 backdrop-blur-md")}
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} data-icon="inline-start" />
      Catalogue
    </Link>
  );
}

function DetailSkeleton() {
  return (
    <div>
      <Skeleton className="h-[42vh] min-h-72 w-full rounded-none" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] lg:px-8">
        <Skeleton className="mx-auto -mt-40 aspect-[2/3] w-48 rounded-3xl md:w-full" />
        <div className="space-y-4 md:pt-8">
          <Skeleton className="h-6 w-40 rounded-full" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function DetailAnime() {
  const { id } = useParams();
  const animeId = Number(id);
  const navigate = useNavigate();
  const { data: anime, loading, error, reload } = useAsync(`anime-${animeId}`, () => loadAnimeDetail(animeId));
  const [deleting, setDeleting] = useState(false);

  if (loading) return <DetailSkeleton />;
  if (error || !anime) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <BackLink />
        <div className="mt-8">
          <ErrorState message={error ?? "Anime not found"} onRetry={reload} />
        </div>
      </div>
    );
  }

  const title = displayTitle(anime);
  const onDelete = async () => {
    setDeleting(true);
    try {
      await deleteAnime(anime.id);
      toast.success(`"${title}" was removed from your catalogue`);
      navigate("/anime");
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleting(false);
    }
  };

  const info = [
    { icon: Tv01Icon, label: "Format", value: TYPE_LABEL[anime.type] },
    { icon: Layers01Icon, label: "Episodes", value: anime.total_episodes ?? "?" },
    { icon: Clock01Icon, label: "Status", value: STATUS_LABEL[anime.status] },
    { icon: Calendar03Icon, label: "Season", value: `${SEASON_LABEL[anime.season]} ${anime.release_year}` },
    { icon: Building03Icon, label: "Studio", value: anime.studio },
  ];

  return (
    <article>
      <div className="relative h-[42vh] min-h-72 w-full overflow-hidden">
        <PosterImage
          src={anime.banner_url ?? anime.poster_url}
          alt=""
          loading="eager"
          className={cn("size-full", !anime.banner_url && "scale-125 opacity-60 blur-3xl")}
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-x-0 top-0">
          <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
            <BackLink />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative grid gap-8 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] lg:gap-12">
          <aside className="-mt-40 md:-mt-48">
            <div className="mx-auto aspect-[2/3] w-48 overflow-hidden rounded-3xl shadow-2xl shadow-black/60 ring-1 ring-white/15 md:w-full">
              <PosterImage src={anime.poster_url} alt={title} loading="eager" className="size-full" />
            </div>
            <div className="mx-auto mt-4 grid w-48 grid-cols-2 gap-2 md:w-full">
              <Link to={`/anime/${anime.id}/edit`} className={buttonVariants({ variant: "secondary" })}>
                <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} data-icon="inline-start" />
                Edit
              </Link>
              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="destructive" />}>
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} data-icon="inline-start" />
                  Delete
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this anime?</AlertDialogTitle>
                    <AlertDialogDescription>
                      "{title}" will be permanently removed from your catalogue. This can't be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={onDelete} disabled={deleting}>
                      {deleting ? "Deleting…" : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </aside>

          <div className="min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-700 md:-mt-24">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={anime.status} className="py-1 text-xs" />
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold ring-1 ring-white/10">
                {TYPE_LABEL[anime.type]}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">{title}</h1>
            <div className="mt-2 space-y-0.5 text-muted-foreground">
              {anime.title_romaji !== title && <p className="text-lg">{anime.title_romaji}</p>}
              {anime.title_japanese && <p lang="ja">{anime.title_japanese}</p>}
            </div>

            {anime.genres.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {anime.genres.map((g) => (
                  <Link
                    key={g.id}
                    to={`/anime?genre=${g.slug}`}
                    className="rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary ring-1 ring-primary/30 transition hover:bg-primary/25"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}

            <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
              {info.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/5 bg-card/60 p-4">
                  <dt className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    <HugeiconsIcon icon={item.icon} className="size-3.5 text-primary" strokeWidth={2} />
                    {item.label}
                  </dt>
                  <dd className="mt-1.5 truncate font-semibold" title={String(item.value)}>
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            <section className="mt-10">
              <h2 className="text-xl font-bold tracking-tight">Synopsis</h2>
              <p className="mt-3 max-w-3xl leading-relaxed whitespace-pre-line text-foreground/80">{anime.synopsis}</p>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}
