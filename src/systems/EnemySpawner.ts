import Phaser from 'phaser'
import { Wolf }       from '../entities/enemies/Wolf'
import { FatCat }     from '../entities/enemies/FatCat'
import { Helicopter } from '../entities/enemies/Helicopter'
import { Ninja }      from '../entities/enemies/Ninja'
import { Airplane }   from '../entities/enemies/Airplane'
import { Bomb }       from '../entities/enemies/Bomb'
import { Limo }       from '../entities/enemies/Limo'
import { Bus }        from '../entities/enemies/Bus'
import { BaseBoss }   from '../entities/enemies/base/BaseBoss'
import type { BaseChapter, EnemyClass } from '../chapters/BaseChapter'
import {
  WOLF, FAT_CAT, HELICOPTER, NINJA, AIRPLANE, BOMB, LIMO, BUS, BOSS,
} from '../config/enemies'
import { WORLD } from '../config/world'

type LevelConfig = {
  waveInterval:  number
  turretShots:   number
  airDropCount:  number
  packCount:     number
  packSpeedMult: number
  speedFactor:   number   // baseScrollSpeed / currentScrollSpeed — scales all timings
  enemies:      readonly EnemyClass[]  // enemy class constructors for this chapter
}

export class EnemySpawner {
  // Phaser groups — used by Game.ts for collision
  readonly wolfGroup:       Phaser.Physics.Arcade.Group
  readonly fatCatGroup:     Phaser.Physics.Arcade.Group
  readonly laserGroup:      Phaser.Physics.Arcade.Group
  readonly helicopterGroup: Phaser.Physics.Arcade.Group
  readonly ninjaGroup:      Phaser.Physics.Arcade.Group
  readonly shurikenGroup:   Phaser.Physics.Arcade.Group
  readonly airplaneGroup:   Phaser.Physics.Arcade.Group
  readonly bombGroup:       Phaser.Physics.Arcade.Group
  readonly limoGroup:       Phaser.Physics.Arcade.Group
  readonly busGroup:        Phaser.Physics.Arcade.Group
  readonly bossGroup:       Phaser.Physics.Arcade.Group
  readonly bossLaserGroup:  Phaser.Physics.Arcade.Group
  private bombShadows:      Phaser.GameObjects.Rectangle[] = []

  private scene: Phaser.Scene

  private wolves:      Wolf[]       = []
  private fatCats:     FatCat[]     = []
  private helicopters: Helicopter[] = []
  private ninjas:      Ninja[]      = []
  private airplanes:   Airplane[]   = []
  private bombs:       Bomb[]       = []
  private limos:       Limo[]       = []
  private buses:       Bus[]        = []
  private boss:        BaseBoss | null = null

  private levelConfig: LevelConfig = {
    waveInterval: 5000, turretShots: 3, airDropCount: 3, packCount: 3, packSpeedMult: 1, speedFactor: 1,
    enemies: [Wolf, FatCat, Helicopter],
  }

  private activeGroundGroups = 0
  private activeAirGroups    = 0

  // Single wave timer: fires every WAVE_INTERVAL regardless of screen state.
  private nextWaveTime  = 2000
  private waveCleared   = true   // unused guard kept for clearAll() reset
  // Last wave class spawned — excluded from next draw so the same type is never repeated.
  private lastWaveClass: EnemyClass | null = null

  // Dispatch table: enemy class constructor → spawn function
  private readonly waveDispatch: Map<EnemyClass, () => void>

