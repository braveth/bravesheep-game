import { DIFFICULTY } from '../config/enemies'
import { WORLD } from '../config/physics'

export class DifficultyManager {
  private elapsed = 0   // seconds since level start

  update(delta: number): void {
    this.elapsed += delta / 1000
  }

  reset(): void {
    this.elapsed = 0
  }

  /** Current level (0-levelMax), advances every levelInterval seconds. */
  get level(): number {
    return Math.min(
      Math.floor(this.elapsed / DIFFICULTY.levelInterval),
      DIFFICULTY.levelMax,
    )
  }

  get scrollSpeed(): number   { return DIFFICULTY.scrollSpeed   + this.level * DIFFICULTY.stepScrollSpeed }
  get waveInterval(): number  { return DIFFICULTY.waveInterval  + this.level * DIFFICULTY.stepWaveInterval }
  get turretShots(): number   { return DIFFICULTY.turretShots   + this.level * DIFFICULTY.stepTurretShots }
  get airDropCount(): number  { return DIFFICULTY.airDropCount  + this.level * DIFFICULTY.stepAirDropCount }
  get packCount(): number     { return DIFFICULTY.packCount     + this.level * DIFFICULTY.stepPackCount }
  get packSpeedMult(): number { return DIFFICULTY.packSpeedMult + this.level * DIFFICULTY.stepPackSpeedMult }

  /**
   * Ratio of base scroll speed to current scroll speed.
   * Multiplied against timing intervals so everything stays within half a screen
   * width (480 px) regardless of how fast the world is scrolling.
   */
  get speedFactor(): number   { return DIFFICULTY.scrollSpeed / this.scrollSpeed }

  get tier(): number { return this.level }

  /** Seconds until the next level tick (0 if already at max level). */
  get nextLevelIn(): number {
    if (this.level >= DIFFICULTY.levelMax) return 0
    return Math.max(0, (this.level + 1) * DIFFICULTY.levelInterval - this.elapsed)
  }

  /** Distance travelled in "metres" (1 m = 10 px of scroll) */
  get metres(): number { return Math.floor(this.elapsed * WORLD.INITIAL_SCROLL_SPEED / 10) }
}
