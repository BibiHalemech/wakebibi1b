export type GameSettings = {
  reduceSensoryIntensity: boolean;
  noPoliticalQuotes: boolean;
  soundEnabled: boolean;
};

const DEFAULTS: GameSettings = {
  reduceSensoryIntensity: false,
  noPoliticalQuotes: false,
  soundEnabled: true,
};

export function loadSettings(): GameSettings {
  return { ...DEFAULTS };
}
