import Phaser from "phaser";
import {
  BIBI_SLEEP_FRAMES,
  COLORS,
  LAYOUT,
  NARRATIVE_TIMING,
  PHASE_TIMING,
  SceneKeys,
  type ObjectKind,
  type PhaseId,
} from "../config";
import { beginQuoteSession, hasMoreStirQuotes, nextStirQuote } from "../content/quotes";
import { strings } from "../content/strings.he";
import { maybeOverloadCluster, playTick, resetAudioSession, silenceAudio } from "../systems/audioTick";
import { startBackgroundMusic } from "../systems/music";
import { loadSettings } from "../systems/settings";
import { PhaseMachine } from "../systems/phaseMachine";
import { createActiveObject, type ActiveObject } from "../systems/playObject";
import { Score } from "../systems/score";
import { saveSession } from "../systems/session";
import {
  driftPxPerSec,
  lifetimeMs,
  maxOnScreen,
  pickFreeSlots,
  pickKind,
  spawnIntervalMs,
} from "../systems/spawner";
import { showBanner, showClickableQuote } from "../ui/banner";
import { startBibiFrames, stopBibiFrames } from "../ui/bibi";
import { addBedroom } from "../ui/narrative";
import { Hud, showMissToast } from "../ui/hud";

export class PlayScene extends Phaser.Scene {
  readonly score = new Score();
  readonly machine = new PhaseMachine();
  readonly objects: ActiveObject[] = [];

  private hud!: Hud;
  private bibi!: Phaser.GameObjects.Image;
  private nextSpawnAt = 0;
  private caughtKinds: ObjectKind[] = [];
  private frozen = false;
  private stirring = false;
  private stirPausedAt = 0;
  private sleepAnim?: Phaser.Time.TimerEvent;
  private stirLoop?: Phaser.Time.TimerEvent;
  private endAfterLastQuote?: Phaser.Time.TimerEvent;
  private stirBanner?: Phaser.GameObjects.Container;

  constructor() {
    super(SceneKeys.Play);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.linen);
    this.score.caught = 0;
    this.score.spawned = 0;
    this.score.missed = 0;
    this.objects.length = 0;
    this.caughtKinds = [];
    this.frozen = false;
    this.stirring = false;
    this.time.paused = false;
    this.stirBanner?.destroy();
    this.stirBanner = undefined;
    resetAudioSession();
    startBackgroundMusic();
    this.machine.start(this.time.now);
    this.nextSpawnAt = this.time.now + PHASE_TIMING.firstSpawnDelay;
    beginQuoteSession();

    this.bibi = addBedroom(this, "bibi_sleep_idle");
    this.startSleeping();
    this.startStirLoop();

