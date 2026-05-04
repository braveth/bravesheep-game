import Phaser from 'phaser'
import { BaseBg } from './BaseBg'

export class RuralBg extends BaseBg {
  readonly scrollMult = 0.3
  readonly skyColor   = 0x5c94fc
  apply(sprite: Phaser.GameObjects.TileSprite): void { sprite.setTexture('hills') }
}
