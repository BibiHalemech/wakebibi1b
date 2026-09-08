import { publicUrl } from "../publicUrl";

export type ManifestAsset = {
  id: string;
  width: number;
  height: number;
  placeholder: string;
  final: string;
  labelHe: string;
  labelEn: string;
  emoji: string;
  fill: string;
  closedEyes?: boolean;
  openEyes?: boolean;
  lookRight?: boolean;
  blankPlate?: boolean;
  topBar?: string;
  leftStripe?: string;
  stroke?: string;
  strokeWidth?: number;
};

export type AssetManifest = {
  useFinalArt: boolean;
  assets: ManifestAsset[];
};

let cached: AssetManifest | null = null;

export function clearManifestCache(): void {
  cached = null;
}

export async function loadManifest(): Promise<AssetManifest> {
  if (cached) {
    return cached;
  }
  const response = await fetch(publicUrl("assets/manifest.json"));
  if (!response.ok) {
    throw new Error(`Failed to load asset manifest (${response.status})`);
  }
  cached = (await response.json()) as AssetManifest;
  return cached;
}

export function getAsset(manifest: AssetManifest, id: string): ManifestAsset {
  const asset = manifest.assets.find((entry) => entry.id === id);
  if (!asset) {
    throw new Error(`Unknown asset id: ${id}`);
  }
  return asset;
}
