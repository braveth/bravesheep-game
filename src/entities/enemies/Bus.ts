import Phaser from 'phaser'
import { BUS } from '../../config/enemies'
import { WORLD } from '../../config/world'
import { LaserTurret } from './base/LaserTurret'

/**
 * Bus — stationary laser turret (urban), mirrors FatCat behaviour.
 * Scrolls at world speed, fires a horizontal beam at fixed mid-screen height.
 * Hero must jump over or duck under.
 */
export class Bus extends LaserTurret {
  constructor(scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group, x: number) {
    const y = WORLD.GROUND_Y - BUS.SPRITE_H / 2
    super(scene, group, x, y, 'bus', BUS.HP)

    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setSize(BUS.HIT_W, BUS.HIT_H)
    body.setOffset((BUS.SPRITE_W - BUS.HIT_W) / 2, BUS.SPRITE_H - BUS.HIT_H)
    body.setAllowGravity(false)
    body.setCollideWorldBounds(false)
  }

  /** Returns 0 (head shot), 1 (low shot), or -1 (no fire) this frame. */
  update(time: number, scrollSpeed: number, heroX: number, maxShots: number, speedFactor: number): 0 | 1 | -1 {
    return this.tickLaser(time, scrollSpeed, maxShots, heroX, BUS.MIN_FIRE_DIST, speedFactor)
  }
}
