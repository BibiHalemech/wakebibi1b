import { publicUrl } from "../publicUrl";
import { loadSettings } from "./settings";

const MUSIC_URL = publicUrl("assets/final/sleep.mp3");

let track: HTMLAudioElement | null = null;

export function startBackgroundMusic(): void {
  if (!loadSettings().soundEnabled) {
    return;
  }
  if (!track) {
    track = new Audio(MUSIC_URL);
    track.loop = true;
    track.volume = 0.45;
    track.dataset.bgMusic = "sleep";
    document.body.appendChild(track);
  }
  void track.play().catch(() => {
    // Browser blocked autoplay until a later gesture.
  });
}

export function isBackgroundMusicPlaying(): boolean {
  return Boolean(track && !track.paused);
}
