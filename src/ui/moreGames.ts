import Phaser from "phaser";
import { COLORS, FONT_FAMILY, STAGE_WIDTH } from "../config";
import { strings } from "../content/strings.he";

type MoreGamesOptions = {
  x?: number;
  y: number;
  depth?: number;
};

export function addMoreGamesLink(
  scene: Phaser.Scene,
  options: MoreGamesOptions,
): Phaser.GameObjects.Container {
  const x = options.x ?? STAGE_WIDTH / 2;
  const depth = options.depth ?? 60;

  const trigger = scene.add
    .text(0, 0, strings.moreGames, {
      fontFamily: FONT_FAMILY,
      fontSize: "32px",
      fontStyle: "700",
      color: "#5E6A73",
      rtl: true,
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

  const container = scene.add.container(x, options.y, [trigger]);
  container.setDepth(depth);

  let open = false;
  let panel: Phaser.GameObjects.Container | undefined;

  const closePanel = (): void => {
    panel?.destroy();
    panel = undefined;
    open = false;
  };

  const openPanel = (): void => {
    if (panel) {
      return;
    }

    const links = strings.moreGamesList.map((game) =>
      scene.add
        .text(0, 0, game.label, {
          fontFamily: FONT_FAMILY,
          fontSize: "36px",
          fontStyle: "700",
          color: "#2C2A26",
          rtl: true,
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true }),
    );

    const gap = 28;
    const contentHeight = links.reduce(
      (sum, link, index) => sum + link.height + (index > 0 ? gap : 0),
      0,
    );
    let cursorY = -contentHeight / 2;
    for (const link of links) {
      link.setY(cursorY + link.height / 2);
      cursorY += link.height + gap;
    }

    const paddingX = 48;
    const paddingY = 36;
    const width = Math.min(
      720,
      Math.max(...links.map((link) => link.width), trigger.width) + paddingX * 2,
    );
    const height = contentHeight + paddingY * 2;
    const plate = scene.add
      .rectangle(0, 0, width, height, COLORS.paper)
      .setStrokeStyle(4, COLORS.charcoal);

    panel = scene.add.container(0, -(height / 2 + trigger.height / 2 + 24), [
      plate,
      ...links,
    ]);
    panel.setAlpha(0);
    container.add(panel);
    scene.tweens.add({ targets: panel, alpha: 1, duration: 220 });
    open = true;

    strings.moreGamesList.forEach((game, index) => {
      const link = links[index];
      link.on("pointerover", () => link.setColor("#6E8B86"));
      link.on("pointerout", () => link.setColor("#2C2A26"));
      link.on("pointerup", () => {
        window.open(game.url, "_blank", "noopener,noreferrer");
      });
    });
  };

  trigger.on("pointerover", () => trigger.setColor("#6E8B86"));
  trigger.on("pointerout", () => trigger.setColor("#5E6A73"));
  trigger.on("pointerup", () => {
    if (open) {
      closePanel();
    } else {
      openPanel();
    }
  });

  return container;
}
