import Phaser from 'phaser'
import { WORLD } from '../config/world'

export class Pause extends Phaser.Scene {
  constructor() {
    super({ key: 'Pause' })
  }

  create(): void {
    // Dim overlay
    this.add.rectangle(
      WORLD.WIDTH / 2, WORLD.HEIGHT / 2,
      WORLD.WIDTH, WORLD.HEIGHT,
      0x000000, 0.6,
    )

    this.add.text(WORLD.WIDTH / 2, WORLD.HEIGHT / 2 - 90, 'PAUSED', {
      fontSize: '52px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.makeBtn(WORLD.WIDTH / 2, WORLD.HEIGHT / 2 + 10, 'RESUME', () => {
      this.scene.resume('Game')
      this.scene.stop()
    })

    this.makeBtn(WORLD.WIDTH / 2, WORLD.HEIGHT / 2 + 68, 'RESTART', () => {
      this.scene.stop()
      this.scene.stop('Game')
      this.scene.start('Game')
    })

    this.makeBtn(WORLD.WIDTH / 2, WORLD.HEIGHT / 2 + 126, 'QUIT TO MENU', () => {
      this.scene.stop()
      this.scene.stop('Game')
      this.scene.start('Home')
    })

    this.input.keyboard!.once('keydown-ESC', () => {
      this.scene.resume('Game')
      this.scene.stop()
    })
  }

  private makeBtn(x: number, y: number, label: string, cb: () => void): void {
    this.add.text(x, y, label, {
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#004488dd',
      padding: { x: 28, y: 12 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', function(this: Phaser.GameObjects.Text) { this.setColor('#ffff88') })
      .on('pointerout',  function(this: Phaser.GameObjects.Text) { this.setColor('#ffffff') })
      .on('pointerdown', cb)
  }
}
