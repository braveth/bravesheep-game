import { BOMB } from '../../config/enemies'
import { TEX } from '../../config/textures'
import { WORLD } from '../../config/world'

import { BaseAirdrop } from './base/BaseAirdrop'
import type Phaser from 'phaser'

const RAD_TO_DEG = 180 / Math.PI

/**
 * Missile — dropped by Airplane.
 * Homes on the hero's X position while falling, rotating to face its travel
 * direction.  Locks onto its current trajectory once within HERO_SAFE_DISTANCE
 * and destroys on ground contact.
 */
export class Bomb extends BaseAirdrop {
  readonly sprite: Phaser.Physics.Arcade.Sprite
  private locked = false
  private readonly speed: number

  constructor(group: Phaser.Physics.Arcade.Group, dropX: number, dropY: number, _heroX: number, scrollSpeed: number) {
    super()
    this.speed  = Math.min(BOMB.SPEED * (scrollSpeed / WORLD.INITIAL_SCROLL_SPEED), BOMB.SPEED_MAX)
    this.sprite = group.create(dropX, dropY, TEX.BOMB) as Phaser.Physics.Arcade.Sprite

    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setSize(BOMB.HIT_W, BOMB.HIT_H)
    body.setOffset(
      (BOMB.SPRITE_W - BOMB.HIT_W) / 2,
      (BOMB.SPRITE_H - BOMB.HIT_H) / 2,
    )
    body.setAllowGravity(false)
    body.setCollideWorldBounds(false)
    body.setVelocity(0, this.speed)
  }

  tick(_time: number, heroX: number, _scrollSpeed: number): boolean {
    const body  = this.sprite.body as Phaser.Physics.Arcade.Body
    const speed = this.speed

    if (body.blocked.down) return true

    if (!this.locked) {
      const dx   = heroX - this.sprite.x
      const dy   = WORLD.GROUND_Y - this.sprite.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist <= BOMB.HERO_SAFE_DISTANCE) {
        // within lock range (2D) — stop steering, keep current velocity
        this.locked = true
      } else {
        // steer toward hero's current position every frame — true homing
        body.setVelocity(
          (dx / dist) * speed,
          (dy / dist) * speed,
        )
      }
    }

    // rotate sprite to face direction of travel (texture nose points right at 0°)
    const { x: vx, y: vy } = body.velocity
    if (vx !== 0 || vy !== 0) {
      this.sprite.setAngle(Math.atan2(vy, vx) * RAD_TO_DEG)
    }

    return this.isOffScreen
  }

  get isOffScreen(): boolean {
    return this.sprite.x < -160 || this.sprite.x > WORLD.WIDTH + 160
  }
}
