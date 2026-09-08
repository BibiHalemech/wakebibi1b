import Phaser from "phaser";
import { FONT_FAMILY, STAGE_WIDTH } from "../config";
import { strings } from "../content/strings.he";

export class Hud {
  private readonly counter: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, initial: string) {
    scene.add
      .text(STAGE_WIDTH / 2, 72, strings.hudWake, {
        fontFamily: FONT_FAMILY,
        fontSize: "48px",
        fontStyle: "700",
        color: "#2C2A26",
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.counter = scene.add
      .text(STAGE_WIDTH / 2, 150, initial, {
        fontFamily: FONT_FAMILY,
        fontSize: "40px",
        fontStyle: "500",
        color: "#5E6A73",
      })
      .setOrigin(0.5)
      .setDepth(20);
  }

  setCounter(label: string): void {
    this.counter.setText(label);
  }
}

export function showMissToast(scene: Phaser.Scene): void {
  const toast = scene.add
    .text(STAGE_WIDTH / 2, 1760, strings.miss, {
      fontFamily: FONT_FAMILY,
      fontSize: "36px",
      fontStyle: "500",
      color: "#7A5A4A",
      backgroundColor: "#FFF8EE",
      padding: { x: 28, y: 12 },
      rtl: true,
    })
    .setOrigin(0.5)
    .setDepth(30)
    .setAlpha(0);

  scene.tweens.add({
    targets: toast,
    alpha: 1,
    duration: 140,
    hold: 700,
    yoyo: true,
    onComplete: () => {
      toast.destroy();
    },
  });
}
