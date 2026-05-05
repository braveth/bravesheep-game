import Phaser from 'phaser'
import { BaseBoss } from '../entities/enemies/base/BaseBoss'
import type { Hero } from '../entities/Hero'

export interface IStompHandler {
  onStomp(): void
}

export interface ICollisionRegistrar {
  addGroundCollider(group: Phaser.Physics.Arcade.Group): void
  addBodyOverlap(group: Phaser.Physics.Arcade.Group): void
  addProjectileOverlap(group: Phaser.Physics.Arcade.Group): void
  addStompOverlap(group: Phaser.Physics.Arcade.Group, handler: IStompHandler): void
}

export class CollisionManager implements ICollisionRegistrar {
  constructor(
    private readonly scene:      Phaser.Scene,
    private readonly groundBody: Phaser.GameObjects.Rectangle,
    private readonly hero:       Hero,
  ) {}

  registerHero(): void {
    this.scene.physics.add.collider(this.hero.sprite, this.groundBody)
  }

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

