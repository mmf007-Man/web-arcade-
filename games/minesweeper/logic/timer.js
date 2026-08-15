export class GameTimer {
  constructor(onTick) {
    this.seconds = 0;
    this.intervalId = null;
    this.onTick = onTick;
  }

  start() {
    this.stop();
    this.seconds = 0;
    this.onTick(this.seconds);
    this.intervalId = setInterval(() => {
      this.seconds++;
      this.onTick(this.seconds);
    }, 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset() {
    this.stop();
    this.seconds = 0;
    this.onTick(this.seconds);
  }
}
