import Phaser from 'phaser'
import { BaseEnemy } from './BaseEnemy'
import { WORLD } from '../../../config/physics'

/**
 * Base class for air vehicles that drop payloads (Helicopter, Airplane).
 *
 * Spawn side is chosen by hero position:
 *   hero on left  → vehicle spawns from right, flies left
 *   hero on right → vehicle spawns from left,  flies right
 *
 * Drops are sequential: each payload is released at the vehicle's current X
 * with a random interval between them (tightly sequential trail effect).
 *
 * Subclass constructor responsibility:
 *  - Call super() with all params
 *  - Set hitbox (body.setSize / setOffset) — base handles gravity/velocity/flip
 */
export abstract class AirVehicle extends BaseEnemy {
  readonly spawnFromRight: boolean

  protected readonly dropTriggerX: number
  protected dropSchedule: number[] = []
  protected dropIndex               = 0

  constructor(
    group:        Phaser.Physics.Arcade.Group,
    heroX:        number,
    y:            number,
    textureKey:   string,
    hp:           number,
    speed:        number,
    dropLead:     number,   // px ahead of hero where first payload releases
    spawnOffset:  number,   // px past screen edge to spawn at
  ) {
    const spawnFromRight = heroX < WORLD.WIDTH / 2
    const spawnX         = spawnFromRight ? WORLD.WIDTH + spawnOffset : -spawnOffset

    super(group, spawnX, y, textureKey, hp)

    this.spawnFromRight = spawnFromRight
    this.dropTriggerX   = spawnFromRight
      ? heroX + dropLead     // coming from right → trigger to hero's right
      : heroX - dropLead     // coming from left  → trigger to hero's left

    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setCollideWorldBounds(false)
    body.setVelocityX(
      spawnFromRight
        ? -(WORLD.INITIAL_SCROLL_SPEED + speed)
        :  (WORLD.INITIAL_SCROLL_SPEED + speed),
    )
    this.sprite.setFlipX(spawnFromRight)
  }

  /**
   * Advances one frame.  Returns the sequential drop index (0, 1, …, count-1)
   * when it's time to release the next payload, -1 otherwise.
   * EnemySpawner spawns the actual payload at the vehicle's current sprite.x.
   */
  protected tickDrops(
    time:        number,
    scrollSpeed: number,
    speed:       number,
    intervalMin: number,
    intervalMax: number,
    count:       number,
  ): number {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setVelocityX(
      this.spawnFromRight
        ? -(scrollSpeed + speed)
        :  (scrollSpeed + speed),
    )

    // Arm the sequential schedule the first time we cross the trigger point
    if (this.dropSchedule.length === 0) {
      const past = this.spawnFromRight
        ? this.sprite.x <= this.dropTriggerX
        : this.sprite.x >= this.dropTriggerX
      if (past) {
        const schedule = [time]
        for (let i = 1; i < count; i++) {
          schedule.push(schedule[i - 1] + Phaser.Math.Between(intervalMin, intervalMax))
        }
        this.dropSchedule = schedule
      }
    }

    if (this.dropIndex < this.dropSchedule.length && time >= this.dropSchedule[this.dropIndex]) {
      return this.dropIndex++
    }
    return -1
  }

  get isOffScreen(): boolean {
    return this.spawnFromRight
      ? this.sprite.x < -200
      : this.sprite.x > WORLD.WIDTH + 200
  }

  /** Dims sprite when shot down. */
  damage(): void {
    super.damage()
    if (this.isDead) this.sprite.setAlpha(0.3)
  }
}
