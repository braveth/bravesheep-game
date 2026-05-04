import Phaser from 'phaser'
import { BOSS, LASER_TURRET } from '../../../config/enemies'
import { WORLD } from '../../../config/world'

type BossPhase = 'enter' | 'idle' | 'charge' | 'return' | 'dead'

export abstract class BaseBoss {
  readonly sprite: Phaser.Physics.Arcade.Sprite

  protected phase:         BossPhase = 'enter'
  protected nextPhaseTime  = 0

  private readonly arenaX: number

  constructor(
    group:   Phaser.Physics.Arcade.Group,
    texKey:  string,
    heroRef: { x: number },
  ) {
    void heroRef
    this.arenaX = WORLD.WIDTH * BOSS.ARENA_X_FRAC

    const y = WORLD.GROUND_Y - BOSS.SPRITE_H / 2
    this.sprite = group.create(WORLD.WIDTH + BOSS.SPRITE_W, y, texKey) as Phaser.Physics.Arcade.Sprite

    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setSize(BOSS.HIT_W, BOSS.HIT_H)
    body.setOffset((BOSS.SPRITE_W - BOSS.HIT_W) / 2, BOSS.SPRITE_H - BOSS.HIT_H)
    body.setGravityY(BOSS.GRAVITY)
    body.setMaxVelocityY(BOSS.MAX_FALL_SPEED)
    body.setCollideWorldBounds(false)
    this.sprite.setFlipX(true)
    this.sprite.setData('hp', BOSS.HP)
  }

  /** Determines whether the hero contact should count as a stomp. */
  static isStomped(
    heroBody: Phaser.Physics.Arcade.Body,
    bossBody: Phaser.Physics.Arcade.Body,
  ): boolean {
    return heroBody.velocity.y > 60 && heroBody.bottom <= bossBody.top + 12
  }

  /** Laser projectile parameters used by EnemySpawner.tickBoss. */
  readonly laserConfig = {
    width:  LASER_TURRET.WIDTH,
    height: LASER_TURRET.HEIGHT,
    speed:  Math.round(LASER_TURRET.SPEED * 1.5),
  } as const

  /**
   * Called each frame while the boss is idling.
   * Return a Y coordinate to fire a laser from, or -1 for nothing.
   */
  protected abstract onIdle(time: number): number

  /** Called once when the boss finishes entering (override to init timers). */
  protected onEntered(_time: number): void {}

  /** Called once when the boss finishes returning to arena (override to reset timers). */
  protected onReturned(_time: number): void {}

  update(time: number): number {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body

    if (this.phase === 'enter') {
      body.setVelocityX(-200)
      if (this.sprite.x <= this.arenaX) {
        body.setVelocityX(0)
        this.phase         = 'idle'
        this.nextPhaseTime = time + BOSS.ENTER_PAUSE
        this.onEntered(time)
      }
      return -1
    }

    if (this.phase === 'idle') {
      body.setVelocityX(0)
      const laserY = this.onIdle(time)
      if (laserY !== -1) return laserY
      if (time >= this.nextPhaseTime) {
        this.phase         = 'charge'
        this.nextPhaseTime = time + 600
        this.sprite.setFlipX(true)
        body.setVelocityX(-BOSS.SPEED * 2.5)
      }
      return -1
    }

    if (this.phase === 'charge') {
      if (time >= this.nextPhaseTime || this.sprite.x < WORLD.WIDTH * 0.15) {
        body.setVelocityX(0)
        this.sprite.setFlipX(false)
        this.phase         = 'return'
        this.nextPhaseTime = time + 1000
      }
      return -1
    }

    if (this.phase === 'return') {
      if (this.sprite.x < this.arenaX) {
        body.setVelocityX(120)
        this.sprite.setFlipX(false)
      } else {
        body.setVelocityX(0)
        this.sprite.setFlipX(true)
        this.phase         = 'idle'
        this.nextPhaseTime = time + BOSS.CHARGE_PAUSE
        this.onReturned(time)
      }
      return -1
    }

    return -1
  }

  get hp():     number  { return this.sprite.getData('hp') as number }
  get isDead(): boolean { return this.hp <= 0 }

  damage(): void {
    const next = this.hp - 1
    this.sprite.setData('hp', next)
    if (next <= 0) {
      this.phase = 'dead'
      ;(this.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0)
      this.sprite.setAlpha(0.3)
    } else {
      this.sprite.setTint(0xff4444)
      this.sprite.scene.time.delayedCall(120, () => {
        if (this.sprite.active) this.sprite.clearTint()
      })
    }
  }
}
