import { useState } from "react";
import { cn } from "@/lib/utils";

interface PosterImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

export function PosterImage({ src, alt, className, loading = "lazy" }: PosterImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <div
        className={cn(
          "grid place-items-center bg-linear-to-br from-violet-900/70 via-fuchsia-900/40 to-slate-950 text-white/70",
          className,
        )}
      >
        <span className="line-clamp-3 px-3 text-center text-sm font-semibold">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setFailedSrc(src)}
      className={cn("object-cover", className)}
    />
  );
}
