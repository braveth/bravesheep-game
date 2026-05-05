import type Phaser from 'phaser'
import type { ICollisionRegistrar } from '../../managers/CollisionManager'

export type LevelConfig = {
  waveInterval:  number
  turretShots:   number
  airDropCount:  number
  packCount:     number
  packSpeedMult: number
  speedFactor:   number
  scrollSpeed:   number
}

export interface ISpawner {
  spawn(config: LevelConfig, heroX: number): void
  tick(time: number, heroX: number, scrollSpeed: number, config: LevelConfig): void
  clear(): void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SpawnerCtor = new (scene: Phaser.Scene, cls: any, reg: ICollisionRegistrar) => ISpawner
