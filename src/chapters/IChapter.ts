import type { BaseBoss } from '../entities/enemies/base/BaseBoss'

export type BossConstructor = new (
  group:   Phaser.Physics.Arcade.Group,
  heroRef: { x: number },
) => BaseBoss

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EnemyClass = new (...args: any[]) => object

export interface IBg {
  readonly scrollMult: number
  readonly skyColor:   number
  readonly texture:    string
}

export interface IChapter {
  readonly name:    string
  readonly boss:    BossConstructor
  readonly enemies: readonly EnemyClass[]
  readonly bg:      IBg
}
