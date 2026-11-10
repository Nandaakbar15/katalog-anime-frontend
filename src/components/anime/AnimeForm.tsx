import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import {
  ANIME_TYPES,
  SEASONS,
  STATUSES,
  addAnimeGenre,
  createAnime,
  deleteAnimeGenre,
  getErrorMessage,
  updateAnime,
  type Anime,
  type AnimeGenre,
  type AnimeInput,
  type AnimeStatus,
  type AnimeType,
  type Genre,
  type Season,
} from "@/lib/api";
import { SEASON_LABEL, STATUS_LABEL, TYPE_LABEL, slugify } from "@/lib/anime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AnimeCard } from "./AnimeCard";
import { FilterSelect } from "./FilterSelect";
import { PosterImage } from "./PosterImage";

interface FormValues {
  title_romaji: string;
  title_english: string;
  title_japanese: string;
  slug: string;
  synopsis: string;
  poster_url: string;
  banner_url: string;
  type: AnimeType;
  total_episodes: string;
  season: Season;
  release_year: string;
  studio: string;
  status: AnimeStatus;
}

type Errors = Partial<Record<keyof FormValues, string>>;

const CURRENT_YEAR = new Date().getFullYear();

const EMPTY: FormValues = {
  title_romaji: "",
  title_english: "",
  title_japanese: "",
  slug: "",
  synopsis: "",
  poster_url: "",
  banner_url: "",
  type: "TV",
  total_episodes: "",
  season: "SPRING",
  release_year: String(CURRENT_YEAR),
  studio: "",
  status: "FINISHED",
};

function toFormValues(anime: Anime): FormValues {
  return {
    ...anime,
    title_japanese: anime.title_japanese ?? "",
    banner_url: anime.banner_url ?? "",
    total_episodes: anime.total_episodes?.toString() ?? "",
    release_year: String(anime.release_year),
  };
}

const isUrl = (value: string) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

function validate(v: FormValues): Errors {
  const errors: Errors = {};
  const required: (keyof FormValues)[] = ["title_romaji", "title_english", "synopsis", "poster_url", "studio"];
  for (const key of required) if (!v[key].trim()) errors[key] = "This field is required";

  if (v.poster_url.trim() && !isUrl(v.poster_url.trim())) errors.poster_url = "Enter a valid image URL";
  if (v.banner_url.trim() && !isUrl(v.banner_url.trim())) errors.banner_url = "Enter a valid image URL";

  const year = Number(v.release_year);
  if (!Number.isInteger(year) || year < 1917 || year > CURRENT_YEAR + 5)
    errors.release_year = `Enter a year between 1917 and ${CURRENT_YEAR + 5}`;

  if (v.total_episodes && (!Number.isInteger(Number(v.total_episodes)) || Number(v.total_episodes) < 1))
    errors.total_episodes = "Must be a positive whole number";

  return errors;
}

