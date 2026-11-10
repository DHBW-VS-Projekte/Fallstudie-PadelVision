"use client";
/**
 * ChapterNav.tsx – klebende Kapitelnavigation mit Scroll-Spy
 * Client Component: beobachtet per IntersectionObserver, welcher Abschnitt
 * gerade sichtbar ist, und hebt den passenden Link hervor.
 */
import { useEffect, useRef, useState } from "react";
import type { Chapter } from "@/components/padel/padelContent";

export default function ChapterNav({ chapters }: { chapters: Chapter[] }) {
  // useState: aktives Kapitel → bestimmt Hervorhebung + aria-current.
  const [active, setActive] = useState<string | null>(null);
  // useRef: Zugriff auf die horizontal scrollbare Liste, um den aktiven
  // Link in die Mitte zu schieben (nur in Callbacks, nie beim Rendern).
  const listRef = useRef<HTMLUListElement>(null);

  // useEffect: Der IntersectionObserver ist ein externes Browser-System.
  // setActive wird nur im Observer-Callback aufgerufen (nicht direkt im Effekt).
  useEffect(() => {
    const sections = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id;
          setActive(id);
          // Aktiven Link horizontal zentrieren – nur die Liste scrollt,
          // die Seite selbst bewegt sich dadurch NICHT vertikal.
          const list = listRef.current;
          const link = list?.querySelector<HTMLAnchorElement>(`a[href="#${id}"]`);
          if (list && link) {
            list.scrollTo({ left: link.offsetLeft - list.clientWidth / 2 + link.clientWidth / 2, behavior: "smooth" });
          }
        }
      },
      // Nur ein schmaler Streifen im oberen Drittel zählt als "aktiv"
      { rootMargin: "-35% 0px -60% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [chapters]);

  return (
    // Klebt oben; bei eingeblendeter Hauptnavigation rutscht sie darunter.
    <nav
      aria-label="Kapitel"
      data-chapter-nav
      className="chapter-nav sticky top-0 z-40 border-y border-line bg-background/75 backdrop-blur-xl transition-[top] duration-300"
    >
      <ul ref={listRef} className="no-scrollbar mx-auto flex max-w-7xl snap-x gap-1 overflow-x-auto px-5 py-2 sm:px-8">
        {chapters.map((chapter) => {
          const isActive = active === chapter.id;
          return (
            <li key={chapter.id} className="snap-start">
              <a
                href={`#${chapter.id}`}
                aria-current={isActive ? "true" : undefined}
                className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors ${
                  isActive ? "bg-brand-green text-white" : "text-muted hover:text-foreground"
                }`}
              >
                {chapter.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}