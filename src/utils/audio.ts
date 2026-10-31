// GrindOS Retro Web Audio Synthesizer
// Authentic square-wave oscillator beeps with gain exponential ramp

class RetroSoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public beep(frequency: number = 880, duration: number = 0.06, type: OscillatorType = 'square') {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay restrictions or errors
    }
  }

  public playCheckSound() {
    this.beep(990, 0.08, 'square');
  }

  public playUncheckSound() {
    this.beep(440, 0.06, 'square');
  }

  public playTickSound() {
    this.beep(800, 0.03, 'sine');
  }

  public playVictorySound() {
    this.beep(523, 0.08);
    setTimeout(() => this.beep(659, 0.08), 80);
    setTimeout(() => this.beep(784, 0.08), 160);
    setTimeout(() => this.beep(1046, 0.16), 240);
  }

  public playOpenWindowSound() {
    this.beep(660, 0.05);
  }

  public playCloseWindowSound() {
    this.beep(330, 0.05);
  }

  public playSelectIconSound() {
    this.beep(520, 0.03);
  }

  public playStartMenuSound() {
    this.beep(740, 0.05);
  }
}

export const sounds = new RetroSoundManager();
export const beep = (f: number = 880, d: number = 0.06, type: OscillatorType = 'square') => sounds.beep(f, d, type);