  constructor(scene: Phaser.Scene, groundBody: Phaser.GameObjects.Rectangle) {
    this.scene = scene

    this.wolfGroup       = scene.physics.add.group()
    this.fatCatGroup     = scene.physics.add.group()
    this.laserGroup      = scene.physics.add.group()
    this.helicopterGroup = scene.physics.add.group()
    this.ninjaGroup      = scene.physics.add.group()
    this.shurikenGroup   = scene.physics.add.group()
    this.airplaneGroup   = scene.physics.add.group()
    this.bombGroup       = scene.physics.add.group()
    this.limoGroup       = scene.physics.add.group()
    this.busGroup        = scene.physics.add.group()
    this.bossGroup       = scene.physics.add.group()
    this.bossLaserGroup  = scene.physics.add.group()

    scene.physics.add.collider(this.wolfGroup,   groundBody)
    scene.physics.add.collider(this.fatCatGroup, groundBody)
    scene.physics.add.collider(this.ninjaGroup,  groundBody)
    scene.physics.add.collider(this.bombGroup,   groundBody)
    scene.physics.add.collider(this.bossGroup,   groundBody)

    this.waveDispatch = new Map<EnemyClass, () => void>([
      [Wolf,       () => this.spawnWolfPack()],
      [FatCat,     () => { this.fatCats.push(new FatCat(this.scene, this.fatCatGroup, WORLD.WIDTH + 20)); this.activeGroundGroups++ }],
      [Helicopter, () => { this.helicopters.push(new Helicopter(this.helicopterGroup, this.lastHeroX)); this.activeAirGroups++ }],
      [Limo,       () => this.spawnLimoPack()],
      [Bus,        () => { this.buses.push(new Bus(this.scene, this.busGroup, WORLD.WIDTH + 24)); this.activeGroundGroups++ }],
      [Airplane,   () => { this.airplanes.push(new Airplane(this.airplaneGroup, this.lastHeroX)); this.activeAirGroups++ }],
    ])
  }

  /** Destroy all active enemies — called when entering/exiting boss arena. */
  clearAll(): void {
    const destroyAll = (arr: { sprite: Phaser.Physics.Arcade.Sprite }[]) => {
      for (const e of arr) e.sprite.destroy()
      arr.length = 0
    }
    destroyAll(this.wolves)
    destroyAll(this.fatCats)
    destroyAll(this.helicopters)
    destroyAll(this.ninjas)
    destroyAll(this.airplanes)
    destroyAll(this.bombs)
    destroyAll(this.limos)
    destroyAll(this.buses)
    for (const sh of this.bombShadows) sh.destroy()
    this.bombShadows = []
    this.laserGroup.clear(true, true)
    this.shurikenGroup.clear(true, true)
    this.activeGroundGroups = 0
    this.activeAirGroups    = 0
    this.waveCleared        = true
    this.lastWaveClass      = null
    this.nextWaveTime       = 0
  }

  /** Spawn the boss for the current chapter. */
  spawnBoss(chapter: BaseChapter, heroRef: { x: number }): void {
    if (this.boss) return  // already spawned
    this.boss = new chapter.boss(this.bossGroup, heroRef)
  }

  /** Remove the boss from the arena. */
  clearBoss(): void {
    if (!this.boss) return
    this.boss.sprite.destroy()
    this.boss = null
    this.bossLaserGroup.clear(true, true)
  }

  get bossAlive(): boolean { return this.boss !== null && !this.boss.isDead }
  get bossHP():    number  { return this.boss ? this.boss.hp : 0 }

  damageBoss(): void { this.boss?.damage() }

  private tickBoss(time: number, scrollSpeed: number): void {
    if (!this.boss) return
    const laserY = this.boss.update(time)
    if (laserY !== -1) {
      const laser = this.bossLaserGroup.create(
        this.boss.sprite.x - BOSS.SPRITE_W / 2, laserY, 'laser',
      ) as Phaser.Physics.Arcade.Sprite
      const body = laser.body as Phaser.Physics.Arcade.Body
      body.setSize(FAT_CAT.LASER_W, FAT_CAT.LASER_H)
      body.setAllowGravity(false)
      body.setVelocityX(-FAT_CAT.LASER_SPEED * 1.5)
    }
    // Clean off-screen boss lasers
    for (const child of this.bossLaserGroup.getChildren()) {
      const s = child as Phaser.Physics.Arcade.Sprite
      if (s.x < -120) s.destroy()
    }
    // Auto-clear boss when dead
    if (this.boss.isDead) {
      this.scene.time.delayedCall(1200, () => this.clearBoss())
    }
  }

  // ── Main update ──────────────────────────────────────────────────────────
  update(
    time:        number,
    delta:       number,
    heroX:       number,
    scrollSpeed: number,
    levelConfig: LevelConfig,
  ): void {
    void delta
    this.levelConfig = levelConfig
    // Don't spawn regular enemies during boss fight
    if (this.boss === null) this.trySpawnWave(time)
    this.tickGround(time, heroX, scrollSpeed)
    this.tickAir(time, heroX, scrollSpeed)
    this.tickBoss(time, scrollSpeed)
    this.cleanUp()
  }

