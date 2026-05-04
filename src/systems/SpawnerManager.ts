import Phaser from 'phaser'
import type { ISpawner } from '../entities/interfaces/ISpawner'
import type { ICollisionRegistrar } from '../entities/interfaces/ICollisionRegistrar'
import type { IRunnerConfig, EnemyClass } from '../chapters/IChapter'
import type { LevelConfig } from '../config/LevelConfig'

export class SpawnerManager {
  private readonly spawnerMap:   Map<EnemyClass, ISpawner>
  private readonly allSpawners:  ISpawner[]
  private readonly enemyClasses: readonly EnemyClass[]
  private nextWaveTime  = 0
  private lastWaveClass: EnemyClass | null = null

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
    this.lastWaveClass = null
    this.nextWaveTime  = 0
  }

  private trySpawnWave(time: number, config: LevelConfig, heroX: number): void {
    if (time < this.nextWaveTime) return
    this.nextWaveTime = time + config.waveInterval

    const candidates   = this.enemyClasses.filter(t => t !== this.lastWaveClass)
    const chosen       = Phaser.Utils.Array.GetRandom(candidates as EnemyClass[]) as EnemyClass
    this.lastWaveClass = chosen
    this.spawnerMap.get(chosen)?.spawn(config, heroX)
  }
}

