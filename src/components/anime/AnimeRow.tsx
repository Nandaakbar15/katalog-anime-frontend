import { useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import type { AnimeWithGenres } from "@/hooks/catalog";
import { Button } from "@/components/ui/button";
import { AnimeCard, AnimeCardSkeleton } from "./AnimeCard";

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function AnimeRow({
  title,
  description,
  items,
  loading,
  href,
}: {
  title: string;
  description?: string;
  items: AnimeWithGenres[];
  loading?: boolean;
  href?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const scroll = (direction: 1 | -1) => {
    const el = scroller.current;
    el?.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section>
      <SectionHeader
        title={title}
        description={description}
        action={
          <div className="flex items-center gap-1">
            {href && (
              <Link
                to={href}
                className="mr-2 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                See all
                <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-4" strokeWidth={2} />
              </Link>
            )}
            <Button variant="outline" size="icon-sm" onClick={() => scroll(-1)} aria-label="Scroll left" className="hidden sm:inline-flex">
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => scroll(1)} aria-label="Scroll right" className="hidden sm:inline-flex">
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
            </Button>
          </div>
        }
      />
      <div
        ref={scroller}
        className="scrollbar-none -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pt-1 pb-3 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:px-8"
      >
        {loading
          ? Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="w-40 shrink-0 sm:w-44 lg:w-48">
                <AnimeCardSkeleton />
              </div>
            ))
          : items.map((anime) => (
              <div key={anime.id} className="w-40 shrink-0 snap-start sm:w-44 lg:w-48">
                <AnimeCard anime={anime} genres={anime.genres} />
              </div>
            ))}
      </div>
    </section>
  );
}
