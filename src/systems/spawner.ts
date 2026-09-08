import {
  GENERIC_KINDS,
  ICON_KINDS,
  PHASES,
  PHASE_TIMING,
  REDUCE,
  RING_SLOTS,
  type IconKind,
  type ObjectKind,
  type PhaseId,
} from "../config";
import { loadSettings } from "./settings";

export function pickFreeSlots(occupied: Iterable<number>, count: number): number[] {
  const taken = new Set(occupied);
  const free = RING_SLOTS.map((_, index) => index).filter((index) => !taken.has(index));
  const picked: number[] = [];
  while (picked.length < count && free.length > 0) {
    const at = Math.floor(Math.random() * free.length);
    picked.push(free.splice(at, 1)[0]);
  }
  return picked;
}

export function pickIcon(): IconKind {
  return ICON_KINDS[Math.floor(Math.random() * ICON_KINDS.length)];
}

export function pickKind(phase: PhaseId): ObjectKind {
  if (phase === "quotes") {
    if (loadSettings().noPoliticalQuotes) {
      return GENERIC_KINDS[Math.floor(Math.random() * GENERIC_KINDS.length)];
    }
    if (Math.random() < 0.5) {
      return "quote";
    }
  }
  return pickIcon();
}

export function spawnIntervalMs(phase: PhaseId): number {
  if (phase === "freeze") {
    return 10_000;
  }
  const [min, max] = tableFor(phase).spawnInterval;
  const raw = PhaserMathBetween(min, max);
  if (loadSettings().reduceSensoryIntensity) {
    return Math.round(raw * REDUCE.spawnScale);
  }
  return raw;
}

export function lifetimeMs(phase: PhaseId): number {
  if (phase === "freeze") {
    return 0;
  }
  const [min, max] = tableFor(phase).lifetimeMs;
  return PhaserMathBetween(min, max);
}

export function driftPxPerSec(phase: PhaseId): number {
  if (phase === "freeze") {
    return 0;
  }
  const drift = tableFor(phase).driftPxPerSec;
  if (loadSettings().reduceSensoryIntensity) {
    return Math.min(drift, REDUCE.driftCap);
  }
  return drift;
}

export function maxOnScreen(phase: PhaseId, now: number, enteredAt: number): number {
  if (phase === "freeze") {
    return 0;
  }
  if (phase === "overload") {
    const reduce = loadSettings().reduceSensoryIntensity;
    const start = reduce ? REDUCE.overloadStartMax : PHASE_TIMING.overloadStartMax;
    const end = reduce ? REDUCE.overloadMax : PHASES.overload.maxOnScreen;
    return now - enteredAt >= PHASE_TIMING.overloadRampMs ? end : start;
  }
  return PHASES[phase].maxOnScreen;
}

function tableFor(phase: Exclude<PhaseId, "freeze">) {
  if (phase === "overload" && loadSettings().reduceSensoryIntensity) {
    return PHASES.busy;
  }
  return PHASES[phase];
}

function PhaserMathBetween(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
