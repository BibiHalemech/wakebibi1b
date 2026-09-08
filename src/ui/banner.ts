import Phaser from "phaser";
import { COLORS, FONT_FAMILY, LAYOUT, STAGE_WIDTH } from "../config";
import { quoteHref, type QuoteCard } from "../content/quotes";

export function showBanner(
  scene: Phaser.Scene,
  text: string,
  y = LAYOUT.beatY,
): Phaser.GameObjects.Text {
  const banner = scene.add
    .text(STAGE_WIDTH / 2, y, text, {
      fontFamily: FONT_FAMILY,
      fontSize: "40px",
      fontStyle: "500",
      color: "#2C2A26",
      backgroundColor: "#FFF8EE",
      padding: { x: 28, y: 14 },
      align: "center",
      rtl: true,
      wordWrap: { width: 900 },
    })
    .setOrigin(0.5)
    .setDepth(40)
    .setAlpha(0);

  scene.tweens.add({
    targets: banner,
    alpha: 1,
    duration: 160,
    hold: 1600,
    yoyo: true,
    onComplete: () => {
      banner.destroy();
    },
  });

  return banner;
}

export function showClickableBanner(
  scene: Phaser.Scene,
  text: string,
  onClick: () => void,
  y = LAYOUT.beatY,
): Phaser.GameObjects.Text {
  const banner = scene.add
    .text(STAGE_WIDTH / 2, y, text, {
      fontFamily: FONT_FAMILY,
      fontSize: "40px",
      fontStyle: "500",
      color: "#2C2A26",
      backgroundColor: "#FFF8EE",
      padding: { x: 36, y: 18 },
      align: "center",
      rtl: true,
      wordWrap: { width: 900 },
    })
    .setOrigin(0.5)
    .setDepth(40)
    .setInteractive({ useHandCursor: true });

  banner.once("pointerup", () => {
    banner.destroy();
    onClick();
  });

  return banner;
}

export function showClickableQuote(
  scene: Phaser.Scene,
  quote: QuoteCard,
  onClick: () => void,
  y = LAYOUT.beatY,
): Phaser.GameObjects.Container {
  const body = scene.add
    .text(0, 0, quote.text, {
      fontFamily: FONT_FAMILY,
      fontSize: "36px",
      fontStyle: "500",
      color: "#2C2A26",
      align: "center",
      rtl: true,
      wordWrap: { width: 800 },
    })
    .setOrigin(0.5);

  const source = scene.add
    .text(0, 0, quote.source, {
      fontFamily: FONT_FAMILY,
      fontSize: "22px",
      fontStyle: "500",
      color: "#5E6A73",
      align: "center",
      rtl: true,
      wordWrap: { width: 800 },
    })
    .setOrigin(0.5);

  const link = quote.source_url
    ? scene.add
        .text(0, 0, quote.source_url, {
          fontFamily: FONT_FAMILY,
          fontSize: "20px",
          fontStyle: "500",
          color: "#6A8CA8",
          align: "center",
          wordWrap: { width: 800 },
        })
        .setOrigin(0.5)
    : undefined;

  const lines = link ? [body, source, link] : [body, source];
  const gap = 16;
  const contentHeight = lines.reduce((sum, line, index) => sum + line.height + (index > 0 ? gap : 0), 0);
  let cursorY = -contentHeight / 2;
  for (const line of lines) {
    line.setY(cursorY + line.height / 2);
    cursorY += line.height + gap;
  }

  const paddingX = 40;
  const paddingY = 28;
  const width = Math.min(920, Math.max(...lines.map((line) => line.width)) + paddingX * 2);
  const height = contentHeight + paddingY * 2;

  const plate = scene.add.rectangle(0, 0, width, height, COLORS.paper).setStrokeStyle(6, COLORS.charcoal);
  const hit = scene.add.rectangle(0, 0, width, height, COLORS.charcoal, 0).setInteractive({
    useHandCursor: true,
  });

  const container = scene.add.container(STAGE_WIDTH / 2, y, [plate, hit, ...lines]);
  container.setDepth(40);

  hit.on("pointerup", () => {
    container.destroy();
    onClick();
  });

  if (link && quote.source_url) {
    const href = quoteHref(quote.source_url);
    link.setInteractive({ useHandCursor: true });
    link.on(
      "pointerup",
      (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        window.open(href, "_blank", "noopener,noreferrer,width=1100,height=800");
      },
    );
  }

  return container;
}
