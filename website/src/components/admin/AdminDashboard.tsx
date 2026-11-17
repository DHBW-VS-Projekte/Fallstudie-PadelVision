"use client";
/**
 * AdminDashboard.tsx – Live-Übersicht für /verwaltung (optimiert für den Beamer)
 *
 * - pollt /api/version.php alle 2 Sekunden; nur bei Änderung werden Buchungen,
 *   Kennzahlen und Belegungsplan nachgeladen
 * - Präsentationsmodus: größere Schrift, blendet Navigation, Filter und Aktionen aus
 * - Aktionen: Buchung stornieren, alle Testdaten zurücksetzen (RESET eintippen)
 */
import { useEffect, useState } from "react";
import { LogOut, Maximize2, Minimize2, RefreshCw, Trash2 } from "lucide-react";
import BookingsTable from "@/components/admin/BookingsTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import LiveFeed from "@/components/admin/LiveFeed";
import OccupancyGrid from "@/components/admin/OccupancyGrid";
import StatsBar from "@/components/admin/StatsBar";
import LiveBadge from "@/components/booking/LiveBadge";
import { useLiveVersion, useNow } from "@/components/booking/usePolling";
import { api, asApiError } from "@/lib/booking/api";
import { catalog } from "@/lib/booking/catalog";
import { errorMessage } from "@/lib/booking/errors";
import { todayIn } from "@/lib/booking/format";
import type { AdminBooking, AdminStats, OccupancyResponse } from "@/lib/booking/types";

type Dialog = { kind: "cancel"; booking: AdminBooking } | { kind: "reset" } | null;

