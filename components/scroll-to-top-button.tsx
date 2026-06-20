"use client";

import { useEffect, useState } from "react";
import { Rocket } from "lucide-react";

const showAfterPixels = 520;
const radius = 24;
const circumference = 2 * Math.PI * radius;

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateVisibility = () => {
      const scrollableHeight = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const nextProgress = Math.min(
        1,
        Math.max(0, window.scrollY / scrollableHeight)
      );

      setVisible(window.scrollY > showAfterPixels);
      setProgress(nextProgress);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-white/92 text-emerald-700 shadow-lg shadow-slate-900/12 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 sm:bottom-6 sm:right-6 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
      aria-label="Back to top"
      title="Back to top"
    >
      <svg
        className="absolute inset-0 h-14 w-14 -rotate-90"
        viewBox="0 0 56 56"
        aria-hidden="true"
      >
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="rgb(209 250 229)"
          strokeWidth="3"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="rgb(5 150 105)"
          strokeLinecap="round"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
        />
      </svg>
      <span className="relative grid h-10 w-10 place-items-center rounded-full border border-emerald-900/10 bg-white">
        <Rocket className="h-5 w-5" />
      </span>
    </button>
  );
}
