import axios from "axios";

export const ANIME_TYPES = ["TV", "MOVIE", "OVA", "SPECIAL"] as const;
export const SEASONS = ["SPRING", "SUMMER", "FALL", "WINTER"] as const;
export const STATUSES = ["FINISHED", "RELEASING", "NOT_YET_RELEASED"] as const;

export type AnimeType = (typeof ANIME_TYPES)[number];
export type Season = (typeof SEASONS)[number];
export type AnimeStatus = (typeof STATUSES)[number];

export interface Anime {
  id: number;
  title_romaji: string;
  title_english: string;
  title_japanese: string | null;
  slug: string;
  synopsis: string;
  poster_url: string;
  banner_url: string | null;
  type: AnimeType;
  total_episodes: number | null;
  season: Season;
  release_year: number;
  studio: string;
  status: AnimeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface AnimeGenre {
  id: number;
  anime_id: number;
  genre_id: number;
}

export type AnimeInput = Omit<Anime, "id" | "createdAt" | "updatedAt">;

interface ApiResponse<T> {
  statusCode: number;
  message?: string;
  data: T;
}

// The backend paginates with a default limit of 5, so request a large page to load the whole catalogue.
const ALL = { params: { page: 1, limit: 1000 } };

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
});

export async function getAnimes() {
  const res = await api.get<ApiResponse<Anime[]>>("/animes", ALL);
  return res.data.data;
}

export async function getAnime(id: number) {
  const res = await api.get<ApiResponse<Anime>>(`/animes/${id}`);
  return res.data.data;
}

export async function createAnime(input: AnimeInput) {
  const res = await api.post<ApiResponse<Anime>>("/addNewAnime", input);
  return res.data.data;
}

export async function updateAnime(id: number, input: AnimeInput) {
  const res = await api.put<ApiResponse<Anime>>(`/updateAnime/${id}`, input);
  return res.data.data;
}

export async function deleteAnime(id: number) {
  await api.delete(`/deleteAnime/${id}`);
}

export async function getGenres() {
  const res = await api.get<ApiResponse<Genre[]>>("/genres", ALL);
  return res.data.data;
}

export async function getAnimeGenres() {
  const res = await api.get<ApiResponse<AnimeGenre[]>>("/anime_genres");
  return res.data.data;
}

export async function addAnimeGenre(anime_id: number, genre_id: number) {
  await api.post("/addAnimeGenres", { anime_id, genre_id });
}

export async function deleteAnimeGenre(id: number) {
  await api.delete(`/deleteAnimeGenres/${id}`);
}

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (!error.response) return "Cannot reach the API server. Is the backend running?";
    return (error.response.data as { message?: string })?.message ?? error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong";
}
