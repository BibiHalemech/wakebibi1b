export const STAGE_WIDTH = 1080;
export const STAGE_HEIGHT = 1920;

export const COLORS = {
  linen: 0xf3eee4,
  paper: 0xfff8ee,
  charcoal: 0x2c2a26,
  slate: 0x5e6a73,
  tealDust: 0x6e8b86,
} as const;

export const LAYOUT = {
  hudBottom: 220,
  bedX: STAGE_WIDTH / 2,
  bedY: 980,
  bibiY: 900,
  nightstandLX: 130,
  nightstandRX: 950,
  nightstandY: 1140,
  missLineY: 1840,
  beatY: 560,
} as const;

/** 12 slots around the bed — never on the face. */
export const RING_SLOTS: readonly { x: number; y: number }[] = [
  { x: 180, y: 300 },
  { x: 540, y: 260 },
  { x: 900, y: 300 },
  { x: 120, y: 520 },
  { x: 960, y: 520 },
  { x: 120, y: 820 },
  { x: 960, y: 820 },
  { x: 120, y: 1120 },
  { x: 960, y: 1120 },
  { x: 240, y: 1480 },
  { x: 540, y: 1560 },
  { x: 840, y: 1480 },
];

export type PhaseId =
  | "easy"
  | "stir"
  | "busy"
  | "too_much"
  | "contradict"
  | "quotes"
  | "overload"
  | "freeze";

export type IconKind = "phone" | "alert" | "report" | "alarm" | "command" | "message";
export type ObjectKind = IconKind | "quote" | "contradict_stay" | "contradict_leave";

export const ICON_KINDS: readonly IconKind[] = ["phone", "alert", "report", "alarm", "command"];

/** Generic stand-ins when “No political quotes” is on. */
export const GENERIC_KINDS: readonly IconKind[] = ["alert", "report", "command", "message"];

export const KIND_ASSET: Record<ObjectKind, string> = {
  phone: "obj_phone",
  alert: "obj_alert",
  report: "obj_report",
  alarm: "obj_alarm",
  command: "obj_command",
  message: "obj_message",
  quote: "card_quote",
  contradict_stay: "card_command",
  contradict_leave: "card_command",
};

type PhaseTable = {
  maxOnScreen: number;
  spawnInterval: readonly [number, number];
  lifetimeMs: readonly [number, number];
  driftPxPerSec: number;
};

export const PHASES: Record<Exclude<PhaseId, "freeze">, PhaseTable> = {
  easy: { maxOnScreen: 1, spawnInterval: [1400, 1800], lifetimeMs: [4500, 4500], driftPxPerSec: 90 },
  stir: { maxOnScreen: 1, spawnInterval: [1400, 1800], lifetimeMs: [4500, 4500], driftPxPerSec: 90 },
  busy: { maxOnScreen: 3, spawnInterval: [700, 900], lifetimeMs: [3200, 3200], driftPxPerSec: 120 },
  too_much: { maxOnScreen: 3, spawnInterval: [700, 900], lifetimeMs: [3200, 3200], driftPxPerSec: 120 },
  contradict: { maxOnScreen: 2, spawnInterval: [1600, 1600], lifetimeMs: [4000, 4000], driftPxPerSec: 80 },
  quotes: { maxOnScreen: 4, spawnInterval: [800, 1100], lifetimeMs: [3500, 3500], driftPxPerSec: 100 },
  overload: { maxOnScreen: 12, spawnInterval: [220, 350], lifetimeMs: [1600, 2000], driftPxPerSec: 180 },
};

export const PHASE_TIMING = {
  firstSpawnDelay: 500,
  catchesToStir: 10,
  stirHoldMs: 8000,
  missesToTooMuch: 4,
  busyMaxMs: 20000,
  tooMuchHoldMs: 6000,
  pairsToQuotes: 3,
  quotesWindowMs: 25000,
  overloadRampMs: 8000,
  overloadStartMax: 8,
  overloadMs: 20000,
} as const;

export const NARRATIVE_TIMING = {
  freezeWakeMs: 1600,
  freezeLine1Ms: 2200,
  freezeLine2Ms: 2400,
  freezeCalmMs: 2200,
  twistAdvanceMs: 2000,
  endingWakeMs: 1400,
  endingLookMs: 1200,
  endingAskMs: 1600,
  endingScoreMs: 1600,
  endingNotTheTestMs: 1200,
  endingLastLineMs: 2400,
  bibiSleepFrameMs: 800,
  bibiLookFrameMs: 900,
  bibiStirHoldMs: 900,
  bibiStirEveryMs: 10000,
} as const;

export const BIBI_SLEEP_FRAMES = ["bibi_sleep_idle", "bibi_sleep_2"] as const;
export const BIBI_WAKE_FRAMES = ["bibi_wake", "bibi_look_2", "bibi_look"] as const;
export const BIBI_LOOK_FRAMES = ["bibi_look_2", "bibi_look"] as const;

export const REDUCE = {
  driftCap: 110,
  spawnScale: 1.25,
  overloadStartMax: 5,
  overloadMax: 6,
} as const;

export const AUDIO = {
  clusterMs: 1800,
  clusterBeeps: 16,
} as const;

export const FONT_FAMILY = "Heebo, Assistant, Arial, sans-serif";

export const SceneKeys = {
  Boot: "Boot",
  Title: "Title",
  Play: "Play",
  Freeze: "Freeze",
  Twist: "Twist",
  Ending: "Ending",
} as const;

export type SceneKey = (typeof SceneKeys)[keyof typeof SceneKeys];