    this.hud = new Hud(this, this.score.hudLabel);
  }

  update(_time: number, delta: number): void {
    if (this.frozen || this.stirring) {
      return;
    }

    const now = this.time.now;
    this.applyPhase(this.machine.tick(now));
    maybeOverloadCluster(this.machine.phase, now, this.machine.enteredAt);
    this.advanceObjects(delta, now);
    this.trySpawn(now);
  }

  private advanceObjects(delta: number, now: number): void {
    const expired: ActiveObject[] = [];
    for (const object of this.objects) {
      object.view.y += object.drift * (delta / 1000);
      if (now - object.bornAt >= object.lifetimeMs || object.view.y >= LAYOUT.missLineY) {
        expired.push(object);
      }
    }
    for (const object of expired) {
      this.resolve(object, object.silentExpire ? "silent" : "miss");
    }
  }

  private trySpawn(now: number): void {
    if (now < this.nextSpawnAt || this.machine.phase === "freeze") {
      return;
    }

    const cap = maxOnScreen(this.machine.phase, now, this.machine.enteredAt);
    if (this.objects.length >= cap) {
      return;
    }

    if (!this.spawnOne(now, pickKind(this.machine.phase))) {
      return;
    }

    this.nextSpawnAt = now + spawnIntervalMs(this.machine.phase);
  }

  private spawnOne(now: number, kind: ObjectKind): boolean {
    const [slot] = pickFreeSlots(
      this.objects.map((object) => object.slot),
      1,
    );
    if (slot === undefined) {
      return false;
    }
    this.addObject(kind, slot, now);
    return true;
  }

  private addObject(kind: ObjectKind, slot: number, now: number): void {
    const object = createActiveObject(
      this,
      kind,
      slot,
      now,
      lifetimeMs(this.machine.phase),
      driftPxPerSec(this.machine.phase),
    );
    object.view.on("pointerdown", () => {
      if (this.stirring) {
        return;
      }
      this.resolve(object, "catch");
    });
    this.objects.push(object);
    this.score.spawn();
    this.hud.setCounter(this.score.hudLabel);
  }

  private resolve(object: ActiveObject, reason: "catch" | "miss" | "silent"): void {
    const index = this.objects.indexOf(object);
    if (index < 0) {
      return;
    }
    this.objects.splice(index, 1);
    object.view.destroy();

    if (reason === "catch") {
      playTick(this.machine.phase);
      this.caughtKinds.push(object.kind);
      this.score.catch();
      this.hud.setCounter(this.score.hudLabel);
      this.applyPhase(this.machine.onCatch(this.score.caught, this.time.now));
    } else if (reason === "miss") {
      this.score.miss();
      this.hud.setCounter(this.score.hudLabel);
      showMissToast(this);
      this.applyPhase(this.machine.onMiss(this.time.now));
    }
  }

  private applyPhase(next: PhaseId | null): void {
    if (!next) {
      return;
    }
    if (next === "stir") {
      this.playVisualStir();
    } else if (next === "too_much") {
      showBanner(this, strings.tooMuch);
    } else if (next === "freeze") {
      this.goToFreeze();
    }
  }

  private startSleeping(): void {
    stopBibiFrames(this.sleepAnim);
    this.sleepAnim = undefined;
    if (loadSettings().reduceSensoryIntensity) {
      this.bibi.setTexture("bibi_sleep_idle");
      return;
    }
    this.sleepAnim = startBibiFrames(
      this,
      this.bibi,
      BIBI_SLEEP_FRAMES,
      NARRATIVE_TIMING.bibiSleepFrameMs,
    );
  }

  private startStirLoop(): void {
    this.stirLoop?.remove(false);
    this.stirLoop = this.time.addEvent({
      delay: NARRATIVE_TIMING.bibiStirEveryMs,
      loop: true,
      callback: () => {
        this.playVisualStir();
      },
    });
  }

  private playVisualStir(): void {
    if (this.frozen || this.stirring || !this.bibi.active) {
      return;
    }
    if (loadSettings().reduceSensoryIntensity) {
      return;
    }
    this.stirring = true;
    this.stirPausedAt = this.time.now;
    this.time.paused = true;
    stopBibiFrames(this.sleepAnim);
    this.sleepAnim = undefined;
    this.bibi.setTexture("bibi_sleep_stir");
    this.stirBanner?.destroy();
    const quote = nextStirQuote();
    if (!quote) {
      this.goToFreeze();
      return;
    }
    const lastQuote = !hasMoreStirQuotes();
    if (lastQuote) {
      this.stirLoop?.remove(false);
      this.stirLoop = undefined;
      this.endAfterLastQuote?.remove(false);
      this.endAfterLastQuote = this.time.delayedCall(NARRATIVE_TIMING.bibiStirEveryMs, () => {
        if (!this.frozen) {
          this.goToFreeze();
        }
      });
    }
    this.stirBanner = showClickableQuote(this, quote, () => {
      this.resumeFromStir();
    });
  }

  private resumeFromStir(): void {
    this.stirBanner = undefined;
    if (this.frozen) {
      return;
    }
    const pauseMs = this.time.now - this.stirPausedAt;
    this.machine.enteredAt += pauseMs;
    this.nextSpawnAt += pauseMs;
    for (const object of this.objects) {
      object.bornAt += pauseMs;
    }
    this.stirring = false;
    this.time.paused = false;
    if (this.bibi.active) {
      this.startSleeping();
    }
  }

  private goToFreeze(): void {
    this.frozen = true;
    this.stirring = false;
    this.time.paused = false;
    this.stirBanner?.destroy();
    this.stirBanner = undefined;
    this.stirLoop?.remove(false);
    this.stirLoop = undefined;
    this.endAfterLastQuote?.remove(false);
    this.endAfterLastQuote = undefined;
    stopBibiFrames(this.sleepAnim);
    this.sleepAnim = undefined;
    this.tweens.killTweensOf(this.bibi);
    this.bibi.setScale(1);
    this.bibi.setAngle(0);
    this.bibi.setTexture("bibi_wake");
    silenceAudio();
    saveSession(this, {
      caught: this.score.caught,
      spawned: this.score.spawned,
      missed: this.score.missed,
      caughtKinds: [...this.caughtKinds],
    });
    this.scene.pause();
    this.scene.launch(SceneKeys.Freeze);
  }

  getBibi(): Phaser.GameObjects.Image {
    return this.bibi;
  }
}
