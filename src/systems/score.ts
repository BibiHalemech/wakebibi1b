export const SCORE_TARGET = 30;

export class Score {
  caught = 0;
  spawned = 0;
  missed = 0;

  get hudLabel(): string {
    const denominator = this.spawned > SCORE_TARGET ? this.spawned : SCORE_TARGET;
    return `${this.caught} / ${denominator}`;
  }

  spawn(): void {
    this.spawned += 1;
  }

  catch(): void {
    this.caught += 1;
  }

  miss(): void {
    this.missed += 1;
  }
}
