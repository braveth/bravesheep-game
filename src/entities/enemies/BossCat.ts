import Phaser from 'phaser'
import { TEX } from '../../config/textures'
import { BaseBoss } from './base/BaseBoss'

export class BossCat extends BaseBoss {
  private nextFireTime = 0

  constructor(group: Phaser.Physics.Arcade.Group, heroRef: { x: number }) {
    super(group, TEX.BOSS_CAT, heroRef)
  }

  protected onEntered(time: number): void {
    this.nextFireTime = time + 1200
  }

  protected onReturned(time: number): void {
    this.nextFireTime = time + 500
  }

  protected onIdle(time: number): number {
    if (time >= this.nextFireTime) {
      this.nextFireTime = time + 700
      return this.sprite.y
    }
    return -1
  }
}
