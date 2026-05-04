import type { BaseBoss } from '../entities/enemies/base/BaseBoss'
import type { SpawnerCtor } from '../entities/interfaces/ISpawner'

export type BossConstructor = new (
  group:   Phaser.Physics.Arcade.Group,
  heroRef: { x: number },
) => BaseBoss

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EnemyClass = (new (...args: any[]) => object) & {
  readonly spawner: SpawnerCtor
}

export interface IBg {
  readonly scrollMult: number
  readonly skyColor:   number
  readonly texture:    string
}

export interface IRunnerConfig {
  readonly name:    string
  readonly enemies: readonly EnemyClass[]
  readonly bg:      IBg
}

export interface IBossConfig {
  readonly boss: BossConstructor
}

export interface IChapter extends IRunnerConfig, IBossConfig {}
