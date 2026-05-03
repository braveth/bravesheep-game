import Phaser from 'phaser'
import { HERO_PHYSICS, WORLD } from '../config/physics'

type HeroState = 'idle' | 'run' | 'jump' | 'fall' | 'duck'

// Hitbox dimensions (relative to 32×48 sprite with default center origin)
const STAND_W = 18, STAND_H = 34   // height matches FatCat/turret enemy hitbox height
const DUCK_W  = 22, DUCK_H  = 16

// Offset helpers: align hitbox to the BOTTOM of the sprite so feet stay
// planted on the ground when switching stand ↔ duck.
const STAND_OX = (32 - STAND_W) / 2         // 7
const STAND_OY = 48 - STAND_H               // 14
const DUCK_OX  = (32 - DUCK_W)  / 2         // 5
const DUCK_OY  = 48 - DUCK_H                // 32

export class Hero {
  readonly sprite: Phaser.Physics.Arcade.Sprite

  private scene: Phaser.Scene
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private jumpKey!: Phaser.Input.Keyboard.Key

  private state: HeroState = 'idle'
  private isDucking = false

  // Damage
  hp    = 3
  maxHp = 3
  private invincibleUntil = 0
  private readonly INVINCIBILITY_MS = 1200
  private readonly STOMP_BOUNCE_VY  = -320

  // Coyote time: timestamp of the last frame the hero was on the ground
  private lastGroundTime = 0
  // Jump buffer: timestamp of the last jump key press
  private jumpPressedTime = -9999
  // True from the moment of a jump until the hero lands again
  private hasJumped = false

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene  = scene
    this.sprite = scene.physics.add.sprite(x, y, 'hero')

    const body = this.body()
    body.setGravityY(HERO_PHYSICS.GRAVITY)
    body.setMaxVelocityY(HERO_PHYSICS.MAX_FALL_SPEED)
    body.setCollideWorldBounds(true)
    this.applyStandHitbox()

