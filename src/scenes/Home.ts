import Phaser from 'phaser'
import { WORLD } from '../config/world'

export class Home extends Phaser.Scene {
  constructor() {
    super({ key: 'Home' })
  }

  create(): void {
    // Sky background
    this.add.rectangle(
      WORLD.WIDTH / 2, WORLD.HEIGHT / 2,
      WORLD.WIDTH, WORLD.HEIGHT,
      0x5c94fc,
    )

    // Ground strip
    this.add.rectangle(
      WORLD.WIDTH / 2, WORLD.HEIGHT - 26,
      WORLD.WIDTH, 52,
      0x3ab83a,
    )

    // Title
    this.add.text(WORLD.WIDTH / 2, WORLD.HEIGHT / 2 - 80, 'BRAVE SHEEP', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5)

    this.add.text(WORLD.WIDTH / 2, WORLD.HEIGHT / 2 - 20, 'Coming Soon', {
      fontSize: '20px',
      color: '#ffffaa',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5)

    this.makeBtn(WORLD.WIDTH / 2, WORLD.HEIGHT / 2 + 70, 'PLAY', () => {
      this.scene.start('Game')
    })

    // Controls hint
    this.add.text(WORLD.WIDTH / 2, WORLD.HEIGHT - 60, '← → move   Space / ↑ jump   ↓ duck   Esc pause', {
      fontSize: '13px',
      color: '#ffffff99',
    }).setOrigin(0.5)
  }

  private makeBtn(x: number, y: number, label: string, cb: () => void): void {
    this.add.text(x, y, label, {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#004488ee',
      padding: { x: 40, y: 14 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', function(this: Phaser.GameObjects.Text) { this.setColor('#ffff88') })
      .on('pointerout',  function(this: Phaser.GameObjects.Text) { this.setColor('#ffffff') })
      .on('pointerdown', cb)
  }
}
