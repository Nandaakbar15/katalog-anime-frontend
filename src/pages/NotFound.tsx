import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-32 text-center">
      <p className="text-gradient text-8xl font-black">404</p>
      <h1 className="mt-4 text-2xl font-bold">This page went to another isekai</h1>
      <p className="mt-2 text-muted-foreground">The page you're looking for doesn't exist.</p>
      <Link to="/" className={buttonVariants({ className: "mt-8" })}>
        Back to home
      </Link>
    </div>
  );
}
