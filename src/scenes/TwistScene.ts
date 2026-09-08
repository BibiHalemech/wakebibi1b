import Phaser from "phaser";
import { BIBI_LOOK_FRAMES, FONT_FAMILY, NARRATIVE_TIMING, STAGE_WIDTH, SceneKeys } from "../config";
import { strings } from "../content/strings.he";
import { startBibiFrames } from "../ui/bibi";
import {
  addBedroom,
  addNarrativeText,
  fadeIn,
  linenBackground,
} from "../ui/narrative";

export class TwistScene extends Phaser.Scene {
  private firstTapDone = false;
  private canAdvance = false;
  private advanced = false;

  constructor() {
    super(SceneKeys.Twist);
  }

  create(): void {
    this.firstTapDone = false;
    this.canAdvance = false;
    this.advanced = false;

    linenBackground(this);
    const bibi = addBedroom(this, "bibi_wake");
    startBibiFrames(this, bibi, BIBI_LOOK_FRAMES, NARRATIVE_TIMING.bibiLookFrameMs);

    const plate = this.add.image(STAGE_WIDTH / 2, 560, "card_premade_decision");
    const title = this.add
      .text(STAGE_WIDTH / 2, 560, strings.twistObject, {
        fontFamily: FONT_FAMILY,
        fontSize: "40px",
        fontStyle: "700",
        color: "#2C2A26",
        align: "center",
        rtl: true,
        wordWrap: { width: 560 },
      })
      .setOrigin(0.5);

    const hit = this.add
      .rectangle(STAGE_WIDTH / 2, 560, plate.width, plate.height, 0, 0)
      .setInteractive({ useHandCursor: true });

    const card = this.add.container(0, 0, [plate, title, hit]);
    card.setDepth(10);

    hit.on("pointerdown", () => {
      this.onObjectTap();
    });

    this.input.on("pointerdown", () => {
      if (this.canAdvance) {
        this.goEnding();
      }
    });
  }

  private onObjectTap(): void {
    if (this.advanced) {
      return;
    }
    if (this.firstTapDone) {
      if (this.canAdvance) {
        this.goEnding();
      }
      return;
    }

    this.firstTapDone = true;
    const line = addNarrativeText(this, 860, strings.twistResult);
    fadeIn(this, line);
    this.time.delayedCall(180, () => {
      this.canAdvance = true;
    });
    this.time.delayedCall(NARRATIVE_TIMING.twistAdvanceMs, () => this.goEnding());
  }

  private goEnding(): void {
    if (this.advanced) {
      return;
    }
    this.advanced = true;
    this.scene.start(SceneKeys.Ending);
  }
}
