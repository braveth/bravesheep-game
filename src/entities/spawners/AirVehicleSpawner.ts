import Phaser from 'phaser'
import { AirVehicle } from '../enemies/base/AirVehicle'
import type { AirVehicleClass } from '../enemies/base/AirVehicle'
import type { BaseAirdrop } from '../enemies/base/BaseAirdrop'
import { WORLD } from '../../config/world'
import type { ICollisionRegistrar } from '../../managers/CollisionManager'
import type { ISpawner, LevelConfig } from './ISpawner'

export class AirVehicleSpawner<T extends AirVehicle> implements ISpawner {
  private vehicles: T[] = []
  private drops: Array<{ payload: BaseAirdrop; shadow: Phaser.GameObjects.Rectangle | null }> = []

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
      if (idx !== -1) this.drop(v, heroX, scrollSpeed)
    }
    this.drops = this.drops.filter(({ payload, shadow }) => {
      if (!payload.sprite.body) { shadow?.destroy(); return false }
      const done = payload.tick(time, heroX, scrollSpeed)
      if (done) { payload.sprite.destroy(); shadow?.destroy(); return false }
      if (shadow) shadow.setX(payload.sprite.x)
      return true
    })
    this.purgeVehicles()
  }

  clear(): void {
    for (const v of this.vehicles) v.sprite.destroy()
    for (const { payload, shadow } of this.drops) { payload.sprite.destroy(); shadow?.destroy() }
    this.vehicles = []
    this.drops    = []
  }

  private drop(vehicle: T, heroX: number, scrollSpeed: number): void {
    const { payloadClass, payloadHasShadow } = this.Cls.spawnConfig
    const payload = new payloadClass(this.payloadGroup, vehicle.sprite.x, vehicle.sprite.y + 20, heroX, scrollSpeed)
    const shadow  = payloadHasShadow
      ? this.scene.add.rectangle(vehicle.sprite.x, WORLD.GROUND_Y - 4, 20, 8, 0xff4400, 0.5).setDepth(4)
      : null
    this.drops.push({ payload, shadow })
  }

  private purgeVehicles(): void {
    for (let i = this.vehicles.length - 1; i >= 0; i--) {
      if (this.vehicles[i].isDead || this.vehicles[i].isOffScreen) {
        this.vehicles[i].sprite.destroy()
        this.vehicles.splice(i, 1)
      }
    }
  }
}
