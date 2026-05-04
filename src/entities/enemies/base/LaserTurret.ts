import Phaser from 'phaser'
import { BaseEnemy } from './BaseEnemy'
import { LASER_TURRET } from '../../../config/enemies'
import { WORLD } from '../../../config/world'
import { LaserTurretSpawner } from '../../spawners/LaserTurretSpawner'

export interface ITurretSpawnConfig {
  spawnOffsetX: number
}

/** Constructor type that enforces a static spawnConfig is present. */
export type LaserTurretClass<T extends LaserTurret = LaserTurret> = {
  new(scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group, x: number): T
  readonly spawnConfig: ITurretSpawnConfig
}

export abstract class LaserTurret extends BaseEnemy {
  static readonly spawner = LaserTurretSpawner
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

      // Gaps between shots are quadratic-decreasing (largest gap first, tightest last).
      // Shot 0 fires immediately; only inter-shot gaps consume the window.
      // gapSum = sum of j² for j=1..(n-1) = (n-1)*n*(2n-1)/6
      const window  = LASER_TURRET.FIRE_WINDOW * speedFactor
      const n       = maxShots
      const gapSum  = (n - 1) * n * (2 * n - 1) / 6
      const si      = gapSum > 0 ? window / gapSum : 0

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

      // Push shot 0 immediately, then add descending quadratic gap before each next shot.
      let t = time
      for (let k = 0; k < maxShots; k++) {
        this.fireSchedule.push({ at: t, shot: shotTypes[k] })
        t += (n - 1 - k) * (n - 1 - k) * si   // gap after this shot; 0 after last
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

  abstract update(time: number, scrollSpeed: number, heroX: number, maxShots: number, speedFactor: number): 0 | 1 | -1

  get isOffScreen(): boolean { return this.sprite.x < -120 }
}
