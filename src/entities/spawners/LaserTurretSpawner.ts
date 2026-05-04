import Phaser from 'phaser'
import { LaserTurret } from '../enemies/base/LaserTurret'
import type { LaserTurretClass } from '../enemies/base/LaserTurret'
import { LASER_TURRET } from '../../config/enemies'
import { TEX } from '../../config/textures'
import { WORLD } from '../../config/world'
import type { ICollisionRegistrar } from '../interfaces/ICollisionRegistrar'
import type { ISpawner } from '../interfaces/ISpawner'
import type { LevelConfig } from '../../config/LevelConfig'

export class LaserTurretSpawner<T extends LaserTurret> implements ISpawner {
  private entities: T[] = []
  private readonly scene:      Phaser.Scene
  private readonly group:      Phaser.Physics.Arcade.Group
  private readonly laserGroup: Phaser.Physics.Arcade.Group

  constructor(
    scene: Phaser.Scene,
    private readonly Cls: LaserTurretClass<T>,
    reg:   ICollisionRegistrar,
  ) {
    this.scene      = scene
    this.group      = scene.physics.add.group()
    this.laserGroup = scene.physics.add.group()
    reg.addBodyOverlap(this.group)
    reg.addProjectileOverlap(this.laserGroup)
  }

  spawn(_config: LevelConfig, _heroX: number): void {
    this.entities.push(new this.Cls(this.scene, this.group, WORLD.WIDTH + this.Cls.spawnConfig.spawnOffsetX))
  }

  tick(time: number, heroX: number, scrollSpeed: number, config: LevelConfig): void {
    for (const e of this.entities) {
      const shot = e.update(time, scrollSpeed, heroX, config.turretShots, config.speedFactor)
      if (shot !== -1) this.fireLaser(e.sprite, shot, heroX)
    }
    this.purge()
    for (const child of this.laserGroup.getChildren()) {
      const s = child as Phaser.Physics.Arcade.Sprite
      if (s.x < -120 || s.y > WORLD.HEIGHT + 50) s.destroy()
    }
  }

  clear(): void {
    for (const e of this.entities) e.sprite.destroy()
    this.entities = []
    this.laserGroup.clear(true, true)
  }

  private fireLaser(shooter: Phaser.Physics.Arcade.Sprite, shotType: 0 | 1, heroX: number): void {
    const fireY = shooter.y + LASER_TURRET.EYE_OFFSET_Y
    const laser = this.laserGroup.create(shooter.x, fireY, TEX.LASER) as Phaser.Physics.Arcade.Sprite
    const body  = laser.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)

    const shootDir = heroX < shooter.x ? -1 : 1

    if (shotType === 0) {
      body.setSize(LASER_TURRET.WIDTH, LASER_TURRET.HEIGHT)
      body.setVelocityX(shootDir * LASER_TURRET.SPEED)
    } else {
      const targetX = heroX + shootDir * LASER_TURRET.LOW_AIM_BEHIND
      const targetY = WORLD.GROUND_Y
      const dx = targetX - shooter.x
      const dy = targetY - fireY
      const len = Math.sqrt(dx * dx + dy * dy)
      body.setSize(LASER_TURRET.HEIGHT, LASER_TURRET.HEIGHT)
      body.setVelocity((dx / len) * LASER_TURRET.SPEED, (dy / len) * LASER_TURRET.SPEED)
      laser.setAngle(Math.atan2(dy, dx) * (180 / Math.PI))
    }
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