  // ── Spawn scheduling ─────────────────────────────────────────────────────
  private trySpawnWave(time: number): void {
    if (time < this.nextWaveTime) return
    this.nextWaveTime = time + this.levelConfig.waveInterval

    const allTypes   = this.levelConfig.enemies
    const candidates = allTypes.filter(t => t !== this.lastWaveClass)
    const chosen     = Phaser.Utils.Array.GetRandom(candidates as EnemyClass[]) as EnemyClass
    this.lastWaveClass = chosen
    this.waveDispatch.get(chosen)?.()
  }

  private spawnWolfPack(): void {
    const count   = this.levelConfig.packCount
    const trigger = { armedAt: 0 }
    const x = WORLD.WIDTH + 24   // all wolves stack at same x
    for (let i = 0; i < count; i++) {
      const w = new Wolf(this.wolfGroup, x)
      w.packTrigger  = trigger
      w.isPackLeader = (i === 0)  // any unit works — they all enter screen together
      w.chargeDelay  = (i * i) / Math.max(1, count - 1) * WOLF.PACK_STAGGER * this.levelConfig.speedFactor
      w.chargeSpeed  = Math.round(WOLF.SPEED * this.levelConfig.packSpeedMult)
      this.wolves.push(w)
    }
  }

  private spawnLimoPack(): void {
    const count   = this.levelConfig.packCount
    const trigger = { armedAt: 0 }
    const x = WORLD.WIDTH + 40   // all limos stack at same x
    for (let i = 0; i < count; i++) {
      const l = new Limo(this.limoGroup, x)
      l.packTrigger  = trigger
      l.isPackLeader = (i === 0)  // any unit works — they all enter screen together
      l.chargeDelay  = (i * i) / Math.max(1, count - 1) * LIMO.PACK_STAGGER * this.levelConfig.speedFactor
      l.chargeSpeed  = Math.round(LIMO.SPEED * this.levelConfig.packSpeedMult)
      this.limos.push(l)
    }
  }

  // ── Per-frame ticks ──────────────────────────────────────────────────────
  // Track latest hero X so trySpawnWave can thread it to air spawns
  private lastHeroX = 200

  private tickGround(time: number, heroX: number, scrollSpeed: number): void {
    this.lastHeroX = heroX
    for (const w of this.wolves)  w.update(time, heroX, scrollSpeed)
    for (const cat of this.fatCats) {
      const shot = cat.update(time, scrollSpeed, heroX, this.levelConfig.turretShots, this.levelConfig.speedFactor)
      if (shot !== -1) this.fireLaser(cat.sprite, shot, heroX)
    }
    for (const ninja of this.ninjas) {
      ninja.update(time, heroX, scrollSpeed)   // void — ninja bounces autonomously
    }
    for (const limo of this.limos) limo.update(time, scrollSpeed)
    for (const bus  of this.buses) {
      const shot = bus.update(time, scrollSpeed, heroX, this.levelConfig.turretShots, this.levelConfig.speedFactor)
      if (shot !== -1) this.fireLaser(bus.sprite, shot, heroX)
    }
  }

  private tickAir(time: number, heroX: number, scrollSpeed: number): void {
    for (const heli of this.helicopters) {
      const idx = heli.update(time, heroX, scrollSpeed, this.levelConfig.airDropCount, this.levelConfig.speedFactor)
      if (idx !== -1) this.dropOneNinja(heli, heroX)
    }
    for (const plane of this.airplanes) {
      const idx = plane.update(time, heroX, scrollSpeed, this.levelConfig.airDropCount, this.levelConfig.speedFactor)
      if (idx !== -1) this.dropOneBomb(plane, heroX)
    }
  }

  // ── Projectile helpers ───────────────────────────────────────────────────
  /**
   * shotType 0 = head shot: fires horizontally from the turret's eye level.
   * shotType 1 = low shot:  fires at a downward angle from eye level,
   *                          aimed at the ground a fixed distance behind the hero.
   * Both shots originate from shooter.y + FAT_CAT.LASER_EYE_OFFSET_Y (above centre).
   */
  private fireLaser(shooter: Phaser.Physics.Arcade.Sprite, shotType: 0 | 1, heroX: number): void {
    const fireY = shooter.y + FAT_CAT.LASER_EYE_OFFSET_Y
    const laser = this.laserGroup.create(shooter.x, fireY, 'laser') as Phaser.Physics.Arcade.Sprite
    const body  = laser.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)

    // Determine which side of the shooter the hero is on
    const shootDir = heroX < shooter.x ? -1 : 1

