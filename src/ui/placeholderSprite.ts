import Phaser from "phaser";
import { FONT_FAMILY } from "../config";
import type { ManifestAsset } from "../content/manifest";

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawPlaceholder(ctx: CanvasRenderingContext2D, asset: ManifestAsset): void {
  const { width, height } = asset;
  const inset = 8;
  const radius = Math.min(32, Math.floor(Math.min(width, height) / 5));

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = asset.fill;
  roundRect(ctx, inset, inset, width - inset * 2, height - inset * 2, radius);
  ctx.fill();

  ctx.lineWidth = asset.strokeWidth ?? 4;
  ctx.strokeStyle = asset.stroke ?? "#2C2A26";
  roundRect(ctx, inset + 2, inset + 2, width - inset * 2 - 4, height - inset * 2 - 4, radius - 2);
  ctx.stroke();

  if (asset.topBar) {
    ctx.fillStyle = asset.topBar;
    ctx.fillRect(inset + 6, inset + 6, width - inset * 2 - 12, 16);
  }
  if (asset.leftStripe) {
    ctx.fillStyle = asset.leftStripe;
    ctx.fillRect(inset + 6, inset + 6, 16, height - inset * 2 - 12);
  }

  const hasFace = Boolean(asset.closedEyes || asset.openEyes);
  if (hasFace) {
    drawFace(ctx, width, height, Boolean(asset.openEyes), Boolean(asset.lookRight));
  }

  if (asset.blankPlate) {
    return;
  }

  const caption = `${asset.labelHe} / ${asset.labelEn}`;
  const isTile = Math.min(width, height) <= 200;
  ctx.fillStyle = "#FFF8EE";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (asset.emoji) {
    ctx.font = `${isTile ? 40 : 56}px ${FONT_FAMILY}`;
    ctx.fillText(asset.emoji, width / 2, height * 0.38);
    ctx.font = `600 ${isTile ? 20 : 32}px ${FONT_FAMILY}`;
    ctx.fillText(caption, width / 2, height * 0.72, width - 28);
  } else {
    ctx.font = `600 ${isTile ? 20 : 32}px ${FONT_FAMILY}`;
    ctx.fillText(caption, width / 2, hasFace ? height * 0.72 : height / 2, width - 28);
  }
}

function drawFace(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  open: boolean,
  lookRight: boolean,
): void {
  const cx = width * (lookRight ? 0.58 : 0.5);
  const cy = height * 0.38;
  ctx.fillStyle = "#E4C2A5";
  ctx.beginPath();
  ctx.ellipse(cx, cy, width * 0.16, height * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  const left = cx - width * 0.06;
  const right = cx + width * 0.06;
  if (open) {
    ctx.fillStyle = "#FFF8EE";
    ctx.beginPath();
    ctx.ellipse(left, cy, 8, 10, 0, 0, Math.PI * 2);
    ctx.ellipse(right, cy, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2C2A26";
    ctx.beginPath();
    ctx.ellipse(left + (lookRight ? 2 : 0), cy, 3.2, 3.2, 0, 0, Math.PI * 2);
    ctx.ellipse(right + (lookRight ? 2 : 0), cy, 3.2, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.fillStyle = "#2C2A26";
  ctx.beginPath();
  ctx.ellipse(left, cy, 6, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(right, cy, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function generatePlaceholderTexture(scene: Phaser.Scene, asset: ManifestAsset): void {
  if (scene.textures.exists(asset.id)) {
    scene.textures.remove(asset.id);
  }

  const canvas = document.createElement("canvas");
  canvas.width = asset.width;
  canvas.height = asset.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error(`Could not create canvas for ${asset.id}`);
  }

  drawPlaceholder(ctx, asset);
  scene.textures.addCanvas(asset.id, canvas);
}

export function generateAllPlaceholders(scene: Phaser.Scene, assets: ManifestAsset[]): void {
  for (const asset of assets) {
    if (asset.id === "vignette_soft") {
      continue;
    }
    generatePlaceholderTexture(scene, asset);
  }
}

export function addPlaceholderImage(
  scene: Phaser.Scene,
  id: string,
  x: number,
  y: number,
): Phaser.GameObjects.Image {
  return scene.add.image(x, y, id);
}
