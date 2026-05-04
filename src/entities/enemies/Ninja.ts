import Phaser from 'phaser'
import { NINJA } from '../../config/enemies'
import { WORLD } from '../../config/world'

/**
 * Ninja — drops from Helicopter, then BOUNCES toward the hero.
 * Each time it lands it launches a high arc aimed at the hero's current X.
 * The player must duck under the arc or move out of the way.
 * No shuriken — pure jump threat.
 */
export class Ninja {
  readonly sprite: Phaser.Physics.Arcade.Sprite

  private inAir          = true   // true while still falling from drop
  private nextJumpTime   = 0
  // Direction locked at drop time — never re-targets hero after first bounce
  private readonly moveDir: number

  constructor(group: Phaser.Physics.Arcade.Group, x: number, dropY: number, heroX: number) {
    // +1 = move right (hero is right of drop), -1 = move left
    this.moveDir = heroX >= x ? 1 : -1

    this.sprite = group.create(x, dropY, 'ninja') as Phaser.Physics.Arcade.Sprite

    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setSize(NINJA.HIT_W, NINJA.HIT_H)
    body.setOffset(
      (NINJA.SPRITE_W - NINJA.HIT_W) / 2,
      NINJA.SPRITE_H - NINJA.HIT_H,
    )
    body.setGravityY(NINJA.GRAVITY)
    body.setMaxVelocityY(900)
    body.setCollideWorldBounds(false)
    body.setVelocityX(0)  // drop straight down initially

    this.sprite.setFlipX(this.moveDir < 0)
    this.sprite.setData('hp', NINJA.HP)
  }

  update(time: number, _heroX: number, _scrollSpeed: number): void {
    const body     = this.sprite.body as Phaser.Physics.Arcade.Body
    const onGround = body.blocked.down

    if (onGround) {
      if (this.inAir) {
        // Just landed — schedule jump
        this.inAir        = false
        this.nextJumpTime = time + NINJA.JUMP_COOLDOWN
      }

      if (time >= this.nextJumpTime) {
        // Bounce in locked direction at constant horizontal speed
        body.setVelocityX(this.moveDir * NINJA.JUMP_HVX)
        body.setVelocityY(NINJA.JUMP_VELOCITY)
        this.inAir = true
      }
    }
  }

  get hp():          number  { return this.sprite.getData('hp') as number }
  get isDead():      boolean { return this.hp <= 0 }
  get isOffScreen(): boolean { return this.sprite.x < -160 || this.sprite.x > WORLD.WIDTH + 160 }

  damage(): void {
    this.sprite.setData('hp', this.hp - 1)
  }
}
