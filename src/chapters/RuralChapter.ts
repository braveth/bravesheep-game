import Phaser from 'phaser'
import { TEX } from '../config/textures'
import { BaseChapter, type ChapterParams, type IBg } from './BaseChapter'

export class RuralChapter extends BaseChapter {
  readonly bg: IBg = {
    scrollMult: 0.3,
    skyColor:   0x5c94fc,
    apply(sprite: Phaser.GameObjects.TileSprite): void { sprite.setTexture(TEX.RURAL_BG) },
  }

  constructor(p: ChapterParams) { super(p) }
}
