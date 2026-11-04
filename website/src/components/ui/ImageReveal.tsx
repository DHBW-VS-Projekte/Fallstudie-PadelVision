"use client";
/**
 * ImageReveal.tsx – Bild mit Vorhang-Reveal (clip-path) + Zoom + Fallback
 *
 * Verwendung: Alle Fotos der Padel-Seite (auch der Hero, dann ohne Reveal).
 * Client Component, weil wir (1) den IntersectionObserver brauchen und
 * (2) per onError reagieren, wenn das Bild (noch) nicht existiert.
 *
 * Fallback: Der Container hat IMMER einen Farbverlauf als Hintergrund.
 * Fehlt die Bilddatei (404), blenden wir das <Image> aus (opacity 0) –
 * es bleibt der schöne Verlauf, ohne kaputtes Bild-Symbol oder Alt-Text-Fragment.
 */
import Image from "next/image";
import { useState } from "react";
import { CircleDot } from "lucide-react";
import { useRevealRef } from "@/components/ui/Reveal";
import type { PadelImage } from "@/components/padel/padelContent";

export interface ImageRevealProps {
  image: PadelImage;
  /** sizes-Angabe für next/image – bestimmt, welche Bildgröße geladen wird */
  sizes: string;
  /** Seitenverhältnis/Größe des Containers, z. B. "aspect-[4/5]" */
  className?: string;
  /** false = kein Scroll-Reveal (z. B. Hero oder Hintergrundbilder) */
  reveal?: boolean;
  /** true = Bild sofort und mit hoher Priorität laden (nur Hero!) */
  eager?: boolean;
  /** true = abgerundete Ecken, Schatten, Hover-Zoom (Standard) */
  framed?: boolean;
}

export default function ImageReveal({
  image,
  sizes,
  className = "",
  reveal = true,
  eager = false,
  framed = true,
}: ImageRevealProps) {
  // useState: merkt sich, ob das Laden fehlgeschlagen ist. Ohne ihn
  // würde der Browser ein kaputtes Bild + Alt-Text anzeigen.
  const [failed, setFailed] = useState(false);
  const ref = useRevealRef();

  return (
    <div
      ref={reveal ? ref : undefined}
      data-image-reveal={reveal ? "" : undefined}
      className={`group ${className.includes("absolute") ? "" : "relative"} overflow-hidden fallback-${image.fallback} ${
        framed ? "rounded-3xl shadow-soft" : ""
      } ${className}`}
    >
      {/* Dezentes Padel-Symbol im Fallback – nur sichtbar, solange kein Foto da ist */}
      <CircleDot
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 text-hero-ink/40"
      />
      <div className="reveal-zoom absolute inset-0">
        <Image
          src={image.src}
          alt={failed ? "" : image.alt}
          fill
          sizes={sizes}
          // loading/fetchPriority statt der älteren `priority`-Prop: funktioniert
          // in allen Next.js-Versionen und lädt das Hero-Bild bevorzugt.
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          onError={() => setFailed(true)}
          className={`object-cover transition-[opacity,transform] duration-700 ease-out-soft ${
            failed ? "opacity-0" : "opacity-100"
          } ${framed ? "group-hover:scale-[1.03]" : ""}`}
        />
      </div>
    </div>
  );
}