    if (shotType === 0) {
      // Head shot: horizontal beam toward the hero
      body.setSize(FAT_CAT.LASER_W, FAT_CAT.LASER_H)
      body.setVelocityX(shootDir * FAT_CAT.LASER_SPEED)
    } else {
      // Low shot: angled toward the ground, offset in hero's direction
      const targetX = heroX + shootDir * FAT_CAT.LASER_LOW_AIM_BEHIND
      const targetY = WORLD.GROUND_Y
      const dx = targetX - shooter.x
      const dy = targetY - fireY
      const len = Math.sqrt(dx * dx + dy * dy)
      body.setSize(FAT_CAT.LASER_H, FAT_CAT.LASER_H)
      body.setVelocity((dx / len) * FAT_CAT.LASER_SPEED, (dy / len) * FAT_CAT.LASER_SPEED)
      laser.setAngle(Math.atan2(dy, dx) * (180 / Math.PI))
    }
  }

  private dropOneNinja(heli: Helicopter, heroX: number): void {
    const dropY = heli.sprite.y + 20
    const n     = new Ninja(this.ninjaGroup, heli.sprite.x, dropY, heroX)
    this.ninjas.push(n)
  }

  private dropOneBomb(plane: Airplane, heroX: number): void {
    const b = new Bomb(this.bombGroup, plane.sprite.x, heroX)
    this.bombs.push(b)
    const shadow = this.scene.add.rectangle(plane.sprite.x, WORLD.GROUND_Y - 4, 20, 8, 0xff4400, 0.5).setDepth(4)
    this.bombShadows.push(shadow)
  }

  // ── Damage dispatch ───────────────────────────────────────────────────────
  damageEnemy(sprite: Phaser.Physics.Arcade.Sprite): void {
    this.wolves.find(w => w.sprite === sprite)?.damage()
    this.fatCats.find(c => c.sprite === sprite)?.damage()
    this.helicopters.find(h => h.sprite === sprite)?.damage()
    this.ninjas.find(n => n.sprite === sprite)?.damage()
    this.airplanes.find(a => a.sprite === sprite)?.damage()
    this.limos.find(l => l.sprite === sprite)?.damage()
    this.buses.find(b => b.sprite === sprite)?.damage()
    if (this.boss?.sprite === sprite) this.boss.damage()
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────
  private cleanUp(): void {
    this.purge(this.wolves,      (w) => w.isDead || w.isOffScreen)
    this.purge(this.fatCats,     (c) => c.isDead || c.isOffScreen)
    this.purge(this.limos,       (l) => l.isDead || l.isOffScreen)
    this.purge(this.buses,       (b) => b.isDead || b.isOffScreen)
    this.purge(this.ninjas,      (n) => n.isDead || n.isOffScreen)
    this.purge(this.helicopters, (h) => h.isDead || h.isOffScreen)
    this.purge(this.airplanes,   (a) => a.isDead || a.isOffScreen)
    this.purge(this.bombs,       (b) => b.update() || b.isOffScreen)

    for (const child of this.laserGroup.getChildren())    { const s = child as Phaser.Physics.Arcade.Sprite; if (s.x < -120 || s.y > WORLD.HEIGHT + 50) s.destroy() }
    for (const child of this.shurikenGroup.getChildren()) { const s = child as Phaser.Physics.Arcade.Sprite; if (s.x < -120) s.destroy() }

    this.bombShadows = this.bombShadows.filter(sh => {
      if (!sh.active) return false
      const alive = this.bombs.some(b => Math.abs(b.sprite.x - sh.x) < 80)
      if (!alive) { sh.destroy(); return false }
      return true
    })

    // Recount active slots from live arrays
    this.activeGroundGroups =
      (this.wolves.length  > 0 ? 1 : 0) +
      (this.fatCats.length > 0 ? 1 : 0) +
      (this.limos.length   > 0 ? 1 : 0) +
      (this.buses.length   > 0 ? 1 : 0)

    this.activeAirGroups =
      (this.helicopters.length > 0 ? 1 : 0) +
      (this.airplanes.length   > 0 ? 1 : 0)
  }

  private purge<T extends { sprite: Phaser.Physics.Arcade.Sprite }>(
    arr:  T[],
    dead: (e: T) => boolean,
  ): void {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (dead(arr[i])) {
        arr[i].sprite.destroy()
        arr.splice(i, 1)
      }
    }
  }
}
