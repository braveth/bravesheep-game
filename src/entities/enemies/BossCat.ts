import Phaser from 'phaser'
import { TEX } from '../../config/textures'
import { BOSS_CAT } from '../../config/enemies'
import { BaseBoss } from './base/BaseBoss'

export class BossCat extends BaseBoss {
  private nextFireTime = 0

  constructor(group: Phaser.Physics.Arcade.Group, heroRef: { x: number }) {
    super(group, TEX.BOSS_CAT, heroRef)
  }

  protected onEntered(time: number): void {
    this.nextFireTime = time + BOSS_CAT.FIRE_DELAY_ENTER
  }

  protected onReturned(time: number): void {
    this.nextFireTime = time + BOSS_CAT.FIRE_DELAY_RETURN
  }

  protected onIdle(time: number): number {
    if (time >= this.nextFireTime) {
      this.nextFireTime = time + BOSS_CAT.FIRE_INTERVAL
      return this.sprite.y
    }
    return -1
  }
}
