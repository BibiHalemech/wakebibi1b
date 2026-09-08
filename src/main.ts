import Phaser from "phaser";
import { COLORS, STAGE_HEIGHT, STAGE_WIDTH } from "./config";
import { BootScene } from "./scenes/BootScene";
import { EndingScene } from "./scenes/EndingScene";
import { FreezeScene } from "./scenes/FreezeScene";
import { PlayScene } from "./scenes/PlayScene";
import { TitleScene } from "./scenes/TitleScene";
import { TwistScene } from "./scenes/TwistScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: STAGE_WIDTH,
  height: STAGE_HEIGHT,
  backgroundColor: COLORS.linen,
  banner: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene,
    TitleScene,
    PlayScene,
    FreezeScene,
    TwistScene,
    EndingScene,
  ],
};

const game = new Phaser.Game(config);

declare global {
  interface Window {
    game: Phaser.Game;
  }
}

window.game = game;
