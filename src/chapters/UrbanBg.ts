import Phaser from 'phaser'
import { BaseBg } from './BaseBg'

export class UrbanBg extends BaseBg {
  readonly scrollMult = 0.15
  readonly skyColor   = 0x0d1020
  apply(sprite: Phaser.GameObjects.TileSprite): void { sprite.setTexture('city-bg') }
}