export default function AdminDashboard({ onLoggedOut }: { onLoggedOut: () => void }) {
  const { version, status } = useLiveVersion(5000);
  const now = useNow();
  const [presentation, setPresentation] = useState(false);
  // Gewählter Tag: null = "heute" (in deutscher Zeit, sobald die Uhr läuft)
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [location, setLocation] = useState(catalog.locations[0].slug);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [occupancy, setOccupancy] = useState<OccupancyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [busy, setBusy] = useState(false);

  const date = pickedDate ?? (now > 0 ? todayIn("Europe/Berlin", new Date(now)) : null);

  // useEffect: Daten laden – bei neuer Version, anderem Tag/Standort oder "Aktualisieren"
  useEffect(() => {
    if (!date) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const [b, s, o] = await Promise.all([
          api.admin.bookings(controller.signal),
          api.admin.stats(date, controller.signal),
          api.admin.occupancy(location, date, controller.signal),
        ]);
        setBookings(b.bookings);
        setStats(s);
        setOccupancy(o);
        setError(null);
      } catch (e) {
        if (controller.signal.aborted) return;
        const err = asApiError(e);
        if (err.code === "UNAUTHORIZED") onLoggedOut();
        else setError(errorMessage(err.code, err.message));
      }
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [version, date, location, nonce, onLoggedOut]);

  async function runDialogAction() {
    if (!dialog) return;
    setBusy(true);
    try {
      if (dialog.kind === "cancel") await api.admin.cancel(dialog.booking.id);
      else await api.admin.reset();
      setDialog(null);
      setNonce((n) => n + 1);
    } catch (e) {
      const err = asApiError(e);
      setError(errorMessage(err.code, err.message));
      setDialog(null);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await api.admin.logout().catch(() => undefined);
    onLoggedOut();
  }

  const controlClass = "inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold hover:border-accent";

  return (
    <div className={presentation ? "text-lg" : ""}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LiveBadge status={status} />
          <span className="text-sm text-muted">Demo-Daten · Die Website wird nach der Präsentation offline genommen.</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setPresentation((p) => !p)} aria-pressed={presentation} className={controlClass}>
            {presentation ? <Minimize2 aria-hidden="true" className="size-4" /> : <Maximize2 aria-hidden="true" className="size-4" />}
            Präsentationsmodus
          </button>
          {!presentation && (
            <>
              <button type="button" onClick={() => setNonce((n) => n + 1)} className={controlClass}>
                <RefreshCw aria-hidden="true" className="size-4" /> Aktualisieren
              </button>
              <button type="button" onClick={() => setDialog({ kind: "reset" })} className={`${controlClass} text-accent`}>
                <Trash2 aria-hidden="true" className="size-4" /> Alle Testdaten zurücksetzen
              </button>
              <button type="button" onClick={() => void logout()} className={controlClass}>
                <LogOut aria-hidden="true" className="size-4" /> Abmelden
              </button>
            </>
          )}
        </div>
      </div>

      {!presentation && (
        <nav aria-label="Bereiche der Verwaltung" className="mt-6 flex flex-wrap gap-2 text-sm">
          <a href="#kennzahlen" className="min-h-11 rounded-full bg-surface px-4 py-3 font-medium">Kennzahlen</a>
          <a href="#belegung" className="min-h-11 rounded-full bg-surface px-4 py-3 font-medium">Belegungsplan</a>
          <a href="#buchungen" className="min-h-11 rounded-full bg-surface px-4 py-3 font-medium">Alle Buchungen</a>
          <a href="#event-buchungen" className="min-h-11 rounded-full bg-surface px-4 py-3 font-medium">Event-Buchungen</a>
        </nav>
      )}

      {error && <p role="alert" className="mt-6 rounded-2xl bg-accent/10 p-4 font-medium text-accent">{error}</p>}

      <section id="kennzahlen" aria-label="Kennzahlen" className="mt-8 scroll-mt-24">
        <StatsBar stats={stats} />
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <section id="belegung" aria-labelledby="occupancy-title" className="min-w-0 scroll-mt-24 rounded-3xl border border-line bg-card p-6 shadow-soft">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="occupancy-title" className="text-xl font-semibold tracking-tight">Belegungsplan</h2>
            <div className="flex flex-wrap gap-2">
              <label>
                <span className="sr-only">Standort</span>
                <select value={location} onChange={(e) => setLocation(e.target.value)} className="min-h-11 rounded-2xl border border-line bg-background px-3 text-sm">
                  {catalog.locations.map((l) => <option key={l.slug} value={l.slug}>{l.city}</option>)}
                </select>
              </label>
              <label>
                <span className="sr-only">Tag</span>
                <input type="date" value={date ?? ""} onChange={(e) => setPickedDate(e.target.value || null)} className="min-h-11 rounded-2xl border border-line bg-background px-3 text-sm" />
              </label>
            </div>
          </div>
          <OccupancyGrid data={occupancy && occupancy.location === location && occupancy.date === date ? occupancy : null} />
        </section>
        <LiveFeed bookings={bookings} />
      </div>

      <div id="buchungen" className="mt-8 scroll-mt-24">
        <BookingsTable bookings={bookings} presentation={presentation} onCancel={(booking) => setDialog({ kind: "cancel", booking })} />
      </div>

      <ConfirmDialog
        open={dialog !== null}
        title={dialog?.kind === "reset" ? "Alle Testdaten zurücksetzen?" : "Buchung stornieren?"}
        text={
          dialog?.kind === "cancel"
            ? `${dialog.booking.code} · ${dialog.booking.fullName} · ${dialog.booking.city}, ${dialog.booking.courtName}, ${dialog.booking.dateShort} ${dialog.booking.time}. Der Slot wird sofort für alle wieder frei.`
            : "Löscht ALLE Buchungen, Reservierungen und Sperren. Standorte und Courts bleiben erhalten. Das kann nicht rückgängig gemacht werden."
        }
        confirmLabel={dialog?.kind === "reset" ? "Alles löschen" : "Stornieren"}
        requireText={dialog?.kind === "reset" ? "RESET" : undefined}
        busy={busy}
        onConfirm={() => void runDialogAction()}
        onClose={() => setDialog(null)}
      />
    </div>
  );
}