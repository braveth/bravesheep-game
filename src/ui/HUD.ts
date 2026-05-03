import Phaser from 'phaser'
import { WORLD } from '../config/physics'

export class HUD {
  private hpIcons:    Phaser.GameObjects.Image[]
  private distText:   Phaser.GameObjects.Text
  private levelBadge: Phaser.GameObjects.Text
  private bossBarBg?: Phaser.GameObjects.Rectangle
  private bossBarFg?: Phaser.GameObjects.Rectangle
  private bossLabel?: Phaser.GameObjects.Text
  private bossMaxHp   = 1

  constructor(scene: Phaser.Scene, maxHp: number) {
    this.hpIcons = []
    for (let i = 0; i < maxHp; i++) {
      const icon = scene.add.image(16 + i * 26, 16, 'hp-icon')
      icon.setDepth(10)
      this.hpIcons.push(icon)
    }

    this.distText = scene.add
      .text(WORLD.WIDTH - 12, 10, '0 m', {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#00000099',
        padding: { x: 6, y: 4 },
      })
      .setOrigin(1, 0)
      .setDepth(10)

    this.levelBadge = scene.add
      .text(WORLD.WIDTH / 2, 10, 'LV 1', {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#00000099',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5, 0)
      .setDepth(10)
  }

  setHP(hp: number): void {
    this.hpIcons.forEach((icon, i) => {
      icon.setAlpha(i < hp ? 1 : 0.25)
    })
  }

  setDistance(metres: number): void {
    this.distText.setText(`${metres} m`)
  }

  setLevel(level: number): void {
    this.levelBadge.setText(`LV ${level + 1}`)
  }

  showBossBar(scene: Phaser.Scene, maxHp: number): void {
    this.bossMaxHp = maxHp
    const barW = WORLD.WIDTH - 40
    const barX = WORLD.WIDTH / 2
    const barY = 12
    this.bossBarBg = scene.add.rectangle(barX, barY, barW, 14, 0x440000).setDepth(12).setOrigin(0.5, 0)
    this.bossBarFg = scene.add.rectangle(barX - barW / 2, barY, barW, 14, 0xff2200).setDepth(13).setOrigin(0, 0)
    this.bossLabel = scene.add.text(barX, barY + 7, 'BOSS', {
      fontSize: '10px', color: '#ffffff',
    }).setOrigin(0.5, 0.5).setDepth(14)
    this.levelBadge.setVisible(false)
    this.distText.setVisible(false)
  }

  updateBossBar(hp: number): void {
    if (!this.bossBarFg || !this.bossBarBg) return
    const frac = Math.max(0, hp / this.bossMaxHp)
    const barW = WORLD.WIDTH - 40
    this.bossBarFg.setSize(barW * frac, 14)
  }

  hideBossBar(): void {
    this.bossBarBg?.destroy()
    this.bossBarFg?.destroy()
    this.bossLabel?.destroy()
    this.bossBarBg = undefined
    this.bossBarFg = undefined
    this.bossLabel = undefined
    this.levelBadge.setVisible(true)
    this.distText.setVisible(true)
  }
}
