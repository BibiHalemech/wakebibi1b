import Phaser from "phaser";
import { BIBI_LOOK_FRAMES, LAYOUT, NARRATIVE_TIMING, STAGE_WIDTH, SceneKeys, type ObjectKind } from "../config";
import { strings } from "../content/strings.he";
import { loadSession, pileTexture } from "../systems/session";
import { startBibiFrames } from "../ui/bibi";
import { addPillButton } from "../ui/button";
import { addBedroom, addNarrativeText, fadeIn, fadeOut, linenBackground } from "../ui/narrative";

const PILE_CAP = 20;

export class EndingScene extends Phaser.Scene {
  private bibi!: Phaser.GameObjects.Image;
  private advanced = false;

  constructor() {
    super(SceneKeys.Ending);
  }

  create(): void {
    this.advanced = false;
    linenBackground(this);
    this.bibi = addBedroom(this, "bibi_wake");

    const session = loadSession(this);
    this.time.delayedCall(NARRATIVE_TIMING.endingWakeMs, () => {
      if (!this.sys.isActive()) {
        return;
      }
      startBibiFrames(this, this.bibi, BIBI_LOOK_FRAMES, NARRATIVE_TIMING.bibiLookFrameMs);
      this.addCaughtFan(session.caughtKinds);
      this.time.delayedCall(NARRATIVE_TIMING.endingLookMs, () => this.playScoreRitual(session));
    });
  }

  private addCaughtFan(kinds: ObjectKind[]): void {
    const shown = kinds.slice(0, PILE_CAP);
    const count = shown.length;
    if (count === 0) {
      return;
    }

    shown.forEach((kind, index) => {
      const t = count === 1 ? 0.5 : index / (count - 1);
      const x = 200 + t * 680;
      const y = LAYOUT.bibiY - 20 + Math.sin(t * Math.PI) * -90 + (index % 3) * 26;
      const icon = this.add.image(x, y, pileTexture(kind));
      icon.setScale(0.7);
      icon.setAngle(-12 + (index % 5) * 6);
      icon.setDepth(1.5);
      fadeIn(this, icon, 420);
    });
  }

  private playScoreRitual(session: { caught: number; spawned: number }): void {
    if (!this.sys.isActive()) {
      return;
    }

    const ask = addNarrativeText(this, 1480, strings.endingAsk, { size: "40px" });
    fadeIn(this, ask);

    this.time.delayedCall(NARRATIVE_TIMING.endingAskMs, () => {
      if (!this.sys.isActive()) {
        return;
      }
      const score = addNarrativeText(
        this,
        1620,
        `${session.caught} / ${session.spawned}`,
        { size: "64px", color: "#5E6A73" },
      );
      fadeIn(this, score);

      this.time.delayedCall(NARRATIVE_TIMING.endingScoreMs, () => {
        if (!this.sys.isActive()) {
          return;
        }
        fadeOut(this, [ask, score], 280, () => this.afterWipe());
      });
    });
  }

  private afterWipe(): void {
    if (!this.sys.isActive()) {
      return;
    }
    const notTest = addNarrativeText(this, 1500, strings.notTheTest);
    fadeIn(this, notTest);

    this.time.delayedCall(NARRATIVE_TIMING.endingNotTheTestMs, () => {
      if (!this.sys.isActive()) {
        return;
      }
      const test = addNarrativeText(this, 1660, strings.theTest, { size: "36px" });
      fadeIn(this, test);
      this.time.delayedCall(NARRATIVE_TIMING.endingLastLineMs, () => this.showPlayAgain());
    });
  }

  private showPlayAgain(): void {
    if (this.advanced || !this.sys.isActive()) {
      return;
    }
    this.advanced = true;
    const again = addPillButton(this, {
      label: strings.playAgain,
      x: STAGE_WIDTH / 2,
      y: 1780,
      onClick: () => {
        this.scene.start(SceneKeys.Title);
      },
    });
    again.setAlpha(0);
    this.tweens.add({ targets: again, alpha: 1, duration: 320 });
  }
}
