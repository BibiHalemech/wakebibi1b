import Phaser from "phaser";
import { COLORS, FONT_FAMILY, STAGE_HEIGHT, STAGE_WIDTH } from "../config";

type StubConfig = {
  key: string;
  label: string;
};

export class StubScene extends Phaser.Scene {
  private readonly label: string;

  constructor(config: StubConfig) {
    super(config.key);
    this.label = config.label;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.linen);
    this.add
      .text(STAGE_WIDTH / 2, STAGE_HEIGHT / 2, this.label, {
        fontFamily: FONT_FAMILY,
        fontSize: "56px",
        fontStyle: "500",
        color: "#5E6A73",
        rtl: true,
      })
      .setOrigin(0.5);
  }
}
