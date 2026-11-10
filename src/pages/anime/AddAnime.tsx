import { Link, useParams } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { loadAnimeForm } from "@/hooks/catalog";
import { useAsync } from "@/hooks/useAsync";
import { displayTitle } from "@/lib/anime";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimeForm } from "@/components/anime/AnimeForm";
import { ErrorState } from "@/components/anime/States";
import { cn } from "@/lib/utils";

/** Handles both `/anime/new` and `/anime/:id/edit`. */
export default function AddAnime() {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const { data, loading, error, reload } = useAsync(`form-${editId ?? "new"}`, () => loadAnimeForm(editId));

  const backTo = editId ? `/anime/${editId}` : "/anime";
  const heading = editId ? "Edit anime" : "Add new anime";

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
      <Link to={backTo} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 text-muted-foreground")}>
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} data-icon="inline-start" />
        Back
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
        {heading.split(" ").slice(0, -1).join(" ")} <span className="text-gradient">{heading.split(" ").at(-1)}</span>
      </h1>
      <p className="mt-2 text-muted-foreground">
        {data?.anime ? `Updating "${displayTitle(data.anime)}"` : "Fill in the details to add a title to your catalogue."}
      </p>

      <div className="mt-8">
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading || !data ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              <Skeleton className="h-64 rounded-3xl" />
              <Skeleton className="h-96 rounded-3xl" />
            </div>
            <Skeleton className="h-[480px] rounded-3xl" />
          </div>
        ) : (
          <AnimeForm key={editId ?? "new"} anime={data.anime} genres={data.genres} links={data.links} />
        )}
      </div>
    </div>
  );
}
