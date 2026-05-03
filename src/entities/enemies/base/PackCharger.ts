import Phaser from 'phaser'
import { BaseEnemy } from './BaseEnemy'
import { WORLD } from '../../../config/physics'

/**
 * Base class for ground pack-chargers (Wolf, Limo).
 *
 * Spawn behaviour:
 *  - All units spawn tightly packed at the right screen edge and scroll in
 *    together at world speed.
 *  - A shared `packTrigger` records the game-time when the pack leader
 *    (first/leftmost unit) enters the viewport.
 *  - Each unit has its own `chargeDelay` (ms after trigger) assigned by the
 *    spawner.  The leader charges immediately (delay = 0), the next after
 *    PACK_STAGGER ms, then the next, etc. — giving a rapid sequential charge.
 */
export abstract class PackCharger extends BaseEnemy {
  /**
   * Shared object whose `armedAt` is set to the current game-time the moment
   * the pack leader enters the viewport.  0 = not yet armed.
   */
  packTrigger: { armedAt: number } | null = null
  /** True for the unit with the smallest spawn X (first to become visible). */
  isPackLeader = false
  /** Ms after packTrigger.armedAt when this unit starts charging. */
  chargeDelay = 0
  /** Charge speed override (px/s).  0 = use the subclass default. */
  chargeSpeed = 0

  protected charging = false

  constructor(
    group:      Phaser.Physics.Arcade.Group,
    x:          number,
    y:          number,
    textureKey: string,
    hp:         number,
  ) {
    super(group, x, y, textureKey, hp)
  }

  /**
   * Sets velocity each frame.
   * Leader arms the trigger when it enters the viewport; each unit starts
   * charging once `time >= trigger.armedAt + chargeDelay`.
   */
  protected advance(time: number, scrollSpeed: number, speed: number): void {
    if (!this.charging && this.packTrigger) {
      if (this.isPackLeader && this.packTrigger.armedAt === 0 && this.sprite.x <= WORLD.WIDTH) {
        this.packTrigger.armedAt = time
      }
      if (this.packTrigger.armedAt > 0 && time >= this.packTrigger.armedAt + this.chargeDelay) {
        this.charging = true
      }
    }
    ;(this.sprite.body as Phaser.Physics.Arcade.Body)
      .setVelocityX(-(scrollSpeed + (this.charging ? speed : 0)))
  }

  get isOffScreen(): boolean { return this.sprite.x < -120 }
}
