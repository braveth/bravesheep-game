import Phaser from 'phaser'
import { Hero } from '../entities/Hero'
import { EnemySpawner } from '../systems/EnemySpawner'
import { DifficultyManager } from '../systems/DifficultyManager'
import { ProgressionManager } from '../systems/ProgressionManager'
import { HUD } from '../ui/HUD'
import { DevPanel } from '../ui/DevPanel'
import { MobileControls } from '../ui/MobileControls'
import { WORLD } from '../config/physics'
import { BOSS, DIFFICULTY } from '../config/enemies'

export class Game extends Phaser.Scene {
  private hero!:        Hero
  private spawner!:     EnemySpawner
  private difficulty!:  DifficultyManager
  private progression!: ProgressionManager
  private hud!:         HUD

  private groundVisual!: Phaser.GameObjects.TileSprite
  private groundBody!:   Phaser.GameObjects.Rectangle

  private scrollOffset = 0

  private skyBg!:    Phaser.GameObjects.Rectangle
  private activeBg!: Phaser.GameObjects.TileSprite

  private mobileControls?: MobileControls
  private devPanel?: DevPanel

  constructor() {
    super({ key: 'Game' })
  }

  create(): void {
    this.physics.world.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT)
    // ── Sky background (colour changes with biome) ────────────────────────
    this.skyBg = this.add.rectangle(
      WORLD.WIDTH / 2, WORLD.HEIGHT / 2,
      WORLD.WIDTH, WORLD.HEIGHT,
      0x5c94fc,
    ).setDepth(-10)
    // ── Background layer (texture swapped per chapter) ────────────────────
    this.activeBg = this.add.tileSprite(
      WORLD.WIDTH / 2,
      WORLD.GROUND_Y - 40,
      WORLD.WIDTH,
      80,
      'hills',
    )

    // ── Ground visual ─────────────────────────────────────────────────────
    this.groundVisual = this.add.tileSprite(
      WORLD.WIDTH / 2,
      WORLD.GROUND_Y + WORLD.GROUND_HEIGHT / 2,
      WORLD.WIDTH,
      WORLD.GROUND_HEIGHT,
      'ground',
    )

    // ── Ground physics body (static, invisible) ───────────────────────────
    // Width of 4000 covers enemy spawn area (wolves start at x > WORLD.WIDTH).
    // Without this, wolves fall through before entering the visible screen.
    this.groundBody = this.add.rectangle(
      2000,
      WORLD.GROUND_Y + WORLD.GROUND_HEIGHT / 2,
      4000,
      WORLD.GROUND_HEIGHT,
      0x000000,
      0,
    )
    this.physics.add.existing(this.groundBody, true)

    // ── Systems ───────────────────────────────────────────────────────────
    this.difficulty  = new DifficultyManager()
    this.progression = new ProgressionManager()
    this.spawner     = new EnemySpawner(this, this.groundBody)

    // ── Hero ──────────────────────────────────────────────────────────────
    this.hero = new Hero(this, 200, Hero.spawnY())
    this.physics.add.collider(this.hero.sprite, this.groundBody)

    // ── Collision: hero ↔ wolves (always damages hero) ───────────────────
    this.physics.add.overlap(
      this.hero.sprite,
      this.spawner.wolfGroup,
      () => {
        if (this.hero.takeDamage(this.time.now)) {
          this.hud.setHP(this.hero.hp)
        }
      },
    )

    // ── Collision: hero ↔ fat cats (always damages hero) ─────────────────
    this.physics.add.overlap(
      this.hero.sprite,
      this.spawner.fatCatGroup,
      () => {
        if (this.hero.takeDamage(this.time.now)) {
          this.hud.setHP(this.hero.hp)
        }
      },
    )

    // ── Collision: hero ↔ lasers ──────────────────────────────────────────
    this.physics.add.overlap(
      this.hero.sprite,
      this.spawner.laserGroup,
      (_heroGO, laserGO) => {
        (laserGO as Phaser.Physics.Arcade.Sprite).destroy()
        if (this.hero.takeDamage(this.time.now)) {
          this.hud.setHP(this.hero.hp)
        }
      },
    )

    // ── Collision: hero ↔ shurikens ───────────────────────────────────────
    this.physics.add.overlap(
      this.hero.sprite,
      this.spawner.shurikenGroup,
      (_heroGO, sGO) => {
        (sGO as Phaser.Physics.Arcade.Sprite).destroy()
        if (this.hero.takeDamage(this.time.now)) {
          this.hud.setHP(this.hero.hp)
        }
      },
    )

    // ── Collision: hero ↔ ninjas (always damages hero) ───────────────────
    this.physics.add.overlap(
      this.hero.sprite,
      this.spawner.ninjaGroup,
      () => {
        if (this.hero.takeDamage(this.time.now)) this.hud.setHP(this.hero.hp)
      },
    )

    // ── Collision: hero ↔ bombs ───────────────────────────────────────────
    this.physics.add.overlap(
      this.hero.sprite,
      this.spawner.bombGroup,
      (_h, bombGO) => {
        (bombGO as Phaser.Physics.Arcade.Sprite).destroy()
        if (this.hero.takeDamage(this.time.now)) this.hud.setHP(this.hero.hp)
      },
    )

    // ── Collision: hero ↔ limos / buses (always damages hero) ───────────
    const vehicleHandler: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = () => {
      if (this.hero.takeDamage(this.time.now)) this.hud.setHP(this.hero.hp)
    }
    this.physics.add.overlap(this.hero.sprite, this.spawner.limoGroup, vehicleHandler)
    this.physics.add.overlap(this.hero.sprite, this.spawner.busGroup,  vehicleHandler)

