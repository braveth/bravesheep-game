import Phaser from 'phaser'
import { BaseEnemy } from './BaseEnemy'
import { FAT_CAT } from '../../../config/enemies'
import { WORLD } from '../../../config/physics'

export abstract class LaserTurret extends BaseEnemy {
  private fireSchedule: Array<{ at: number; shot: 0 | 1 }> = []
  private scheduleBuilt = false

  constructor(
    scene:      Phaser.Scene,
    group:      Phaser.Physics.Arcade.Group,
    x:          number,
    y:          number,
    textureKey: string,
    hp:         number,
  ) {
    super(group, x, y, textureKey, hp)
    void scene
  }

  /**
   * Advances one frame.  Returns 0 (head shot), 1 (low shot), or -1.
   *
   * Schedule is built once on the first frame on-screen.
   * Shot types are pre-assigned with a balanced shuffle so both types always
   * appear within a single encounter (no all-same-type streaks).
   * All shots fit within LASER_FIRE_WINDOW * speedFactor ms, keeping the full
   * burst inside half a screen width at any scroll speed.
   */
  protected tickLaser(
    time:        number,
    scrollSpeed: number,
    maxShots:    number,
    heroX:       number,
    minFireDist: number,
    speedFactor: number,
  ): 0 | 1 | -1 {
    ;(this.sprite.body as Phaser.Physics.Arcade.Body).setVelocityX(-scrollSpeed)

    if (this.sprite.x > WORLD.WIDTH) return -1

    if (!this.scheduleBuilt) {
      this.scheduleBuilt = true

      // Quadratic-decreasing intervals scaled to fit in half a screen.
      const window  = FAT_CAT.LASER_FIRE_WINDOW * speedFactor
      const kSumSq  = maxShots * (maxShots + 1) * (2 * maxShots + 1) / 6
      const si      = Math.max(FAT_CAT.LASER_MIN_GAP, Math.floor(window / kSumSq))

      // Build balanced shot-type array: alternating 0/1 then Fisher-Yates shuffle.
      // This guarantees both types appear every encounter.
      const shotTypes: (0 | 1)[] = Array.from({ length: maxShots }, (_, k) => (k % 2) as 0 | 1)
      if (Math.random() < 0.5) {
        for (let k = 0; k < maxShots; k++) shotTypes[k] = shotTypes[k] === 0 ? 1 : 0
      }
      for (let k = shotTypes.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1))
        ;[shotTypes[k], shotTypes[j]] = [shotTypes[j], shotTypes[k]]
      }

      let t = time
      for (let k = 0; k < maxShots; k++) {
        t += (maxShots - k) * (maxShots - k) * si
        this.fireSchedule.push({ at: t, shot: shotTypes[k] })
      }
    }

    if (this.fireSchedule.length === 0) return -1

    if (time >= this.fireSchedule[0].at) {
      // Defer (don't discard) if hero is too close — retry next frame
      if (Math.abs(this.sprite.x - heroX) < minFireDist) return -1
      const { shot } = this.fireSchedule.shift()!
      return shot
    }
    return -1
  }

  get isOffScreen(): boolean { return this.sprite.x < -120 }
}
