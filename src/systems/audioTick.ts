import { AUDIO, PHASE_TIMING, type PhaseId } from "../config";
import { loadSettings } from "./settings";

type Voice = {
  oscillator: OscillatorNode;
  gain: GainNode;
};

let context: AudioContext | null = null;
let cut = false;
let clusterPlayed = false;
let clusterTimer: number | null = null;
const voices: Voice[] = [];

function getContext(): AudioContext | null {
  const Ctor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) {
    return null;
  }
  if (!context) {
    context = new Ctor();
  }
  return context;
}

function dropVoice(voice: Voice): void {
  const index = voices.indexOf(voice);
  if (index >= 0) {
    voices.splice(index, 1);
  }
}

function scheduleBeep(when: number, frequency: number, peak: number, duration: number): void {
  const audio = getContext();
  if (!audio || cut) {
    return;
  }

  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(peak, when + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(when);
  oscillator.stop(when + duration + 0.02);

  const voice = { oscillator, gain };
  voices.push(voice);
  oscillator.onended = () => {
    dropVoice(voice);
  };
}

function canPlay(): boolean {
  return loadSettings().soundEnabled && !cut;
}

function tickStyle(phase: PhaseId): "soft" | "busy" | "overload" {
  if (phase === "busy" || phase === "too_much") {
    return "busy";
  }
  if (phase === "overload") {
    return "overload";
  }
  return "soft";
}

/** Soft early tap, denser busy overlap, or a harder overload tap. */
export function playTick(phase: PhaseId = "easy"): void {
  if (!canPlay()) {
    return;
  }
  if (loadSettings().reduceSensoryIntensity || tickStyle(phase) === "soft") {
    playSoftTick();
    return;
  }
  if (tickStyle(phase) === "busy") {
    playBusyTick();
    return;
  }
  playOverloadTick();
}

function playSoftTick(): void {
  const audio = getContext();
  if (!audio) {
    return;
  }
  void audio.resume();
  scheduleBeep(audio.currentTime, 680, 0.04, 0.06);
}

function playBusyTick(): void {
  const audio = getContext();
  if (!audio) {
    return;
  }
  void audio.resume();
  const now = audio.currentTime;
  scheduleBeep(now, 820, 0.05, 0.07);
  scheduleBeep(now + 0.018, 980, 0.035, 0.06);
}

function playOverloadTick(): void {
  const audio = getContext();
  if (!audio) {
    return;
  }
  void audio.resume();
  const now = audio.currentTime;
  scheduleBeep(now, 640, 0.055, 0.05);
  scheduleBeep(now + 0.012, 880, 0.045, 0.055);
  scheduleBeep(now + 0.024, 1120, 0.03, 0.045);
}

/** Last 1.8s of overload: dense cluster, then hard cut. Reduce path never starts this. */
export function maybeOverloadCluster(phase: PhaseId, now: number, enteredAt: number): void {
  if (phase !== "overload" || clusterPlayed || !canPlay()) {
    return;
  }
  if (loadSettings().reduceSensoryIntensity) {
    return;
  }
  if (now - enteredAt < PHASE_TIMING.overloadMs - AUDIO.clusterMs) {
    return;
  }
  startOverloadCluster();
}

export function startOverloadCluster(): void {
  if (clusterPlayed || !canPlay() || loadSettings().reduceSensoryIntensity) {
    return;
  }
  const audio = getContext();
  if (!audio) {
    return;
  }
  clusterPlayed = true;
  void audio.resume();

  const start = audio.currentTime;
  const span = AUDIO.clusterMs / 1000;
  for (let i = 0; i < AUDIO.clusterBeeps; i += 1) {
    const t = start + (i / AUDIO.clusterBeeps) * span * 0.92;
    const freq = 520 + ((i * 97) % 700);
    const peak = 0.035 + (i / AUDIO.clusterBeeps) * 0.03;
    scheduleBeep(t, freq, peak, 0.05);
    if (i % 3 === 0) {
      scheduleBeep(t + 0.016, freq + 180, peak * 0.7, 0.04);
    }
  }

  clearClusterTimer();
  clusterTimer = window.setTimeout(() => {
    clusterTimer = null;
    if (!cut) {
      cutVoices();
      cut = true;
    }
  }, AUDIO.clusterMs);
}

function clearClusterTimer(): void {
  if (clusterTimer !== null) {
    window.clearTimeout(clusterTimer);
    clusterTimer = null;
  }
}

function cutVoices(): void {
  const audio = context;
  const now = audio?.currentTime ?? 0;
  for (const voice of [...voices]) {
    try {
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(0.0001, now);
      voice.oscillator.stop(now);
    } catch {
      // Already stopped.
    }
    dropVoice(voice);
  }
}

/** Hard cut — Freeze is silence. Later sessions call resetAudioSession(). */
export function silenceAudio(): void {
  cut = true;
  clearClusterTimer();
  cutVoices();
  if (context && context.state === "running") {
    void context.suspend();
  }
}

export function resetAudioSession(): void {
  cut = false;
  clusterPlayed = false;
  clearClusterTimer();
  cutVoices();
  if (context && context.state === "suspended") {
    void context.resume();
  }
}

export function getAudioDebug(): {
  cut: boolean;
  clusterPlayed: boolean;
  voiceCount: number;
  contextState: string | null;
} {
  return {
    cut,
    clusterPlayed,
    voiceCount: voices.length,
    contextState: context?.state ?? null,
  };
}
