import Phaser from "phaser";
import { BIBI_WAKE_FRAMES, NARRATIVE_TIMING, SceneKeys } from "../config";
import { strings } from "../content/strings.he";
import { silenceAudio } from "../systems/audioTick";
import { startBibiFrames } from "../ui/bibi";
import {
  addBedroom,
  addNarrativeText,
  addVignette,
  fadeIn,
  linenBackground,
  playIsOnScreen,
} from "../ui/narrative";
import { PlayScene } from "./PlayScene";

export class FreezeScene extends Phaser.Scene {
  private advanced = false;

  constructor() {
    super(SceneKeys.Freeze);
  }

  create(): void {
    this.advanced = false;
    silenceAudio();

    let bibi: Phaser.GameObjects.Image;
    if (playIsOnScreen(this)) {
      this.cameras.main.setBackgroundColor("rgba(0,0,0,0)");
      bibi = (this.scene.get(SceneKeys.Play) as PlayScene).getBibi();
    } else {
      linenBackground(this);
      bibi = addBedroom(this, "bibi_wake");
    }

    startBibiFrames(this, bibi, BIBI_WAKE_FRAMES, NARRATIVE_TIMING.bibiLookFrameMs);
    addVignette(this);

    this.time.delayedCall(NARRATIVE_TIMING.freezeWakeMs, () => this.showFreezeLines());
  }

  private showFreezeLines(): void {
    if (!this.sys.isActive()) {
      return;
    }

    const line1 = addNarrativeText(this, 480, strings.freeze1);
    fadeIn(this, line1);

    this.time.delayedCall(NARRATIVE_TIMING.freezeLine1Ms, () => {
      if (!this.sys.isActive()) {
        return;
      }
      const line2 = addNarrativeText(this, 640, strings.freeze2);
      fadeIn(this, line2);
      this.time.delayedCall(NARRATIVE_TIMING.freezeLine2Ms, () => this.showCalmLine());
    });
  }

  private showCalmLine(): void {
    if (!this.sys.isActive() || this.advanced) {
      return;
    }
    const calm = addNarrativeText(this, 800, strings.calmVoice, {
      size: "36px",
      color: "#5E6A73",
    });
    fadeIn(this, calm);
    this.time.delayedCall(NARRATIVE_TIMING.freezeCalmMs, () => this.goTwist());
  }

  private goTwist(): void {
    if (this.advanced) {
      return;
    }
    this.advanced = true;
    this.scene.stop(SceneKeys.Play);
    this.scene.start(SceneKeys.Twist);
  }
}
