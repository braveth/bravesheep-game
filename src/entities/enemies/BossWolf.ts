import Phaser from 'phaser'
import { BaseBoss } from './base/BaseBoss'

export class BossWolf extends BaseBoss {
  constructor(group: Phaser.Physics.Arcade.Group, heroRef: { x: number }) {
    super(group, 'boss-wolf', heroRef)
  }

  protected onIdle(_time: number): number { return -1 }
}
