import Phaser from 'phaser'
import { WORLD } from '../config/world'
import { TEX } from '../config/textures'
import type { IBg } from '../chapters/IChapter'

export class WorldRenderer {
  readonly groundBody: Phaser.GameObjects.Rectangle

  private scene:        Phaser.Scene
  private skyBg:        Phaser.GameObjects.Rectangle
  private activeBg:     Phaser.GameObjects.TileSprite
  private groundVisual: Phaser.GameObjects.TileSprite
  private scrollOffset  = 0

  constructor(scene: Phaser.Scene) {
    this.scene = scene

    this.skyBg = scene.add.rectangle(
      WORLD.WIDTH / 2, WORLD.HEIGHT / 2,
      WORLD.WIDTH, WORLD.HEIGHT,
      0x000000,
    ).setDepth(-10)

    this.activeBg = scene.add.tileSprite(
      WORLD.WIDTH / 2,
      WORLD.GROUND_Y - 40,
      WORLD.WIDTH,
      80,
      TEX.RURAL_BG,
    )

    this.groundVisual = scene.add.tileSprite(
      WORLD.WIDTH / 2,
      WORLD.GROUND_Y + WORLD.GROUND_HEIGHT / 2,
      WORLD.WIDTH,
      WORLD.GROUND_HEIGHT,
      TEX.GROUND,
    )

    this.groundBody = scene.add.rectangle(
      2000,
      WORLD.GROUND_Y + WORLD.GROUND_HEIGHT / 2,
      4000,
      WORLD.GROUND_HEIGHT,
      0x000000, 0,
    )
    scene.physics.add.existing(this.groundBody, true)
  }

  applyBg(bg: IBg): void {
    this.activeBg.setTexture(bg.texture)
    this.skyBg.setFillStyle(bg.skyColor)
  }

  scroll(speed: number, dt: number, bgScrollMult: number): void {
    this.scrollOffset += speed * dt
    this.groundVisual.tilePositionX = this.scrollOffset
    this.activeBg.tilePositionX     = this.scrollOffset * bgScrollMult
  }
}
