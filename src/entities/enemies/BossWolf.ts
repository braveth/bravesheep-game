import Phaser from 'phaser'
import { TEX } from '../../config/textures'
import { BaseBoss } from './base/BaseBoss'

export class BossWolf extends BaseBoss {
  constructor(group: Phaser.Physics.Arcade.Group, heroRef: { x: number }) {
    super(group, TEX.BOSS_WOLF, heroRef)
  }

  protected onIdle(_time: number): number { return -1 }
}
