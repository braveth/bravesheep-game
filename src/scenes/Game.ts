import Phaser from 'phaser'
import { Hero } from '../entities/Hero'
import { EnemySpawner } from '../systems/EnemySpawner'
import { DifficultyManager } from '../systems/DifficultyManager'
import { ChapterState, PHASE } from '../systems/ChapterState'
import { WorldRenderer } from '../systems/WorldRenderer'
import { CollisionManager } from '../systems/CollisionManager'
import { HUD } from '../ui/HUD'
import { DevPanel } from '../ui/DevPanel'
import { MobileControls } from '../ui/MobileControls'
import { WORLD } from '../config/world'
import { BOSS, DIFFICULTY } from '../config/enemies'

export class Game extends Phaser.Scene {
  private hero!:        Hero
  private spawner!:     EnemySpawner
  private difficulty!:  DifficultyManager
  private progression!: ChapterState
  private world!:       WorldRenderer
  private hud!:         HUD

  private mobileControls?: MobileControls
  private devPanel?: DevPanel

  constructor() {
    super({ key: 'Game' })
  }

  create(): void {
    this.physics.world.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT)

    this.world       = new WorldRenderer(this)
    this.difficulty  = new DifficultyManager()
    this.progression = new ChapterState()
    this.spawner     = new EnemySpawner(this, this.world.groundBody)
    this.hero        = new Hero(this, 200, Hero.spawnY())
    this.hud         = new HUD(this, this.hero.maxHp)

    new CollisionManager(this, this.hero, this.spawner, this.hud, this.world.groundBody)

    this.hud.setHP(this.hero.hp)
    this.applyChapter()

    this.add.text(10, WORLD.HEIGHT - 26, '← → move   Space/↑ jump   ↓ duck', {
      fontSize: '12px',
      color: '#ffffff88',
    }).setDepth(10)

    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.pause()
      this.scene.launch('Pause')
    })

    this.mobileControls = new MobileControls(this)
    this.hero.setVirtualInput(this.mobileControls.input)

    if (import.meta.env.DEV) {
      this.devPanel = new DevPanel(
        this,
        () => this.resetGame(),
        () => {
          if (this.progression.phase === PHASE.BOSS) this.enterRunnerPhase()
          else                                   this.enterBossPhase()
        },
      )
    }
  }

  update(time: number, delta: number): void {
    const dt = delta / 1000

    this.difficulty.update(delta)
    const scrollSpeed     = this.difficulty.scrollSpeed
    const effectiveScroll = this.progression.phase === PHASE.BOSS ? 0 : scrollSpeed

    this.world.scroll(effectiveScroll, dt, this.progression.chapter.bg.scrollMult)
    this.hero.update(time, delta)

    this.spawner.update(
      time, delta,
      this.hero.sprite.x,
      effectiveScroll,
      {
        waveInterval:  this.difficulty.waveInterval,
        turretShots:   this.difficulty.turretShots,
        airDropCount:  this.difficulty.airDropCount,
        packCount:     this.difficulty.packCount,
        packSpeedMult: this.difficulty.packSpeedMult,
        speedFactor:   this.difficulty.speedFactor,
        enemies:       this.progression.chapter.enemies,
      },
    )

    this.hud.setDistance(this.difficulty.metres)
    this.hud.setLevel(this.difficulty.level)
    if (this.progression.phase === PHASE.BOSS) this.hud.updateBossBar(this.spawner.bossHP)

    if (this.progression.phase === PHASE.RUNNER && this.difficulty.level >= DIFFICULTY.levelMax) {
      this.enterBossPhase()
    }

    if (this.progression.phase === PHASE.BOSS && !this.spawner.bossAlive && this.spawner.bossHP <= 0) {
      this.enterRunnerPhase()
    }

    if (this.hero.isDead) {
      this.time.delayedCall(1200, () => {
        this.scene.start('GameOver', { metres: this.difficulty.metres, level: this.difficulty.level })
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
        biome:         this.progression.chapter.name,
        heroState:     this.hero.currentState,
        heroVx:        b.velocity.x,
        heroVy:        b.velocity.y,
        grounded:      b.blocked.down,
      })
    }
  }

  private applyChapter(): void {
    const chapter = this.progression.chapter
    this.world.applyBg(chapter.bg)
    this.devPanel?.setBiomeLabel(`[${chapter.name}]`)
  }

  private enterBossPhase(): void {
    this.progression.startBoss()
    this.spawner.clearAll()
    this.spawner.spawnBoss(this.progression.chapter, this.hero.sprite)
    this.hud.showBossBar(this, BOSS.HP)
    this.devPanel?.setBossLabel('[Boss]')
  }

  private enterRunnerPhase(): void {
    if (!this.progression.startRunner()) return
    this.spawner.clearBoss()
    this.spawner.clearAll()
    this.hud.hideBossBar()
    this.difficulty.reset()
    this.applyChapter()
    this.devPanel?.setBossLabel('')
  }

  private resetGame(): void {
    this.progression.reset()
    this.spawner.clearBoss()
    this.spawner.clearAll()
    this.difficulty.reset()
    this.applyChapter()
    this.hud.hideBossBar()
    this.devPanel?.setBossLabel('')
  }
}
