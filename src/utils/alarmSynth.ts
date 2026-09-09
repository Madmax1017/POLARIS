// Web Audio API Command-Center Electronic Alarm Synthesizer
class EmergencyAlarmSynthesizer {
  private audioCtx: AudioContext | null = null;
  private timerId: number | null = null;
  private isPlaying: boolean = false;

  public start() {
    if (this.isPlaying) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.isPlaying = true;

      const playPulse = () => {
        if (!this.audioCtx || !this.isPlaying) return;
        try {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          // Command Center dual-tone sweep (880Hz -> 587Hz)
          osc.type = 'square';
          osc.frequency.setValueAtTime(880, this.audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(587, this.audioCtx.currentTime + 0.12);

          gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start();
          osc.stop(this.audioCtx.currentTime + 0.16);
        } catch (e) {
          // ignore audio context glitches
        }
      };

      playPulse();
      this.timerId = window.setInterval(playPulse, 750);
    } catch (e) {
      console.warn('Web Audio API not allowed or supported', e);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public getIsPlaying() {
    return this.isPlaying;
  }
}

export const alarmSynth = new EmergencyAlarmSynthesizer();
