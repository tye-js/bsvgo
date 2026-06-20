"use client";

import { useEffect, useMemo, useState } from "react";
import { ListTree } from "lucide-react";
import type { ArticleTocItem } from "@/components/article-body";

export function ArticleTocNav({
  items,
  title,
}: {
  items: ArticleTocItem[];
  title: string;
}) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const anchorIds = useMemo(() => items.map((item) => item.id), [items]);

  useEffect(() => {
    if (anchorIds.length === 0) {
      return;
    }

    let frameId: number | null = null;

    const getHeadings = () =>
      anchorIds
        .map((id) => document.getElementById(id))
        .filter((element): element is HTMLElement => Boolean(element));

    const updateActiveHeading = () => {
      frameId = null;
      const headings = getHeadings();

      if (headings.length === 0) {
        return;
      }

      const activationOffset = Math.min(180, window.innerHeight * 0.35);
      let nextActiveId = headings[0].id;

      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= activationOffset) {
          nextActiveId = heading.id;
        } else {
          break;
        }
      }

      setActiveId((current) =>
        current === nextActiveId ? current : nextActiveId
      );
    };

    const scheduleUpdate = () => {
      if (frameId !== null) {
        return;
      }

      frameId = window.requestAnimationFrame(updateActiveHeading);
    };

    const timeoutId = window.setTimeout(scheduleUpdate, 80);
    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);

    return () => {
      window.clearTimeout(timeoutId);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
    };
  }, [anchorIds]);

  if (items.length === 0) {
    return null;
  }

  const visibleActiveId = activeId || items[0]?.id;

  return (
    <nav className="rounded-lg border border-teal-900/10 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
        <ListTree className="h-4 w-4" />
        {title}
      </div>
      <ol className="mt-4 space-y-2 text-sm">
        {items.map((item) => {
          const isActive = item.id === visibleActiveId;

          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`block rounded-md border-l-2 px-2 py-1.5 leading-5 transition ${
                  isActive
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
                    : "border-transparent text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                } ${item.level === 3 ? "ml-4 text-xs" : "font-medium"}`}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
