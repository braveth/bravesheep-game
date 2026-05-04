import Phaser from 'phaser'
import { BOSS } from '../../config/enemies'
import { WORLD } from '../../config/world'

type BossPhase = 'enter' | 'idle' | 'charge' | 'return' | 'dead'

/**
 * Boss — biome-specific arena boss.
 * Rural biome → Boss Wolf (large, charges back and forth).
 * Urban biome  → Boss Cat  (large, fires rapid lasers).
 *
 * The boss enters from the right, stops near WORLD.WIDTH * 0.70,
 * then alternates between an idle pause and a charge at the hero.
 */
export class Boss {
  readonly sprite: Phaser.Physics.Arcade.Sprite

  private phase:     BossPhase = 'enter'
  private nextPhaseTime = 0
  private readonly heroRef: { x: number }

  // For laser fire (urban boss)
  private nextFireTime = 0
  private readonly isUrban: boolean

  // x at which the boss "parks" after entering
  private readonly arenaX: number

  constructor(
    group:   Phaser.Physics.Arcade.Group,
    biome:   'rural' | 'urban',
    heroRef: { x: number },
  ) {
    this.isUrban = biome === 'urban'
    this.heroRef = heroRef
    this.arenaX  = WORLD.WIDTH * 0.68

    const texKey = this.isUrban ? 'boss-cat' : 'boss-wolf'
    const y      = WORLD.GROUND_Y - BOSS.SPRITE_H / 2

    this.sprite = group.create(WORLD.WIDTH + BOSS.SPRITE_W, y, texKey) as Phaser.Physics.Arcade.Sprite

    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setSize(BOSS.HIT_W, BOSS.HIT_H)
    body.setOffset(
      (BOSS.SPRITE_W - BOSS.HIT_W) / 2,
      BOSS.SPRITE_H - BOSS.HIT_H,
    )
    body.setGravityY(800)
    body.setMaxVelocityY(800)
    body.setCollideWorldBounds(false)
    this.sprite.setFlipX(true)  // face left toward hero
    this.sprite.setData('hp', BOSS.HP)
  }

  /**
   * Returns a laser Y coordinate if the boss fires this frame, otherwise -1.
   */
  update(time: number, scrollSpeed: number): number {
    void scrollSpeed
    const body = this.sprite.body as Phaser.Physics.Arcade.Body

    if (this.phase === 'enter') {
      // Slide in from right until reaching arena position
      body.setVelocityX(-200)
      if (this.sprite.x <= this.arenaX) {
        body.setVelocityX(0)
        this.phase         = 'idle'
        this.nextPhaseTime = time + 800
        this.nextFireTime  = time + 1200
      }
      return -1
    }

    if (this.phase === 'idle') {
      body.setVelocityX(0)

      // Urban boss: fire lasers while idling
      if (this.isUrban && time >= this.nextFireTime) {
        this.nextFireTime = time + 700
        return this.sprite.y
      }

      if (time >= this.nextPhaseTime) {
        this.phase         = 'charge'
        this.nextPhaseTime = time + 600   // duration of charge sprint
        this.sprite.setFlipX(true)
        body.setVelocityX(-BOSS.SPEED * 2.5)
      }
      return -1
    }

    if (this.phase === 'charge') {
      // Rural boss: keep charging speed; stop if reaching left quarter
      if (time >= this.nextPhaseTime || this.sprite.x < WORLD.WIDTH * 0.15) {
        body.setVelocityX(0)
        this.sprite.setFlipX(false)
        // Walk back to arena position
        this.phase         = 'return'
        this.nextPhaseTime = time + 1000
      }
      return -1
    }

    if (this.phase === 'return') {
      // Slide back to arena x
      if (this.sprite.x < this.arenaX) {
        body.setVelocityX(120)
        this.sprite.setFlipX(false)
      } else {
        body.setVelocityX(0)
        this.sprite.setFlipX(true)
        this.phase         = 'idle'
        this.nextPhaseTime = time + BOSS.CHARGE_PAUSE
        this.nextFireTime  = time + 500
      }
      return -1
    }

    return -1
  }

  get hp():          number  { return this.sprite.getData('hp') as number }
  get isDead():      boolean { return this.hp <= 0 }

  damage(): void {
    const next = this.hp - 1
    this.sprite.setData('hp', next)
    if (next <= 0) {
      this.phase = 'dead'
      ;(this.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0)
      this.sprite.setAlpha(0.3)
    } else {
      // Flash red briefly
      this.sprite.setTint(0xff4444)
      this.sprite.scene.time.delayedCall(120, () => {
        if (this.sprite.active) this.sprite.clearTint()
      })
    }
  }
}
