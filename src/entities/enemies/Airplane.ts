import Phaser from 'phaser'
import { AIRPLANE } from '../../config/enemies'
import { AirVehicle } from './base/AirVehicle'

/**
 * Airplane — urban air enemy.
 * Spawns on the opposite side of the hero, flies in, and drops
 * BOMB_DROP_COUNT bombs in tight sequential bursts starting at DROP_LEAD
 * px ahead of the hero.  Each bomb is released at the plane's current X.
 */
export class Airplane extends AirVehicle {
  constructor(group: Phaser.Physics.Arcade.Group, heroX: number) {
    super(
      group, heroX, AIRPLANE.FLY_Y, 'airplane',
      AIRPLANE.HP, AIRPLANE.SPEED, AIRPLANE.DROP_LEAD,
      50,  // spawnOffset
    )

    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setSize(AIRPLANE.HIT_W, AIRPLANE.HIT_H)
    body.setOffset(
      (AIRPLANE.SPRITE_W - AIRPLANE.HIT_W) / 2,
      (AIRPLANE.SPRITE_H - AIRPLANE.HIT_H) / 2,
    )
  }

  /**
   * Returns the sequential drop index (0–2) when it's time to release that
   * bomb, -1 otherwise.  Spawner drops a Bomb at this.sprite.x each time.
   */
  update(time: number, _heroX: number, scrollSpeed: number, dropCount: number, speedFactor: number): number {
    return this.tickDrops(
      time, scrollSpeed, AIRPLANE.SPEED,
      AIRPLANE.DROP_INTERVAL_MIN * speedFactor, AIRPLANE.DROP_INTERVAL_MAX * speedFactor,
      dropCount,
    )
  }
}
