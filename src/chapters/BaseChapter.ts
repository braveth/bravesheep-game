import Phaser from 'phaser'
import type { BaseBg }   from './BaseBg'
import type { BaseBoss } from '../entities/enemies/base/BaseBoss'

export type BgConstructor = new () => BaseBg

export type BossConstructor = new (
  group:   Phaser.Physics.Arcade.Group,
  heroRef: { x: number },
) => BaseBoss

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EnemyClass = new (...args: any[]) => object

export interface ChapterParams {
  name:    string
  bg:      BgConstructor
  boss:    BossConstructor
  enemies: readonly EnemyClass[]
}

export abstract class BaseChapter {
  readonly name:    string
  readonly bg:      BaseBg
  readonly boss:    BossConstructor
  readonly enemies: readonly EnemyClass[]

  constructor(p: ChapterParams) {
    this.name    = p.name
    this.bg      = new p.bg()
    this.boss    = p.boss
    this.enemies = p.enemies
  }
}
