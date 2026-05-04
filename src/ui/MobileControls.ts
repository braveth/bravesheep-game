import Phaser from 'phaser'
import { WORLD } from '../config/physics'

export interface VirtualInput {
  left:  boolean
  right: boolean
  up:    boolean   // jump button only
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
  readonly input: VirtualInput = { left: false, right: false, up: false }

  private knob!:     Phaser.GameObjects.Arc
  private jumpBtnBg!: Phaser.GameObjects.Arc

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

    // Direction guides: left and right only
    const g = scene.add.graphics().setDepth(60).setAlpha(ALPHA * 0.6)
    for (const angle of [0, 180]) {
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
    const dist = Math.abs(dx)
    const capped = Math.min(dist, STICK_R)

    this.knob.setPosition(STICK_CX + Math.sign(dx) * capped, STICK_CY)

    const normX = dx / Math.max(dist, 1)
    const dead  = 0.25
    this.input.left  = normX < -dead
    this.input.right = normX >  dead
  }

  private resetStick(): void {
    this.knob.setPosition(STICK_CX, STICK_CY)
    this.input.left  = false
    this.input.right = false
  }

  destroy(): void {
    this.input.left = this.input.right = this.input.up = false
  }
}
