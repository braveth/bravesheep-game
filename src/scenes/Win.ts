import Phaser from 'phaser'
import { WORLD } from '../config/world'

export interface WinData {
  metres: number
  level:  number
}

export class Win extends Phaser.Scene {
  constructor() {
    super({ key: 'Win' })
  }

  create(data: WinData): void {
    const { metres = 0, level = 0 } = data ?? {}

    this.add.rectangle(
      WORLD.WIDTH / 2, WORLD.HEIGHT / 2,
      WORLD.WIDTH, WORLD.HEIGHT,
      0x000022, 0.80,
    )

    this.add.text(WORLD.WIDTH / 2, WORLD.HEIGHT / 2 - 110, 'YOU WIN!', {
      fontSize: '60px',
      color: '#ffdd44',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(WORLD.WIDTH / 2, WORLD.HEIGHT / 2 - 30, `Boss defeated at ${metres} m`, {
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(WORLD.WIDTH / 2, WORLD.HEIGHT / 2 + 12, `Level ${level + 1}`, {
      fontSize: '18px',
      color: '#aaaaaa',
    }).setOrigin(0.5)

    this.makeBtn(WORLD.WIDTH / 2, WORLD.HEIGHT / 2 + 72, 'PLAY AGAIN', () => {
      this.scene.start('Game')
    })
  }

  private makeBtn(x: number, y: number, label: string, cb: () => void): void {
    this.add.text(x, y, label, {
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#225500dd',
      padding: { x: 28, y: 12 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', function(this: Phaser.GameObjects.Text) { this.setColor('#ffff88') })
      .on('pointerout',  function(this: Phaser.GameObjects.Text) { this.setColor('#ffffff') })
      .on('pointerdown', cb)
  }
}
