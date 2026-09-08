import Phaser from "phaser";
import { FONT_FAMILY, KIND_ASSET, RING_SLOTS, type ObjectKind } from "../config";
import { nextQuote } from "../content/quotes";
import { strings } from "../content/strings.he";

export type ActiveObject = {
  kind: ObjectKind;
  view: Phaser.GameObjects.Container;
  slot: number;
  bornAt: number;
  lifetimeMs: number;
  drift: number;
  silentExpire: boolean;
  pairId?: number;
};

function addCardText(
  scene: Phaser.Scene,
  title: string,
  subtitle?: string,
  width = 440,
): Phaser.GameObjects.Text[] {
  const titleText = scene.add
    .text(0, subtitle ? -16 : 0, title, {
      fontFamily: FONT_FAMILY,
      fontSize: "34px",
      fontStyle: "700",
      color: "#2C2A26",
      align: "center",
      rtl: true,
      wordWrap: { width },
    })
    .setOrigin(0.5);

  if (!subtitle) {
    return [titleText];
  }

  const source = scene.add
    .text(0, 48, subtitle, {
      fontFamily: FONT_FAMILY,
      fontSize: "20px",
      color: "#5E6A73",
      align: "center",
      rtl: true,
    })
    .setOrigin(0.5);

  return [titleText, source];
}

export function createPlayView(
  scene: Phaser.Scene,
  kind: ObjectKind,
  slot: number,
): Phaser.GameObjects.Container {
  const { x, y } = RING_SLOTS[slot];
  const texture = KIND_ASSET[kind];
  const image = scene.add.image(0, 0, texture);
  const container = scene.add.container(x, y, [image]);

  if (kind === "quote") {
    const quote = nextQuote();
    container.add(addCardText(scene, quote.text, quote.source, 460));
  } else if (kind === "contradict_stay") {
    container.add(addCardText(scene, strings.stay, undefined, 400));
  } else if (kind === "contradict_leave") {
    container.add(addCardText(scene, strings.leave, undefined, 400));
  }

  container.setSize(image.width, image.height);
  container.setDepth(10);
  container.setInteractive({ useHandCursor: true });
  return container;
}

export function createActiveObject(
  scene: Phaser.Scene,
  kind: ObjectKind,
  slot: number,
  now: number,
  lifetimeMs: number,
  drift: number,
  pairId?: number,
): ActiveObject {
  const view = createPlayView(scene, kind, slot);
  return {
    kind,
    view,
    slot,
    bornAt: now,
    lifetimeMs,
    drift,
    silentExpire: kind === "quote",
    pairId,
  };
}
