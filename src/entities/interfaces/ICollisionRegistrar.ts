import type Phaser from 'phaser'
import type { IStompHandler } from './IStompHandler'

export interface ICollisionRegistrar {
  addGroundCollider(group: Phaser.Physics.Arcade.Group): void
  addBodyOverlap(group: Phaser.Physics.Arcade.Group): void
  addProjectileOverlap(group: Phaser.Physics.Arcade.Group): void
  addStompOverlap(group: Phaser.Physics.Arcade.Group, handler: IStompHandler): void
}
