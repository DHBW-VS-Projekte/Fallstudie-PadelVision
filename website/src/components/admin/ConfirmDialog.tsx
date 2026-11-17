"use client";
/**
 * ConfirmDialog.tsx – Bestätigungsdialog (natives <dialog>)
 * <dialog> mit showModal() bringt Fokus-Falle, Escape-Taste und Hintergrund-
 * Sperre von Haus aus mit. Optional muss ein Wort eingetippt werden (z. B. RESET).
 */
import { useEffect, useRef, useState } from "react";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  text: string;
  confirmLabel: string;
  requireText?: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({ open, title, text, confirmLabel, requireText, busy = false, onConfirm, onClose }: ConfirmDialogProps) {
  // useRef: Zugriff auf das <dialog>-Element für showModal()/close() – nur im Effekt
  const ref = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState("");

  // useEffect: Dialog öffnen/schließen (imperative DOM-API = externes System)
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const allowed = !requireText || typed.trim() === requireText;

  return (
    <dialog
      ref={ref}
      onClose={() => {
        setTyped("");
        onClose();
      }}
      aria-labelledby="confirm-title"
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-3xl border border-line bg-card p-0 text-foreground shadow-lift backdrop:bg-hero-shade/60"
    >
      <form
        method="dialog"
        onSubmit={(e) => {
          e.preventDefault();
          if (allowed && !busy) onConfirm();
        }}
        className="p-7"
      >
        <h2 id="confirm-title" className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-3 leading-relaxed text-muted">{text}</p>
        {requireText && (
          <label className="mt-5 block">
            <span className="text-sm font-medium">Zur Bestätigung „{requireText}“ eintippen</span>
            <input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" className="mt-2 block min-h-12 w-full rounded-2xl border border-line bg-background px-4 font-mono text-base focus:border-accent" />
          </label>
        )}
        <div className="mt-7 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={() => ref.current?.close()} className="min-h-12 rounded-full border border-line px-6 font-semibold">
            Abbrechen
          </button>
          <button type="submit" disabled={!allowed || busy} className="min-h-12 rounded-full bg-accent px-6 font-semibold text-on-accent disabled:opacity-50">
            {busy ? "Bitte warten …" : confirmLabel}
          </button>
        </div>
      </form>
    </dialog>
  );
}