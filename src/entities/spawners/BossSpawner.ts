import Phaser from 'phaser'
import { BaseBoss } from '../enemies/base/BaseBoss'
import type { IBossConfig } from '../../chapters/IChapter'
import type { ICollisionRegistrar } from '../interfaces/ICollisionRegistrar'
import type { IStompHandler } from '../interfaces/IStompHandler'
import { EVENTS } from '../../config/events'
import { BOSS } from '../../config/enemies'
import { TEX } from '../../config/textures'

export class BossSpawner implements IStompHandler {
  readonly maxHp: number

  private readonly scene:          Phaser.Scene
  private readonly bossLaserGroup: Phaser.Physics.Arcade.Group
  private readonly boss:           BaseBoss

  constructor(
    scene:      Phaser.Scene,
    bossConfig: IBossConfig,
    heroRef:    { x: number },
    reg:        ICollisionRegistrar,
  ) {
    this.scene          = scene
    const stompGroup    = scene.physics.add.group()
    this.bossLaserGroup = scene.physics.add.group()
    reg.addGroundCollider(stompGroup)
    reg.addProjectileOverlap(this.bossLaserGroup)
    reg.addStompOverlap(stompGroup, this)

    this.boss  = new bossConfig.boss(stompGroup, heroRef)
    this.maxHp = this.boss.hp
  }

  get alive(): boolean { return !this.boss.isDead }
  get hp():    number  { return this.boss.hp }

  onStomp(): void { this.damage() }

  damage(): void {
    this.boss.damage()
    this.scene.events.emit(EVENTS.BOSS_HP, this.hp)
  }

  update(time: number): void {
    const laserY = this.boss.update(time)
    if (laserY !== -1) {
      const { width, height, speed } = this.boss.laserConfig
      const laser = this.bossLaserGroup.create(
        this.boss.sprite.x - BOSS.SPRITE_W / 2, laserY, TEX.LASER,
      ) as Phaser.Physics.Arcade.Sprite
      const body = laser.body as Phaser.Physics.Arcade.Body
      body.setSize(width, height)
      body.setAllowGravity(false)
      body.setVelocityX(-speed)
    }

    for (const child of this.bossLaserGroup.getChildren()) {
      const s = child as Phaser.Physics.Arcade.Sprite
      if (s.x < BOSS.LASER_CLEANUP_X) s.destroy()
    }
  }

  clear(): void {
    this.boss.sprite.destroy()
    this.bossLaserGroup.clear(true, true)
  }
}
