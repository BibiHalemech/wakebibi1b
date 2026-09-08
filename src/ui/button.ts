import Phaser from "phaser";
import { COLORS, FONT_FAMILY } from "../config";

const BUTTON_WIDTH = 420;
const BUTTON_HEIGHT = 96;
const BUTTON_RADIUS = 48;

type PillButtonOptions = {
  label: string;
  x: number;
  y: number;
  onClick?: () => void;
};

export function addPillButton(
  scene: Phaser.Scene,
  options: PillButtonOptions,
): Phaser.GameObjects.Container {
  const { label, x, y, onClick } = options;

  const background = scene.add.graphics();
  background.fillStyle(COLORS.charcoal, 1);
  background.fillRoundedRect(
    -BUTTON_WIDTH / 2,
    -BUTTON_HEIGHT / 2,
    BUTTON_WIDTH,
    BUTTON_HEIGHT,
    BUTTON_RADIUS,
  );

  const text = scene.add
    .text(0, 0, label, {
      fontFamily: FONT_FAMILY,
      fontSize: "40px",
      fontStyle: "700",
      color: "#FFF8EE",
      rtl: true,
    })
    .setOrigin(0.5);

  const hit = scene.add
    .rectangle(0, 0, BUTTON_WIDTH, BUTTON_HEIGHT, COLORS.charcoal, 0)
    .setInteractive({ useHandCursor: Boolean(onClick) });

  const container = scene.add.container(x, y, [background, text, hit]);

  if (onClick) {
    hit.on("pointerdown", () => {
      container.setAlpha(0.85);
    });
    hit.on("pointerup", () => {
      container.setAlpha(1);
      onClick();
    });
    hit.on("pointerout", () => {
      container.setAlpha(1);
    });
  }

  return container;
}
