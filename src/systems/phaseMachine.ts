import { PHASE_TIMING, type PhaseId } from "../config";

export class PhaseMachine {
  phase: PhaseId = "easy";
  enteredAt = 0;
  busyMisses = 0;
  private stirPlayed = false;
  private tooMuchPlayed = false;

  start(now: number): void {
    this.phase = "easy";
    this.enteredAt = now;
    this.busyMisses = 0;
    this.stirPlayed = false;
    this.tooMuchPlayed = false;
  }

  enter(next: PhaseId, now: number): void {
    this.phase = next;
    this.enteredAt = now;
  }

  onCatch(totalCaught: number, now: number): PhaseId | null {
    if (this.phase === "easy" && totalCaught >= PHASE_TIMING.catchesToStir && !this.stirPlayed) {
      this.stirPlayed = true;
      this.enter("stir", now);
      return "stir";
    }
    return null;
  }

  onMiss(now: number): PhaseId | null {
    if (this.phase === "busy") {
      this.busyMisses += 1;
      if (this.busyMisses >= PHASE_TIMING.missesToTooMuch && !this.tooMuchPlayed) {
        this.tooMuchPlayed = true;
        this.enter("too_much", now);
        return "too_much";
      }
    }
    return null;
  }

  tick(now: number): PhaseId | null {
    const elapsed = now - this.enteredAt;
    if (this.phase === "stir" && elapsed >= PHASE_TIMING.stirHoldMs) {
      this.enter("busy", now);
      return "busy";
    }
    if (this.phase === "busy" && elapsed >= PHASE_TIMING.busyMaxMs && !this.tooMuchPlayed) {
      this.tooMuchPlayed = true;
      this.enter("too_much", now);
      return "too_much";
    }
    if (this.phase === "too_much" && elapsed >= PHASE_TIMING.tooMuchHoldMs) {
      this.enter("quotes", now);
      return "quotes";
    }
    if (this.phase === "quotes" && elapsed >= PHASE_TIMING.quotesWindowMs) {
      this.enter("overload", now);
      return "overload";
    }
    if (this.phase === "overload" && elapsed >= PHASE_TIMING.overloadMs) {
      this.enter("freeze", now);
      return "freeze";
    }
    return null;
  }
}
