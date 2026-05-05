import Phaser from 'phaser'
import { AirVehicle } from '../enemies/base/AirVehicle'
import type { AirVehicleClass } from '../enemies/base/AirVehicle'
import type { BaseAirdrop } from '../enemies/base/BaseAirdrop'
import { WORLD } from '../../config/world'
import type { ICollisionRegistrar } from '../../managers/CollisionManager'
import type { ISpawner, LevelConfig } from './ISpawner'

export class AirVehicleSpawner<T extends AirVehicle> implements ISpawner {
  private vehicles: T[]           = []
  private payloads: BaseAirdrop[] = []
  private shadows:  Phaser.GameObjects.Rectangle[] = []

  private readonly scene:        Phaser.Scene
  private readonly vehicleGroup: Phaser.Physics.Arcade.Group
  private readonly payloadGroup: Phaser.Physics.Arcade.Group

  constructor(
    scene: Phaser.Scene,
    private readonly Cls: AirVehicleClass<T>,
    reg:   ICollisionRegistrar,
  ) {
    this.scene        = scene
    this.vehicleGroup = scene.physics.add.group()
    this.payloadGroup = scene.physics.add.group()
    reg.addGroundCollider(this.payloadGroup)
    if (Cls.spawnConfig.payloadIsProjectile) reg.addProjectileOverlap(this.payloadGroup)
    else                                     reg.addBodyOverlap(this.payloadGroup)
  }

  spawn(_config: LevelConfig, heroX: number): void {
    this.vehicles.push(new this.Cls(this.vehicleGroup, heroX))
  }

  tick(time: number, heroX: number, scrollSpeed: number, config: LevelConfig): void {
    for (const v of this.vehicles) {
      const idx = v.update(time, heroX, scrollSpeed, config.airDropCount, config.speedFactor)
      if (idx !== -1) this.drop(v, heroX)
    }
    // Tick payloads once; filter out done ones in the same pass
    this.payloads = this.payloads.filter(p => {
      if (!p.sprite.body) return false  // destroyed by collision callback
      const done = p.tick(time, heroX, scrollSpeed)
      if (done) { p.sprite.destroy(); return false }
      return true
    })
    this.purgeVehicles()
    this.purgeShadows()
  }

  clear(): void {
    for (const v of this.vehicles) v.sprite.destroy()
    for (const p of this.payloads) p.sprite.destroy()
    for (const sh of this.shadows) sh.destroy()
    this.vehicles = []
    this.payloads = []
    this.shadows  = []
  }

  private drop(vehicle: T, heroX: number): void {
    const { payloadClass, payloadHasShadow } = this.Cls.spawnConfig
    const p = new payloadClass(this.payloadGroup, vehicle.sprite.x, vehicle.sprite.y + 20, heroX)
    this.payloads.push(p)
    if (payloadHasShadow) {
      const sh = this.scene.add.rectangle(vehicle.sprite.x, WORLD.GROUND_Y - 4, 20, 8, 0xff4400, 0.5).setDepth(4)
      this.shadows.push(sh)
    }
  }

  private purgeVehicles(): void {
    for (let i = this.vehicles.length - 1; i >= 0; i--) {
      if (this.vehicles[i].isDead || this.vehicles[i].isOffScreen) {
        this.vehicles[i].sprite.destroy()
        this.vehicles.splice(i, 1)
      }
    }
  }

  private purgeShadows(): void {
    this.shadows = this.shadows.filter(sh => {
      if (!sh.active) return false
      const alive = this.payloads.some(p => Math.abs(p.sprite.x - sh.x) < 80)
      if (!alive) { sh.destroy(); return false }
      return true
    })
  }
}
