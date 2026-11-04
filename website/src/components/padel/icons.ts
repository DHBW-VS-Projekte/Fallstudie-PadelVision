/**
 * icons.ts – löst die Icon-Schlüssel aus padelContent.ts in lucide-Icons auf
 * Kein "use client" nötig: reine Zuordnung, nutzbar in Server- und Client-Components.
 * Record<IconKey, LucideIcon> sorgt dafür, dass TypeScript meckert, wenn ein
 * Schlüssel fehlt oder ein Tippfehler drin ist.
 */
import {
  ArrowDown, CircleDot, Footprints, Hand, Layers, Move, RotateCcw,
  Ruler, ShieldCheck, Shirt, Target, Users, Zap, type LucideIcon,
} from "lucide-react";
import type { IconKey } from "@/components/padel/padelContent";

export const iconMap: Record<IconKey, LucideIcon> = {
  users: Users,
  ruler: Ruler,
  layers: Layers,
  zap: Zap,
  racket: Target,
  ball: CircleDot,
  shoe: Shirt,
  arrowDown: ArrowDown,
  footprints: Footprints,
  hand: Hand,
  move: Move,
  shield: ShieldCheck,
  rotate: RotateCcw,
};