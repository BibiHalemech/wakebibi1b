import Phaser from "phaser";
import { FONT_FAMILY, SceneKeys } from "../config";
import { clearQuotesCache, loadQuotes } from "../content/quotes";
import { clearManifestCache, loadManifest } from "../content/manifest";
import { loadAvailableFinalArt } from "../systems/art";
import { generateAllPlaceholders } from "../ui/placeholderSprite";

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Boot);
  }

  create(): void {
    void this.boot();
  }

  private async boot(): Promise<void> {
    await this.waitForFont();
    clearManifestCache();
    clearQuotesCache();
    const [manifest] = await Promise.all([loadManifest(), loadQuotes()]);
    generateAllPlaceholders(this, manifest.assets);
    await loadAvailableFinalArt(this, manifest);
    this.scene.start(SceneKeys.Title);
  }

  private async waitForFont(): Promise<void> {
    if (!("fonts" in document)) {
      return;
    }
    try {
      await document.fonts.load(`700 64px ${FONT_FAMILY}`);
      await document.fonts.ready;
    } catch {
      // System fallback is already set on every text style.
    }
  }
}
