import Phaser from 'phaser'
import { TEX } from '../config/textures'
import { BaseChapter, type ChapterParams, type IBg } from './BaseChapter'

export class UrbanChapter extends BaseChapter {
  readonly bg: IBg = {
    scrollMult: 0.15,
    skyColor:   0x0d1020,
    apply(sprite: Phaser.GameObjects.TileSprite): void { sprite.setTexture(TEX.URBAN_BG) },
  }

  constructor(p: ChapterParams) { super(p) }
}
