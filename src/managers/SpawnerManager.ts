import Phaser from 'phaser'
import type { ISpawner, LevelConfig } from '../entities/spawners/ISpawner'
import type { ICollisionRegistrar } from './CollisionManager'
import type { IRunnerConfig, EnemyClass } from '../chapters/IChapter'

export class SpawnerManager {
  private readonly spawnerMap:   Map<EnemyClass, ISpawner>
  private readonly allSpawners:  ISpawner[]
  private waveQueue:    EnemyClass[] = []
  private readonly enemyClasses: readonly EnemyClass[]

  private nextWaveTime = 0

  constructor(
    private readonly scene: Phaser.Scene,
    chapter:                IRunnerConfig,
    reg:                    ICollisionRegistrar,
  ) {
    this.enemyClasses = chapter.enemies
    this.spawnerMap   = new Map()
    this.allSpawners  = []

    for (const Cls of chapter.enemies) {
      const spawner = new Cls.spawner(scene, Cls, reg)
      this.spawnerMap.set(Cls, spawner)
      this.allSpawners.push(spawner)
    }
  }

  update(time: number, heroX: number, scrollSpeed: number, config: LevelConfig): void {
    this.trySpawnWave(time, config, heroX)
    for (const s of this.allSpawners) s.tick(time, heroX, scrollSpeed, config)
  }

  clear(): void {
    for (const s of this.allSpawners) s.clear()
    this.waveQueue    = []
    this.nextWaveTime = 0
  }

  private trySpawnWave(time: number, config: LevelConfig, heroX: number): void {
    if (time < this.nextWaveTime) return
    this.nextWaveTime = time + config.waveInterval

    if (this.waveQueue.length === 0) {
      this.waveQueue = Phaser.Utils.Array.Shuffle([...this.enemyClasses] as EnemyClass[])
    }
    const chosen = this.waveQueue.shift()!
    this.spawnerMap.get(chosen)?.spawn(config, heroX)
  }
}

