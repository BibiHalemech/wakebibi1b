import Phaser from "phaser";
import { COLORS, FONT_FAMILY, LAYOUT, STAGE_HEIGHT, STAGE_WIDTH, SceneKeys } from "../config";
import { addPlaceholderImage } from "./placeholderSprite";

const VIGNETTE_KEY = "vignette_soft";

export function playIsOnScreen(scene: Phaser.Scene): boolean {
  return scene.scene.isActive(SceneKeys.Play) || scene.scene.isPaused(SceneKeys.Play);
}

export function addSceneBackdrop(scene: Phaser.Scene, id: string): void {
  if (!scene.textures.exists(id)) {
    return;
  }
  scene.add.image(STAGE_WIDTH / 2, STAGE_HEIGHT / 2, id).setDepth(0);
}

export function addBedroom(scene: Phaser.Scene, bibiId: string): Phaser.GameObjects.Image {
  addSceneBackdrop(scene, "bg_bedroom");
  addPlaceholderImage(scene, "bed", LAYOUT.bedX, LAYOUT.bedY).setDepth(1);
  if (scene.textures.exists("nightstand_l")) {
    scene.add.image(LAYOUT.nightstandLX, LAYOUT.nightstandY, "nightstand_l").setDepth(1);
  }
  if (scene.textures.exists("nightstand_r")) {
    scene.add.image(LAYOUT.nightstandRX, LAYOUT.nightstandY, "nightstand_r").setDepth(1);
  }
  return addPlaceholderImage(scene, bibiId, STAGE_WIDTH / 2, LAYOUT.bibiY).setDepth(3);
}

export function addVignette(scene: Phaser.Scene): void {
  if (!scene.textures.exists(VIGNETTE_KEY)) {
    const canvas = document.createElement("canvas");
    canvas.width = STAGE_WIDTH;
    canvas.height = STAGE_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(
        STAGE_WIDTH / 2,
        STAGE_HEIGHT / 2,
        360,
        STAGE_WIDTH / 2,
        STAGE_HEIGHT / 2,
        1100,
      );
      gradient.addColorStop(0, "rgba(44,42,38,0)");
      gradient.addColorStop(1, "rgba(44,42,38,0.12)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
      scene.textures.addCanvas(VIGNETTE_KEY, canvas);
    }
  }
  if (scene.textures.exists(VIGNETTE_KEY)) {
    scene.add.image(STAGE_WIDTH / 2, STAGE_HEIGHT / 2, VIGNETTE_KEY).setDepth(25);
  }
}

export function addNarrativeText(
  scene: Phaser.Scene,
  y: number,
  text: string,
  options?: { size?: string; color?: string; width?: number; depth?: number },
): Phaser.GameObjects.Text {
  return scene.add
    .text(STAGE_WIDTH / 2, y, text, {
      fontFamily: FONT_FAMILY,
      fontSize: options?.size ?? "44px",
      fontStyle: "500",
      color: options?.color ?? "#2C2A26",
      backgroundColor: "#FFF8EE",
      padding: { x: 28, y: 16 },
      align: "center",
      rtl: true,
      wordWrap: { width: options?.width ?? 880 },
    })
    .setOrigin(0.5)
    .setDepth(options?.depth ?? 50);
}

type AlphaTarget = Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Alpha;

export function fadeIn(scene: Phaser.Scene, target: AlphaTarget, duration = 320): void {
  target.setAlpha(0);
  scene.tweens.add({ targets: target, alpha: 1, duration });
}

export function fadeOut(
  scene: Phaser.Scene,
  targets: AlphaTarget[],
  duration = 280,
  onComplete?: () => void,
): void {
  scene.tweens.add({
    targets,
    alpha: 0,
    duration,
    onComplete,
  });
}

export function linenBackground(scene: Phaser.Scene): void {
  scene.cameras.main.setBackgroundColor(COLORS.linen);
}
