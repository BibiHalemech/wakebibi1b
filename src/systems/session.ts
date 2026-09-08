import type Phaser from "phaser";
import { KIND_ASSET, type ObjectKind } from "../config";

export const SESSION_SCORE_KEY = "sessionScore";

export type SessionScore = {
  caught: number;
  spawned: number;
  missed: number;
  caughtKinds: ObjectKind[];
};

export function emptySession(): SessionScore {
  return { caught: 0, spawned: 0, missed: 0, caughtKinds: [] };
}

export function saveSession(scene: Phaser.Scene, score: SessionScore): void {
  scene.game.registry.set(SESSION_SCORE_KEY, score);
}

export function loadSession(scene: Phaser.Scene): SessionScore {
  const stored = scene.game.registry.get(SESSION_SCORE_KEY) as SessionScore | undefined;
  if (!stored || typeof stored.caught !== "number" || typeof stored.spawned !== "number") {
    return emptySession();
  }
  return {
    caught: stored.caught,
    spawned: stored.spawned,
    missed: stored.missed ?? 0,
    caughtKinds: Array.isArray(stored.caughtKinds) ? stored.caughtKinds : [],
  };
}

export function pileTexture(kind: ObjectKind): string {
  if (kind === "quote") {
    return "obj_alert";
  }
  if (kind === "contradict_stay" || kind === "contradict_leave") {
    return "obj_command";
  }
  return KIND_ASSET[kind];
}