    // ── Collision: hero ↔ boss (stomp or damage) ───────────────────────────
    this.physics.add.overlap(
      this.hero.sprite,
      this.spawner.bossGroup,
      (heroGO, bossGO) => {
        const heroBody = (heroGO as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.Body
        const bossBody = (bossGO as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.Body
        if (heroBody.velocity.y > 60 && heroBody.bottom <= bossBody.top + 12) {
          this.spawner.damageEnemy(bossGO as Phaser.Physics.Arcade.Sprite)
          this.hero.stomp()
          this.hud.updateBossBar(this.spawner.bossHP)
        } else {
          if (this.hero.takeDamage(this.time.now)) this.hud.setHP(this.hero.hp)
        }
      },
    )

    // ── Collision: hero ↔ boss lasers ──────────────────────────────────────
    this.physics.add.overlap(
      this.hero.sprite,
      this.spawner.bossLaserGroup,
      (_h, laserGO) => {
        (laserGO as Phaser.Physics.Arcade.Sprite).destroy()
        if (this.hero.takeDamage(this.time.now)) this.hud.setHP(this.hero.hp)
      },
    )

    // ── HUD ───────────────────────────────────────────────────────────────
    this.hud = new HUD(this, this.hero.maxHp)
    this.hud.setHP(this.hero.hp)

    // Apply initial chapter visuals (sets activeBg)
    this.applyChapter()

    this.add.text(10, WORLD.HEIGHT - 26, '← → move   Space/↑ jump   ↓ duck', {
      fontSize: '12px',
      color: '#ffffff88',
    }).setDepth(10)

    // Pause on Esc
    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.pause()
      this.scene.launch('Pause')
    })

    // Mobile controls
    this.mobileControls = new MobileControls(this)
    this.hero.setVirtualInput(this.mobileControls.input)

    if (import.meta.env.DEV) {
      this.devPanel = new DevPanel(
        this,
        () => {
          this.difficulty.reset()
          this.spawner.clearAll()
          this.progression.reset()
          this.applyChapter()
        },
        () => {
          const isBoss = this.progression.phase === 'boss'
          if (isBoss) {
            this.progression.bossDefeated()
            this.spawner.clearBoss()
            this.hud.hideBossBar()
            this.difficulty.reset()
            this.applyChapter()
          } else {
            this.progression.startBoss()
            this.enterBossPhase()
          }
        },
      )
    }
  }

  update(time: number, delta: number): void {
    const dt = delta / 1000

    // ── Difficulty ────────────────────────────────────────────────────────
    this.difficulty.update(delta)
    const scrollSpeed     = this.difficulty.scrollSpeed
    const effectiveScroll = this.progression.phase === 'boss' ? 0 : scrollSpeed

    // ── Scroll ────────────────────────────────────────────────────────────
    this.scrollOffset += effectiveScroll * dt
    this.groundVisual.tilePositionX = this.scrollOffset
    this.activeBg.tilePositionX = this.scrollOffset * this.progression.chapter.bg.scrollMult

    // ── Hero ──────────────────────────────────────────────────────────────
    this.hero.update(time, delta)

    // ── Enemies ───────────────────────────────────────────────────────────
    this.spawner.update(
      time,
      delta,
      this.hero.sprite.x,
      effectiveScroll,
      {
        waveInterval:  this.difficulty.waveInterval,
        turretShots:   this.difficulty.turretShots,
        airDropCount:  this.difficulty.airDropCount,
        packCount:     this.difficulty.packCount,
        packSpeedMult: this.difficulty.packSpeedMult,
        speedFactor:   this.difficulty.speedFactor,
        enemies:      this.progression.chapter.enemies,
      },
    )

    // ── HUD ───────────────────────────────────────────────────────────────
    this.hud.setDistance(this.difficulty.metres)
    this.hud.setLevel(this.difficulty.level)
    if (this.progression.phase === 'boss') this.hud.updateBossBar(this.spawner.bossHP)

    // ── Runner: auto-enter boss when difficulty maxes ─────────────────────
    if (this.progression.phase === 'runner' && this.difficulty.level >= DIFFICULTY.levelMax) {
      this.progression.startBoss()
      this.enterBossPhase()
    }

    // ── Boss: detect defeat → next chapter ───────────────────────────────
    if (this.progression.phase === 'boss' && !this.spawner.bossAlive && this.spawner.bossHP <= 0) {
      if (this.progression.bossDefeated()) {
        this.spawner.clearBoss()
        this.hud.hideBossBar()
        this.difficulty.reset()
        this.spawner.clearAll()
        this.applyChapter()
      }
    }

    // ── Game over ─────────────────────────────────────────────────────────
    if (this.hero.isDead) {
      this.time.delayedCall(1200, () => {
        this.scene.start('GameOver', { metres: this.difficulty.metres, level: this.difficulty.level })
      })
    }

    // ── Dev panel ─────────────────────────────────────────────────────────
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
        bossMode:      this.progression.phase === 'boss',
        biome:         this.progression.chapter.name,
        heroState:     this.hero.currentState,
        heroVx:        b.velocity.x,
        heroVy:        b.velocity.y,
        grounded:      b.blocked.down,
      })
    }
  }

  // ── Apply chapter visuals + spawner ───────────────────────────────────
  private applyChapter(): void {
    const chapter = this.progression.chapter
    chapter.bg.apply(this.activeBg)
    this.skyBg.setFillStyle(chapter.bg.skyColor)
    this.devPanel?.setBiomeLabel(`[${chapter.name}]`)
  }

  // ── Enter boss phase ──────────────────────────────────────────────
  private enterBossPhase(): void {
    this.spawner.clearAll()
    this.spawner.spawnBoss(this.progression.chapter, this.hero.sprite)
    this.hud.showBossBar(this, BOSS.HP)
    this.devPanel?.setBossLabel('[Boss]')
  }
}
