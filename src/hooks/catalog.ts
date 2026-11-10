import {
  getAnime,
  getAnimeGenres,
  getAnimes,
  getGenres,
  type Anime,
  type AnimeGenre,
  type Genre,
} from "@/lib/api";

export interface AnimeWithGenres extends Anime {
  genres: Genre[];
}

// Genres are optional enrichment; the catalogue should still render if those endpoints fail.
const safeGenres = () => getGenres().catch(() => [] as Genre[]);
const safeAnimeGenres = () => getAnimeGenres().catch(() => [] as AnimeGenre[]);

function genresFor(animeId: number, genres: Genre[], links: AnimeGenre[]) {
  const ids = new Set(links.filter((l) => l.anime_id === animeId).map((l) => l.genre_id));
  return genres.filter((g) => ids.has(g.id));
}

export async function loadCatalog() {
  const [animes, genres, links] = await Promise.all([getAnimes(), safeGenres(), safeAnimeGenres()]);
  return {
    genres,
    animes: animes.map<AnimeWithGenres>((a) => ({ ...a, genres: genresFor(a.id, genres, links) })),
  };
}

export async function loadAnimeDetail(id: number) {
  const [anime, genres, links] = await Promise.all([getAnime(id), safeGenres(), safeAnimeGenres()]);
  return { ...anime, genres: genresFor(id, genres, links) } satisfies AnimeWithGenres;
}

export async function loadAnimeForm(id: number | null) {
  const [genres, anime, links] = await Promise.all([
    safeGenres(),
    id ? getAnime(id) : Promise.resolve(null),
    id ? getAnimeGenres().then((all) => all.filter((l) => l.anime_id === id)) : Promise.resolve([]),
  ]);
  return { genres, anime, links };
}
