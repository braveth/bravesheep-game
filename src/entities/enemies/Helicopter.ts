import Phaser from 'phaser'
import { HELICOPTER } from '../../config/enemies'
import { TEX } from '../../config/textures'
import { AirVehicle } from './base/AirVehicle'

/**
 * Helicopter — rural air enemy.
 * Spawns on the opposite side of the hero, flies in, and drops
 * NINJA_DROP_COUNT ninjas in tight sequential bursts starting at DROP_LEAD
 * px ahead of the hero.  Each ninja is released at the helicopter's current X.
 */
export class Helicopter extends AirVehicle {
  constructor(group: Phaser.Physics.Arcade.Group, heroX: number) {
    const flyY = Phaser.Math.Between(HELICOPTER.FLY_Y_MIN, HELICOPTER.FLY_Y_MAX)
    super(
      group, heroX, flyY, TEX.HELICOPTER,
      HELICOPTER.HP, HELICOPTER.SPEED, HELICOPTER.DROP_LEAD,
      80,  // spawnOffset: how far past screen edge
    )

    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setSize(HELICOPTER.HIT_W, HELICOPTER.HIT_H)
    body.setOffset(
      (HELICOPTER.SPRITE_W - HELICOPTER.HIT_W) / 2,
      (HELICOPTER.SPRITE_H - HELICOPTER.HIT_H) / 2,
    )
  }

  /**
   * Returns the sequential drop index (0–2) when it's time to release that
   * ninja, -1 otherwise.  Spawner drops a Ninja at this.sprite.x each time.
   */
  update(time: number, _heroX: number, scrollSpeed: number, dropCount: number, speedFactor: number): number {
    const iv = HELICOPTER.DROP_INTERVAL * speedFactor
    return this.tickDrops(time, scrollSpeed, HELICOPTER.SPEED, iv, iv, dropCount)
  }
}
