import Phaser from 'phaser'
import { WOLF } from '../../config/enemies'
import { TEX } from '../../config/textures'
import { WORLD } from '../../config/world'
import { PackCharger } from './base/PackCharger'
import type { IPackSpawnConfig } from './base/PackCharger'

/**
 * Wolf — fast ground pack-charger (rural).
 * Three wolves spawn wide apart; each charges sequentially after a random gap.
 * Hero cannot jump over all three in one jump.
 */
export class Wolf extends PackCharger {
  static readonly spawnConfig: IPackSpawnConfig = {
    spawnOffsetX: WOLF.SPAWN_OFFSET_X,
    speed:        WOLF.SPEED,
    stagger:      WOLF.PACK_STAGGER,
  }
  constructor(group: Phaser.Physics.Arcade.Group, x: number) {
    const y = WORLD.GROUND_Y - WOLF.SPRITE_H / 2
    super(group, x, y, TEX.WOLF, WOLF.HP)

    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setSize(WOLF.HIT_W, WOLF.HIT_H)
    body.setOffset((WOLF.SPRITE_W - WOLF.HIT_W) / 2, WOLF.SPRITE_H - WOLF.HIT_H)
    body.setGravityY(WOLF.GRAVITY)
    body.setMaxVelocityY(WOLF.MAX_FALL_SPEED)
    body.setCollideWorldBounds(false)
    body.setVelocityX(-WORLD.INITIAL_SCROLL_SPEED)

    this.sprite.setFlipX(true)
  }

  update(time: number, _heroX: number, scrollSpeed: number): void {
    this.advance(time, scrollSpeed, this.chargeSpeed || WOLF.SPEED)
  }
}
