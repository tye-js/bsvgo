"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const article = document.querySelector<HTMLElement>("[data-article-body]");

      if (!article) {
        setProgress(0);
        return;
      }

      const rect = article.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const total = Math.max(1, rect.height - viewportHeight * 0.35);
      const read = Math.min(total, Math.max(0, viewportHeight * 0.2 - rect.top));

      setProgress(Math.round((read / total) * 100));
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] h-1 bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full bg-emerald-400 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