    this.cursors = scene.input.keyboard!.createCursorKeys()
    this.jumpKey = scene.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    )
  }

  // ── Called every frame from Game scene ─────────────────────────────────
  update(time: number, delta: number): void {
    const body = this.body()
    const dt   = delta / 1000   // seconds

    const onGround = body.blocked.down
    if (onGround) this.lastGroundTime = time

    // Consume jump input once per press and store timestamp
    const jumpJustPressed =
      Phaser.Input.Keyboard.JustDown(this.jumpKey) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up)
    if (jumpJustPressed) this.jumpPressedTime = time

    const jumpHeld  = this.jumpKey.isDown   || this.cursors.up.isDown
    const duckHeld  = this.cursors.down.isDown
    const leftHeld  = this.cursors.left.isDown
    const rightHeld = this.cursors.right.isDown

    // ── Duck ──────────────────────────────────────────────────────────────
    const wantDuck = duckHeld && onGround
    if (wantDuck !== this.isDucking) {
      this.isDucking = wantDuck
      wantDuck ? this.applyDuckHitbox() : this.applyStandHitbox()
    }

    // ── Horizontal movement ───────────────────────────────────────────────
    if (this.isDucking) {
      // Crouched run: keep duck hitbox but allow half-speed horizontal movement
      const duckSpeed = HERO_PHYSICS.GROUND_SPEED * 0.55
      if (leftHeld) {
        body.setVelocityX(Math.max(body.velocity.x - HERO_PHYSICS.ACCELERATION * dt, -duckSpeed))
        this.sprite.setFlipX(true)
      } else if (rightHeld) {
        body.setVelocityX(Math.min(body.velocity.x + HERO_PHYSICS.ACCELERATION * dt, duckSpeed))
        this.sprite.setFlipX(false)
      } else {
        this.applyDecel(body, HERO_PHYSICS.DECELERATION, dt)
      }
    } else {
      const isAir    = !onGround
      const maxSpeed = isAir ? HERO_PHYSICS.AIR_SPEED    : HERO_PHYSICS.GROUND_SPEED
      const accel    = isAir ? HERO_PHYSICS.AIR_ACCELERATION : HERO_PHYSICS.ACCELERATION
      const decel    = isAir ? HERO_PHYSICS.AIR_DECELERATION : HERO_PHYSICS.DECELERATION

      if (leftHeld) {
        body.setVelocityX(Math.max(body.velocity.x - accel * dt, -maxSpeed))
        this.sprite.setFlipX(true)
      } else if (rightHeld) {
        body.setVelocityX(Math.min(body.velocity.x + accel * dt, maxSpeed))
        this.sprite.setFlipX(false)
      } else {
        this.applyDecel(body, decel, dt)
      }
    }

    // ── Jump ──────────────────────────────────────────────────────────────
    if (!this.isDucking) {
      const coyoteOk = (time - this.lastGroundTime) < HERO_PHYSICS.COYOTE_TIME
      const bufferOk = (time - this.jumpPressedTime) < HERO_PHYSICS.JUMP_BUFFER

      if (coyoteOk && bufferOk && !this.hasJumped) {
        body.setVelocityY(HERO_PHYSICS.JUMP_VELOCITY)
        this.hasJumped    = true
        this.jumpPressedTime = -9999   // consume buffer
      }
    }

    // Variable jump height: lower gravity while ascending + holding jump
    if (this.hasJumped && jumpHeld && body.velocity.y < 0) {
      body.setGravityY(HERO_PHYSICS.JUMP_HOLD_GRAVITY)
    } else {
      body.setGravityY(HERO_PHYSICS.GRAVITY)
    }

    // Reset jump flag on landing
    if (onGround) this.hasJumped = false

    // ── Derive display state ──────────────────────────────────────────────
    this.updateState(body, onGround)
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  private body(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body
  }

  private applyStandHitbox(): void {
    this.body().setSize(STAND_W, STAND_H).setOffset(STAND_OX, STAND_OY)
  }

  private applyDuckHitbox(): void {
    this.body().setSize(DUCK_W, DUCK_H).setOffset(DUCK_OX, DUCK_OY)
  }

  private applyDecel(
    body: Phaser.Physics.Arcade.Body,
    rate: number,
    dt: number
  ): void {
    const drag = rate * dt
    if (Math.abs(body.velocity.x) <= drag) {
      body.setVelocityX(0)
    } else {
      body.setVelocityX(body.velocity.x - Math.sign(body.velocity.x) * drag)
    }
  }

  private updateState(
    body: Phaser.Physics.Arcade.Body,
    onGround: boolean
  ): void {
    let next: HeroState
    if (this.isDucking) {
      next = 'duck'
    } else if (!onGround) {
      next = body.velocity.y < 0 ? 'jump' : 'fall'
    } else {
      next = Math.abs(body.velocity.x) > 10 ? 'run' : 'idle'
    }
    if (next !== this.state) {
      this.state = next
      // TODO P1: this.sprite.play(next)
    }
  }

  get currentState(): HeroState { return this.state }

  get isDead(): boolean { return this.hp <= 0 }

  /**
   * Returns true if damage was taken (false if still invincible).
   * Triggers a white-flash + alpha-flicker on the sprite.
   */
  takeDamage(time: number): boolean {
    if (time < this.invincibleUntil) return false
    this.hp = Math.max(0, this.hp - 1)
    this.invincibleUntil = time + this.INVINCIBILITY_MS
    // Flicker effect
    this.scene.tweens.add({
      targets:  this.sprite,
      alpha:    0,
      duration: 80,
      repeat:   7,
      yoyo:     true,
      onComplete: () => { this.sprite.setAlpha(1) },
    })
    return true
  }

  /** Bounce the hero upward after stomping an enemy. */
  stomp(): void {
    (this.sprite.body as Phaser.Physics.Arcade.Body).setVelocityY(this.STOMP_BOUNCE_VY)
  }

  // Spawn position helper — used by Game scene to place hero on ground
  static spawnY(): number {
    // Body bottom aligns with GROUND_Y; sprite center is above that.
    // With origin (0.5, 0.5): body bottom = sprite.y + 24 → sprite.y = GROUND_Y - 24
    return WORLD.GROUND_Y - 24
  }
}
