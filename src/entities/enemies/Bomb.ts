import Phaser from 'phaser'
import { BOMB, AIRPLANE } from '../../config/enemies'
import { TEX } from '../../config/textures'
import { WORLD } from '../../config/world'
import { BaseAirdrop } from './base/BaseAirdrop'

/**
 * Bomb — dropped by Airplane.
 * Starts at drop X with an initial horizontal velocity aimed at heroX.
 * Bounces on the ground (Arcade Physics bounce) up to MAX_BOUNCES times.
 * Only damages the hero on direct contact — it does NOT explode on landing.
 */
export class Bomb extends BaseAirdrop {
  readonly sprite: Phaser.Physics.Arcade.Sprite

  private bounceCount  = 0
  private wasOnGround  = false

  constructor(group: Phaser.Physics.Arcade.Group, dropX: number, dropY: number, heroX: number) {
    super()
    this.sprite = group.create(dropX, dropY, TEX.BOMB) as Phaser.Physics.Arcade.Sprite

    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setSize(BOMB.HIT_W, BOMB.HIT_H)
    body.setOffset(
      (BOMB.SPRITE_W - BOMB.HIT_W) / 2,
      (BOMB.SPRITE_H - BOMB.HIT_H) / 2,
    )
    body.setGravityY(BOMB.GRAVITY)
    body.setMaxVelocityY(BOMB.MAX_FALL_SPEED)
    body.setCollideWorldBounds(false)
    body.setBounce(0, BOMB.BOUNCE)

    // Aim initial horizontal velocity toward hero
    const dx = heroX - dropX
    // Time of first fall from dropY to GROUND_Y under gravity
    const fallH   = WORLD.GROUND_Y - dropY - BOMB.SPRITE_H
    const tFall   = Math.sqrt((2 * fallH) / BOMB.GRAVITY)
    const rawVx   = fallH > 0 ? dx / tFall : 0
    body.setVelocityX(Phaser.Math.Clamp(rawVx, -380, 380))
  }

  /** Called each frame. Returns true when the bomb should be removed. */
  tick(_time: number, _heroX: number, _scrollSpeed: number): boolean {
    const body     = this.sprite.body as Phaser.Physics.Arcade.Body
    const onGround = body.blocked.down

    if (onGround && !this.wasOnGround) {
      this.bounceCount++
    }
    this.wasOnGround = onGround

    return this.bounceCount >= BOMB.MAX_BOUNCES || this.isOffScreen
  }

  get isOffScreen(): boolean {
    return this.sprite.x < -160 || this.sprite.x > WORLD.WIDTH + 160
  }
}