function toInput(v: FormValues): AnimeInput {
  return {
    title_romaji: v.title_romaji.trim(),
    title_english: v.title_english.trim(),
    title_japanese: v.title_japanese.trim() || null,
    slug: v.slug.trim() || slugify(v.title_romaji),
    synopsis: v.synopsis.trim(),
    poster_url: v.poster_url.trim(),
    banner_url: v.banner_url.trim() || null,
    type: v.type,
    total_episodes: v.total_episodes ? Number(v.total_episodes) : null,
    season: v.season,
    release_year: Number(v.release_year),
    studio: v.studio.trim(),
    status: v.status,
  };
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/5 bg-card/60 p-5 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  required,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-primary">*</span>}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

export function AnimeForm({
  anime,
  genres,
  links,
}: {
  anime: Anime | null;
  genres: Genre[];
  links: AnimeGenre[];
}) {
  const navigate = useNavigate();
  const editing = anime !== null;
  const [values, setValues] = useState<FormValues>(anime ? toFormValues(anime) : EMPTY);
  const [genreIds, setGenreIds] = useState<number[]>(links.map((l) => l.genre_id));
  const [slugTouched, setSlugTouched] = useState(editing);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title_romaji" && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const text = (key: keyof FormValues) => ({
    id: key,
    value: values[key],
    "aria-invalid": !!errors[key] || undefined,
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
    onChange: (e: { target: { value: string } }) => set(key, e.target.value),
  });

  const toggleGenre = (id: number) =>
    setGenreIds((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(Object.keys(found)[0])?.focus();
      toast.error("Please fix the highlighted fields");
      return;
    }

    setSubmitting(true);
    try {
      const input = toInput(values);
      const saved = editing ? await updateAnime(anime.id, input) : await createAnime(input);

      const removed = links.filter((l) => !genreIds.includes(l.genre_id));
      const added = genreIds.filter((id) => !links.some((l) => l.genre_id === id));
      await Promise.all([
        ...removed.map((l) => deleteAnimeGenre(l.id)),
        ...added.map((id) => addAnimeGenre(saved.id, id)),
      ]);

      toast.success(editing ? "Changes saved" : `"${input.title_english}" added to your catalogue`);
      navigate(`/anime/${saved.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  const preview: Anime = {
    ...toInput(values),
    title_english: values.title_english || values.title_romaji || "Untitled anime",
    synopsis: values.synopsis || "The synopsis will appear here.",
    release_year: Number(values.release_year) || CURRENT_YEAR,
    id: anime?.id ?? 0,
    createdAt: "",
    updatedAt: "",
  };

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Section title="Titles" description="How this anime is known around the world">
          <Field id="title_english" label="English title" required error={errors.title_english}>
            <Input {...text("title_english")} placeholder="Attack on Titan" />
          </Field>
          <Field id="title_romaji" label="Romaji title" required error={errors.title_romaji}>
            <Input {...text("title_romaji")} placeholder="Shingeki no Kyojin" />
          </Field>
          <Field id="title_japanese" label="Japanese title" error={errors.title_japanese}>
            <Input {...text("title_japanese")} lang="ja" placeholder="進撃の巨人" />
          </Field>
          <Field id="slug" label="Slug" hint="Generated from the romaji title" error={errors.slug}>
            <Input
              {...text("slug")}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugify(e.target.value));
              }}
              placeholder="shingeki-no-kyojin"
            />
          </Field>
        </Section>

        <Section title="Details">
          <Field id="type" label="Format" required>
            <FilterSelect
              id="type"
              value={values.type}
              onChange={(v) => set("type", v as AnimeType)}
              options={ANIME_TYPES.map((t) => ({ value: t, label: TYPE_LABEL[t] }))}
            />
          </Field>
          <Field id="status" label="Status" required>
            <FilterSelect
              id="status"
              value={values.status}
              onChange={(v) => set("status", v as AnimeStatus)}
              options={STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
            />
          </Field>
          <Field id="season" label="Season" required>
            <FilterSelect
              id="season"
              value={values.season}
              onChange={(v) => set("season", v as Season)}
              options={SEASONS.map((s) => ({ value: s, label: SEASON_LABEL[s] }))}
            />
          </Field>
          <Field id="release_year" label="Release year" required error={errors.release_year}>
            <Input {...text("release_year")} type="number" inputMode="numeric" min={1917} max={CURRENT_YEAR + 5} />
          </Field>
          <Field id="total_episodes" label="Total episodes" hint="Leave empty if unknown" error={errors.total_episodes}>
            <Input {...text("total_episodes")} type="number" inputMode="numeric" min={1} placeholder="25" />
          </Field>
          <Field id="studio" label="Studio" required error={errors.studio}>
            <Input {...text("studio")} placeholder="Wit Studio" />
          </Field>
          <Field id="synopsis" label="Synopsis" required error={errors.synopsis} className="sm:col-span-2">
            <Textarea {...text("synopsis")} rows={6} className="min-h-36" placeholder="What is this anime about?" />
          </Field>
        </Section>

        <Section title="Artwork" description="Paste direct links to image files">
          <Field id="poster_url" label="Poster URL" required error={errors.poster_url} className="sm:col-span-2">
            <Input {...text("poster_url")} type="url" placeholder="https://…/poster.jpg" />
          </Field>
          <Field id="banner_url" label="Banner URL" hint="Wide image used as the page backdrop" error={errors.banner_url} className="sm:col-span-2">
            <Input {...text("banner_url")} type="url" placeholder="https://…/banner.jpg" />
          </Field>
        </Section>

        <section className="rounded-3xl border border-white/5 bg-card/60 p-5 sm:p-6">
          <h2 className="font-semibold">Genres</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {genreIds.length > 0 ? `${genreIds.length} selected` : "Pick all that apply"}
          </p>
          {genres.length === 0 ? (
            <p className="mt-5 text-sm text-muted-foreground">No genres available yet. Add genres through the API first.</p>
          ) : (
            <div className="mt-5 flex flex-wrap gap-2">
              {genres.map((g) => {
                const selected = genreIds.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleGenre(g.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition",
                      selected
                        ? "bg-primary text-primary-foreground ring-primary"
                        : "bg-white/5 text-muted-foreground ring-white/10 hover:bg-white/10 hover:text-foreground",
                    )}
                  >
                    {selected && <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5" strokeWidth={2.5} />}
                    {g.name}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-white/5 bg-card/60 p-5">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Live preview</p>
          <div className="mt-4 aspect-[16/7] overflow-hidden rounded-2xl ring-1 ring-white/10">
            <PosterImage src={values.banner_url.trim() || null} alt="Banner preview" className="size-full" />
          </div>
          <div className="pointer-events-none mx-auto mt-4 w-48">
            <AnimeCard anime={preview} genres={genres.filter((g) => genreIds.includes(g.id))} />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="flex-1 bg-linear-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:opacity-90"
          >
            {submitting && <HugeiconsIcon icon={Loading03Icon} className="animate-spin" strokeWidth={2} data-icon="inline-start" />}
            {editing ? "Save changes" : "Add anime"}
          </Button>
        </div>
      </aside>
    </form>
  );
}
