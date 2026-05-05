import Phaser from 'phaser'
import { PackCharger } from '../enemies/base/PackCharger'
import type { PackChargerClass } from '../enemies/base/PackCharger'
import { WORLD } from '../../config/world'
import { ENEMY_SPEED_MAX } from '../../config/enemies'
import type { ICollisionRegistrar } from '../../managers/CollisionManager'
import type { ISpawner, LevelConfig } from './ISpawner'

export class PackChargerSpawner<T extends PackCharger> implements ISpawner {
  private readonly bodyGroup: Phaser.Physics.Arcade.Group

  private entities: T[] = []

  constructor(
    scene: Phaser.Scene,
    private readonly Cls: PackChargerClass<T>,
    reg:   ICollisionRegistrar,
  ) {
    this.bodyGroup = scene.physics.add.group()
    reg.addGroundCollider(this.bodyGroup)
    reg.addBodyOverlap(this.bodyGroup)
  }

  spawn(config: LevelConfig, _heroX: number): void {
    const { spawnOffsetX, speed, stagger } = this.Cls.spawnConfig
    const count   = config.packCount
    const trigger = { armedAt: 0 }
    const x       = WORLD.WIDTH + spawnOffsetX
    for (let i = 0; i < count; i++) {
      const e = new this.Cls(this.bodyGroup, x)
      e.packTrigger  = trigger
      e.isPackLeader = i === 0
      e.chargeDelay  = (i * i) / Math.max(1, count - 1) * stagger * config.speedFactor
      e.chargeSpeed  = Math.min(speed * (config.scrollSpeed / WORLD.INITIAL_SCROLL_SPEED), ENEMY_SPEED_MAX)
      this.entities.push(e)
    }
  }

  tick(time: number, heroX: number, scrollSpeed: number, _config: LevelConfig): void {
    for (const e of this.entities) e.update(time, heroX, scrollSpeed)
    this.purge()
  }

  clear(): void {
    for (const e of this.entities) e.sprite.destroy()
    this.entities = []
  }

  private purge(): void {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      if (this.entities[i].isDead || this.entities[i].isOffScreen) {
        this.entities[i].sprite.destroy()
        this.entities.splice(i, 1)
      }
    }
  }
}
