import Phaser from 'phaser'
import { BaseBoss } from '../entities/enemies/base/BaseBoss'
import type { ICollisionRegistrar } from '../entities/interfaces/ICollisionRegistrar'
import type { IStompHandler } from '../entities/interfaces/IStompHandler'
import type { Hero } from '../entities/Hero'

export class CollisionManager implements ICollisionRegistrar {
  constructor(
    private readonly scene:      Phaser.Scene,
    private readonly groundBody: Phaser.GameObjects.Rectangle,
    private readonly hero:       Hero,
  ) {}

  addGroundCollider(group: Phaser.Physics.Arcade.Group): void {
    this.scene.physics.add.collider(group, this.groundBody)
  }

  addBodyOverlap(group: Phaser.Physics.Arcade.Group): void {
    this.scene.physics.add.overlap(this.hero.sprite, group, () =>
      this.hero.takeDamage(this.scene.time.now)
    )
  }

  addProjectileOverlap(group: Phaser.Physics.Arcade.Group): void {
    this.scene.physics.add.overlap(this.hero.sprite, group, (_hero, projectile) => {
      ;(projectile as Phaser.Physics.Arcade.Sprite).destroy()
      this.hero.takeDamage(this.scene.time.now)
    })
  }

  addStompOverlap(group: Phaser.Physics.Arcade.Group, handler: IStompHandler): void {
    this.scene.physics.add.overlap(this.hero.sprite, group, (h, e) => {
      const heroBody = (h as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.Body
      const bossBody = (e as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.Body
      if (BaseBoss.isStomped(heroBody, bossBody)) {
        this.hero.stomp()
        handler.onStomp()
      } else {
        this.hero.takeDamage(this.scene.time.now)
      }
    })
  }
}

