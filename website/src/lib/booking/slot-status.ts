import type { ApiSlot, SlotStatus } from "./types";

export function effectiveSlotStatus(
  slot: Pick<ApiSlot, "status" | "expiresAt">,
  isMyHold: boolean,
  now: number,
  serverClockSkew: number,
): SlotStatus {
  if (slot.status === "booked") return "booked";
  if (isMyHold) return "mine";

  const expired = slot.expiresAt !== null && Date.parse(slot.expiresAt) <= now + serverClockSkew;
  if ((slot.status === "held" || slot.status === "mine") && !expired) return "held";
  return "free";
}
