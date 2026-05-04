import Phaser from 'phaser'
import { LIMO } from '../../config/enemies'
import { TEX } from '../../config/textures'
import { WORLD } from '../../config/world'
import { PackCharger } from './base/PackCharger'

/**
 * Limo — fast ground pack-charger (urban), mirrors Wolf behaviour.
 * Three limos spawn wide apart; each charges sequentially after a random gap.
 */
export class Limo extends PackCharger {
  constructor(group: Phaser.Physics.Arcade.Group, x: number) {
    const y = WORLD.GROUND_Y - LIMO.SPRITE_H / 2
    super(group, x, y, TEX.LIMO, LIMO.HP)

    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setSize(LIMO.HIT_W, LIMO.HIT_H)
    body.setOffset((LIMO.SPRITE_W - LIMO.HIT_W) / 2, LIMO.SPRITE_H - LIMO.HIT_H)
    body.setAllowGravity(false)
    body.setCollideWorldBounds(false)
    body.setVelocityX(-WORLD.INITIAL_SCROLL_SPEED)
  }

  update(time: number, scrollSpeed: number): void {
    this.advance(time, scrollSpeed, this.chargeSpeed || LIMO.SPEED)
  }
}

