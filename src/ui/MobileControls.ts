import Phaser from 'phaser'
import { WORLD } from '../config/physics'

export interface VirtualInput {
  left:  boolean
  right: boolean
  up:    boolean   // jump
  down:  boolean   // duck
}

// ─── Layout constants ────────────────────────────────────────────────────────
const STICK_R  = 52   // outer ring radius
const KNOB_R   = 24   // draggable knob radius
const BTN_R    = 34   // action button radius
const ALPHA    = 0.45

const STICK_CX = STICK_R + 20
const STICK_CY = WORLD.HEIGHT - STICK_R - 20

const JUMP_CX  = WORLD.WIDTH  - BTN_R - 24
const JUMP_CY  = WORLD.HEIGHT - BTN_R - 24

export class MobileControls {
  readonly input: VirtualInput = { left: false, right: false, up: false, down: false }

  private knob:     Phaser.GameObjects.Arc
  private jumpBtnBg: Phaser.GameObjects.Arc

  // Pointer ID tracking so stick and button don't steal each other
  private stickPtrId: number | null = null
  private jumpPtrId:  number | null = null

  constructor(scene: Phaser.Scene) {
    // Show only on touch devices, or always in DEV mode
    if (!scene.sys.game.device.input.touch && !import.meta.env.DEV) return

    // ── Joystick ──────────────────────────────────────────────────────────
    const ring = scene.add.circle(STICK_CX, STICK_CY, STICK_R, 0xffffff, 0.15)
      .setDepth(60)
      .setStrokeStyle(2, 0xffffff, ALPHA)
      .setInteractive()

    // Direction wedge guides (just 4 lines from centre)
    const g = scene.add.graphics().setDepth(60).setAlpha(ALPHA * 0.6)
    for (const angle of [0, 90, 180, 270]) {
      const rad = Phaser.Math.DegToRad(angle)
      g.lineStyle(1, 0xffffff, 1)
      g.lineBetween(
        STICK_CX, STICK_CY,
        STICK_CX + Math.cos(rad) * STICK_R,
        STICK_CY + Math.sin(rad) * STICK_R,
      )
    }

    this.knob = scene.add.circle(STICK_CX, STICK_CY, KNOB_R, 0xffffff, ALPHA)
      .setDepth(61)

    // ── Jump button ───────────────────────────────────────────────────────
    this.jumpBtnBg = scene.add.circle(JUMP_CX, JUMP_CY, BTN_R, 0x44aaff, ALPHA)
      .setDepth(60)
      .setStrokeStyle(2, 0xffffff, ALPHA)
      .setInteractive()

    scene.add.text(JUMP_CX, JUMP_CY, 'JUMP', {
      fontSize: '13px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(62).setAlpha(ALPHA + 0.2)

    // ── Touch events (joystick) ───────────────────────────────────────────
    scene.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      // Claim stick if pointer is in left half
      if (this.stickPtrId === null && ptr.x < WORLD.WIDTH / 2) {
        this.stickPtrId = ptr.id
        this.updateStick(ptr.x, ptr.y)
      }
      // Claim jump if pointer is in right half
      if (this.jumpPtrId === null && ptr.x >= WORLD.WIDTH / 2) {
        this.jumpPtrId = ptr.id
        this.input.up = true
        this.jumpBtnBg.setFillStyle(0x44aaff, ALPHA + 0.3)
      }
    })

    scene.input.on('pointermove', (ptr: Phaser.Input.Pointer) => {
      if (ptr.id === this.stickPtrId) this.updateStick(ptr.x, ptr.y)
    })

    scene.input.on('pointerup', (ptr: Phaser.Input.Pointer) => {
      if (ptr.id === this.stickPtrId) {
        this.stickPtrId = null
        this.resetStick()
      }
      if (ptr.id === this.jumpPtrId) {
        this.jumpPtrId  = null
        this.input.up   = false
        this.jumpBtnBg.setFillStyle(0x44aaff, ALPHA)
      }
    })
  }

  private updateStick(px: number, py: number): void {
    const dx = px - STICK_CX
    const dy = py - STICK_CY
    const dist = Math.sqrt(dx * dx + dy * dy)
    const capped = Math.min(dist, STICK_R)
    const angle  = Math.atan2(dy, dx)

    const kx = STICK_CX + Math.cos(angle) * capped
    const ky = STICK_CY + Math.sin(angle) * capped
    this.knob.setPosition(kx, ky)

    // 8-direction: use 30° dead zone on each axis
    const normX = dx / Math.max(dist, 1)
    const normY = dy / Math.max(dist, 1)
    const dead = 0.3

    this.input.left  = normX < -dead
    this.input.right = normX >  dead
    this.input.up    = normY < -dead || (this.jumpPtrId !== null)   // stick up OR button held
    this.input.down  = normY >  dead
  }

  private resetStick(): void {
    this.knob.setPosition(STICK_CX, STICK_CY)
    this.input.left  = false
    this.input.right = false
    this.input.up    = (this.jumpPtrId !== null)   // preserve button hold state
    this.input.down  = false
  }

  destroy(): void {
    this.input.left = this.input.right = this.input.up = this.input.down = false
  }
}
