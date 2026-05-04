import Phaser from 'phaser'
import { FAT_CAT } from '../../config/enemies'
import { WORLD } from '../../config/world'
import { LaserTurret } from './base/LaserTurret'

/**
 * FatCat — stationary laser turret (rural).
 * Scrolls at world speed, fires a horizontal beam at fixed mid-screen height.
 * Hero must jump over or duck under.
 */
export class FatCat extends LaserTurret {
  constructor(scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group, x: number) {
    const y = WORLD.GROUND_Y - FAT_CAT.SPRITE_H / 2
    super(scene, group, x, y, 'fatcat', FAT_CAT.HP)

    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setSize(FAT_CAT.HIT_W, FAT_CAT.HIT_H)
    body.setOffset((FAT_CAT.SPRITE_W - FAT_CAT.HIT_W) / 2, FAT_CAT.SPRITE_H - FAT_CAT.HIT_H)
    body.setAllowGravity(false)
    body.setCollideWorldBounds(false)

    this.sprite.setFlipX(true)
  }

  /** Returns 0 (head shot), 1 (low shot), or -1 (no fire) this frame. */
  update(time: number, scrollSpeed: number, heroX: number, maxShots: number, speedFactor: number): 0 | 1 | -1 {
    return this.tickLaser(time, scrollSpeed, maxShots, heroX, FAT_CAT.MIN_FIRE_DIST, speedFactor)
  }
}
