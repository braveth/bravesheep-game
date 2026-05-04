import Phaser from 'phaser'
import { WORLD } from '../config/world'

export interface WinData {
  nextChapterIndex: number
  chapterName:      string
  metres:           number
}

export class Win extends Phaser.Scene {
  constructor() {
    super({ key: 'Win' })
  }

  create(data: WinData): void {
    const { nextChapterIndex = 1, chapterName = '', metres = 0 } = data ?? {}

    this.add.rectangle(
      WORLD.WIDTH / 2, WORLD.HEIGHT / 2,
      WORLD.WIDTH, WORLD.HEIGHT,
      0x000022, 0.82,
    )

    this.add.text(WORLD.WIDTH / 2, WORLD.HEIGHT / 2 - 100, 'CHAPTER COMPLETE', {
      fontSize: '48px',
      color: '#ffdd44',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(WORLD.WIDTH / 2, WORLD.HEIGHT / 2 - 30, `${chapterName} cleared at ${metres} m`, {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.makeBtn(WORLD.WIDTH / 2, WORLD.HEIGHT / 2 + 60, 'CONTINUE', () => {
      this.scene.stop()
      this.scene.start('Game', { startChapter: nextChapterIndex })
    })
  }

  private makeBtn(x: number, y: number, label: string, cb: () => void): void {
    this.add.text(x, y, label, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#225500dd',
      padding: { x: 32, y: 14 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', function(this: Phaser.GameObjects.Text) { this.setColor('#ffff88') })
      .on('pointerout',  function(this: Phaser.GameObjects.Text) { this.setColor('#ffffff') })
      .on('pointerdown', cb)
  }
}

