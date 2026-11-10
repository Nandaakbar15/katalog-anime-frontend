import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { RootLayout } from "@/components/layout/RootLayout";
import Home from "@/pages/home";
import AnimeIndex from "@/pages/anime/Index";
import DetailAnime from "@/pages/anime/DetailAnime";
import AddAnime from "@/pages/anime/AddAnime";
import NotFound from "@/pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "anime", element: <AnimeIndex /> },
      { path: "anime/new", element: <AddAnime /> },
      { path: "anime/:id", element: <DetailAnime /> },
      { path: "anime/:id/edit", element: <AddAnime /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster theme="dark" position="bottom-right" richColors />
    </>
  );
}

export default App;
