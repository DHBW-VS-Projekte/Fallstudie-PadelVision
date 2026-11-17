import type { LiveStatus } from "@/components/booking/usePolling";

export default function LiveBadge({ status }: { status: LiveStatus }) {
  const live = status === "live";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${live ? "bg-accent-2/12 text-accent-2" : "bg-accent/12 text-accent"}`}
    >
      <span
        aria-hidden="true"
        className={`size-2 rounded-full ${live ? "live-dot bg-accent-2" : "bg-accent"}`}
      />
      {status === "live"
        ? "Live"
        : status === "connecting"
          ? "Verbinde …"
          : "Verbindung wird wiederhergestellt …"}
    </span>
  );
}