import Phaser from "phaser";

export function startBibiFrames(
  scene: Phaser.Scene,
  sprite: Phaser.GameObjects.Image,
  frames: readonly string[],
  frameMs: number,
): Phaser.Time.TimerEvent | undefined {
  const usable = frames.filter((id) => scene.textures.exists(id));
  if (usable.length === 0) {
    return undefined;
  }
  sprite.setTexture(usable[0]);
  if (usable.length === 1) {
    return undefined;
  }
  let index = 0;
  return scene.time.addEvent({
    delay: frameMs,
    loop: true,
    callback: () => {
      if (!sprite.active) {
        return;
      }
      index = (index + 1) % usable.length;
      sprite.setTexture(usable[index]);
    },
  });
}

export function stopBibiFrames(timer: Phaser.Time.TimerEvent | undefined): void {
  timer?.remove(false);
}
