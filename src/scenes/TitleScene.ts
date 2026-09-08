import Phaser from "phaser";
import { COLORS, FONT_FAMILY, STAGE_WIDTH, SceneKeys } from "../config";
import { strings } from "../content/strings.he";
import { startBackgroundMusic } from "../systems/music";
import { addPillButton } from "../ui/button";
import { addNarrativeText, addSceneBackdrop } from "../ui/narrative";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Title);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.linen);
    addSceneBackdrop(this, "bg_title");

    this.add
      .text(STAGE_WIDTH / 2, 480, strings.titleDate, {
        fontFamily: FONT_FAMILY,
        fontSize: "96px",
        fontStyle: "700",
        color: "#2C2A26",
      })
      .setOrigin(0.5);

    addNarrativeText(this, 720, strings.title, { size: "40px", width: 880 });

    addPillButton(this, {
      label: strings.start,
      x: STAGE_WIDTH / 2,
      y: 1200,
      onClick: () => {
        startBackgroundMusic();
        this.scene.start(SceneKeys.Play);
      },
    });
  }
}
