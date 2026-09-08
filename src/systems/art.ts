import Phaser from "phaser";
import type { AssetManifest, ManifestAsset } from "../content/manifest";
import { publicUrl } from "../publicUrl";

function isImageResponse(response: Response): boolean {
  if (!response.ok) {
    return false;
  }
  const type = response.headers.get("content-type") ?? "";
  if (type.includes("text/html")) {
    return false;
  }
  return type.startsWith("image/") || type.includes("svg");
}

async function rasterizeSvg(text: string, width: number, height: number): Promise<HTMLImageElement> {
  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  if (doc.querySelector("parsererror")) {
    throw new Error("Invalid SVG");
  }
  const svg = doc.documentElement;
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  Array.from(doc.querySelectorAll("metadata")).forEach((node) => {
    node.remove();
  });
  const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
  const objectUrl = URL.createObjectURL(blob);
  const image = new Image();
  image.decoding = "async";
  try {
    image.src = objectUrl;
    await image.decode();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
  return image;
}

async function loadBitmap(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.decoding = "async";
  image.src = url;
  await image.decode();
  return image;
}

async function replaceWithFinal(scene: Phaser.Scene, asset: ManifestAsset): Promise<boolean> {
  const url = publicUrl(`assets/${asset.final}`);
  try {
    const response = await fetch(url);
    if (!isImageResponse(response)) {
      return false;
    }
    const image = asset.final.endsWith(".svg")
      ? await rasterizeSvg(await response.text(), asset.width, asset.height)
      : await loadBitmap(url);
    if (scene.textures.exists(asset.id)) {
      scene.textures.remove(asset.id);
    }
    scene.textures.addImage(asset.id, image);
    return scene.textures.exists(asset.id);
  } catch {
    return false;
  }
}

/** Load each existing final file over its placeholder. Missing files keep the labeled stand-in. */
export async function loadAvailableFinalArt(
  scene: Phaser.Scene,
  manifest: AssetManifest,
): Promise<void> {
  if (!manifest.useFinalArt) {
    return;
  }
  await Promise.all(manifest.assets.map((asset) => replaceWithFinal(scene, asset)));
}
