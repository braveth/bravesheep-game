import Phaser from 'phaser'
import { WORLD } from '../config/world'
import { DIFFICULTY } from '../config/enemies'

export interface DevMetrics {
  scrollSpeed:   number
  speedFactor:   number
  waveInterval:  number
  turretShots:   number
  airDropCount:  number
  packCount:     number
  packSpeedMult: number
  level:         number
  nextLevelIn:   number
  metres:        number
  biome:         string
  bossMode:      boolean
  heroState:     string
  heroVx:        number
  heroVy:        number
  grounded:      boolean
}

const PANEL_W = 148
const PANEL_X = 0   // flush to left edge

export class DevPanel {
  private text:       Phaser.GameObjects.Text
  private chapterBtn: Phaser.GameObjects.Text
  private bossBtn:    Phaser.GameObjects.Text

  constructor(
    scene:     Phaser.Scene,
    onChapter: () => void,
    onBoss:    () => void,
  ) {
    scene.add.rectangle(PANEL_X, 0, PANEL_W, WORLD.HEIGHT, 0x000000, 0.78)
      .setOrigin(0, 0)
      .setDepth(50)

    this.text = scene.add.text(PANEL_X + 8, 8, '', {
      fontSize: '11px',
      color: '#ccffcc',
      fontFamily: 'monospace',
      lineSpacing: 4,
    }).setDepth(51)

    // Seed text with representative lines to measure height before placing buttons
    this.text.setText(Array(18).fill('M'.repeat(14)).join('\n'))
    const btnY = Math.ceil(this.text.getBounds().bottom) + 10
    this.text.setText('')

    const btnStyle = {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#004488cc',
      padding: { x: 8, y: 5 },
    }

    this.chapterBtn = scene.add
      .text(PANEL_X + 8, btnY, '[Rural]', btnStyle)
      .setOrigin(0, 0).setDepth(51)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', function(this: Phaser.GameObjects.Text) { this.setColor('#ffff88') })
      .on('pointerout',  function(this: Phaser.GameObjects.Text) { this.setColor('#ffffff') })
      .on('pointerdown', onChapter)

    this.bossBtn = scene.add
      .text(PANEL_X + 8, btnY + 32, '[Runner]', btnStyle)
      .setOrigin(0, 0).setDepth(51)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', function(this: Phaser.GameObjects.Text) { this.setColor('#ffff88') })
      .on('pointerout',  function(this: Phaser.GameObjects.Text) { this.setColor('#ffffff') })
      .on('pointerdown', onBoss)
  }

  update(m: DevMetrics): void {
    const nextLv = m.level >= DIFFICULTY.levelMax
      ? 'MAX'
      : `${m.nextLevelIn.toFixed(1)}s`

    const lines = [
      `LV ${m.level + 1}/${DIFFICULTY.levelMax + 1}  in ${nextLv}`,
      `dist  ${m.metres} m`,
      '',
      `spd   ${Math.round(m.scrollSpeed)} px/s`,
      `fac   ${m.speedFactor.toFixed(2)}x`,
      `wave  ${Math.round(m.waveInterval)} ms`,
      '',
      `shots ${m.turretShots}`,
      `drops ${m.airDropCount}`,
      `pack  ${m.packCount}  x${m.packSpeedMult.toFixed(2)}`,
      '',
      `biome ${m.biome}`,
      `boss  ${m.bossMode ? 'ON' : 'off'}`,
      '',
      `st    ${m.heroState}`,
      `vx    ${Math.round(m.heroVx)}`,
      `vy    ${Math.round(m.heroVy)}`,
      `gnd   ${m.grounded ? 'Y' : 'N'}`,
    ]
    this.text.setText(lines.join('\n'))
  }

  setChapterLabel(label: string): void { this.chapterBtn.setText(label) }
  setBossLabel(label: string): void    { this.bossBtn.setText(label) }
}
