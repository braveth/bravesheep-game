import Phaser from 'phaser'
import type { BaseBoss } from '../entities/enemies/base/BaseBoss'

export interface IBg {
  readonly scrollMult: number
  readonly skyColor:   number
  apply(sprite: Phaser.GameObjects.TileSprite): void
}

export type BossConstructor = new (
  group:   Phaser.Physics.Arcade.Group,
  heroRef: { x: number },
) => BaseBoss

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EnemyClass = new (...args: any[]) => object

export interface ChapterParams {
  name:    string
  boss:    BossConstructor
  enemies: readonly EnemyClass[]
}

export abstract class BaseChapter {
  abstract readonly bg: IBg

  readonly name:    string
  readonly boss:    BossConstructor
  readonly enemies: readonly EnemyClass[]

  constructor(p: ChapterParams) {
    this.name    = p.name
    this.boss    = p.boss
    this.enemies = p.enemies
  }
}
