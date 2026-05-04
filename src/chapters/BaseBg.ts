import Phaser from 'phaser'

export abstract class BaseBg {
  abstract readonly scrollMult: number
  abstract readonly skyColor:   number

  abstract apply(sprite: Phaser.GameObjects.TileSprite): void
}
