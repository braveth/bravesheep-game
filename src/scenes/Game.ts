import Phaser from 'phaser'
import { Hero } from '../entities/Hero'
import { SpawnerManager } from '../managers/SpawnerManager'
import { CollisionManager } from '../managers/CollisionManager'
import { BossSpawner } from '../entities/spawners/BossSpawner'
import { DifficultyManager } from '../managers/DifficultyManager'
import { ChapterState, PHASE } from '../managers/ChapterState'
import { WorldRenderer } from '../managers/WorldRenderer'
import { HUD } from '../ui/HUD'
import { DevPanel } from '../ui/DevPanel'
import { MobileControls } from '../ui/MobileControls'
import { WORLD } from '../config/world'
import { DIFFICULTY } from '../config/enemies'
import type { LevelConfig } from '../entities/spawners/ISpawner'

export class Game extends Phaser.Scene {
  private hero!:           Hero
  private spawnerManager!: SpawnerManager
  private collisions!:     CollisionManager
  private bossSpawner:     BossSpawner | null = null
  private bossDeadScheduled = false
  private difficulty!:     DifficultyManager
  private progression!:    ChapterState
  private world!:          WorldRenderer
  private hud!:            HUD

  private mobileControls?: MobileControls
  private devPanel?: DevPanel
  private ending = false
  private readonly levelCfg: LevelConfig = { waveInterval: 0, turretShots: 0, airDropCount: 0, packCount: 0, packSpeedMult: 0, speedFactor: 0 }

  constructor() {
    super({ key: 'Game' })
  }

  create(data?: { startChapter?: number }): void {
    this.ending = false
    this.physics.world.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT)

    this.world       = new WorldRenderer(this)
    this.difficulty  = new DifficultyManager()
    this.progression = new ChapterState(data?.startChapter ?? 0)
    this.hero        = new Hero(this, 200, Hero.spawnY())
    this.hud         = new HUD(this, this.hero.maxHp)
    this.collisions  = new CollisionManager(this, this.world.groundBody, this.hero)
    this.collisions.registerHero()
    this.spawnerManager = new SpawnerManager(this, this.progression.runnerConfig, this.collisions)
    this.applyChapter()

    this.mobileControls = new MobileControls(this)
    this.hero.setVirtualInput(this.mobileControls.input)

    if (import.meta.env.DEV) {
      this.devPanel = new DevPanel(
        this,
        () => this.cycleChapter(),
        () => {
          if (this.progression.phase === PHASE.BOSS) {
            this.enterRunnerPhase()
          } else {
            this.enterBossPhase()
          }
        },
      )
    }
  }

  update(time: number, delta: number): void {
    const dt = delta / 1000

    this.difficulty.update(delta)
    const scrollSpeed     = this.difficulty.scrollSpeed
    const effectiveScroll = this.progression.phase === PHASE.BOSS ? 0 : scrollSpeed

    this.world.scroll(effectiveScroll, dt, this.progression.runnerConfig.bg.scrollMult)
    this.hero.update(time, delta)

    if (this.progression.phase === PHASE.RUNNER) {
      const cfg       = this.levelCfg
      cfg.waveInterval  = this.difficulty.waveInterval
      cfg.turretShots   = this.difficulty.turretShots
      cfg.airDropCount  = this.difficulty.airDropCount
      cfg.packCount     = this.difficulty.packCount
      cfg.packSpeedMult = this.difficulty.packSpeedMult
      cfg.speedFactor   = this.difficulty.speedFactor
      this.spawnerManager.update(time, this.hero.sprite.x, effectiveScroll, cfg)
    } else if (this.bossSpawner) {
      this.bossSpawner.update(time)
      if (!this.bossSpawner.alive && !this.bossDeadScheduled) {
        this.bossDeadScheduled = true
        this.time.delayedCall(1200, () => this.showChapterComplete())
      }
    }

    this.hud.setDistance(this.difficulty.metres)
    this.hud.setLevel(this.difficulty.level)

    if (this.progression.phase === PHASE.RUNNER && this.difficulty.level >= DIFFICULTY.levelMax) {
      this.enterBossPhase()
    }

    if (this.hero.isDead && !this.ending) {
      this.ending = true
      this.time.delayedCall(1200, () => {
        this.scene.start('GameOver', {
          chapterIndex: this.progression.index,
          metres:       this.difficulty.metres,
          level:        this.difficulty.level,
        })
      })
    }

    if (this.devPanel) {
      const b = this.hero.sprite.body as Phaser.Physics.Arcade.Body
      this.devPanel.update({
        scrollSpeed:   effectiveScroll,
        speedFactor:   this.difficulty.speedFactor,
        waveInterval:  this.difficulty.waveInterval,
        turretShots:   this.difficulty.turretShots,
        airDropCount:  this.difficulty.airDropCount,
        packCount:     this.difficulty.packCount,
        packSpeedMult: this.difficulty.packSpeedMult,
        level:         this.difficulty.level,
        nextLevelIn:   this.difficulty.nextLevelIn,
        metres:        this.difficulty.metres,
        bossMode:      this.progression.phase === PHASE.BOSS,
        biome:         this.progression.runnerConfig.name,
        heroState:     this.hero.currentState,
        heroVx:        b.velocity.x,
        heroVy:        b.velocity.y,
        grounded:      b.blocked.down,
      })
    }
  }

  private showChapterComplete(): void {
    if (this.ending) return
    this.ending = true
    this.scene.pause()
    this.scene.launch('Win', {
      nextChapterIndex: this.progression.index + 1,
      chapterName:      this.progression.runnerConfig.name,
      metres:           this.difficulty.metres,
    })
  }

  private applyChapter(): void {
    const runner = this.progression.runnerConfig
    this.world.applyBg(runner.bg)
    this.devPanel?.setChapterLabel(`[${runner.name}]`)
  }

  private enterRunnerPhase(): void {
    this.bossSpawner?.clear()
    this.bossSpawner = null
    this.bossDeadScheduled = false
    this.progression.cancelBoss()
    this.spawnerManager.clear()
    this.hud.hideBossBar()
    this.devPanel?.setBossLabel('[Runner]')
  }

  private enterBossPhase(): void {
    this.progression.startBoss()
    this.spawnerManager.clear()
    this.bossDeadScheduled = false
    this.bossSpawner = new BossSpawner(this, this.progression.bossConfig, this.hero.sprite, this.collisions)
    this.hud.showBossBar(this.bossSpawner.maxHp)
    this.devPanel?.setBossLabel('[Boss]')
  }

  private cycleChapter(): void {
    this.spawnerManager.clear()
    this.bossSpawner?.clear()
    this.bossSpawner    = null
    this.bossDeadScheduled = false
    this.ending        = false
    this.progression    = new ChapterState(this.progression.index + 1)
    this.spawnerManager = new SpawnerManager(this, this.progression.runnerConfig, this.collisions)
    this.difficulty.reset()
    this.hud.hideBossBar()
    this.applyChapter()
    this.devPanel?.setBossLabel('[Runner]')
  }

}
