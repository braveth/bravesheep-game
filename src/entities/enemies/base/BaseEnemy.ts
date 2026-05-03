import Phaser from 'phaser'

/**
 * Common base for all enemy entities.
 * Creates the sprite, owns hp via sprite data, and provides damage().
 * Subclasses handle body setup (setSize/setOffset/gravity) in their own
 * constructors immediately after calling super().
 */
export abstract class BaseEnemy {
  readonly sprite: Phaser.Physics.Arcade.Sprite

  constructor(
    group:      Phaser.Physics.Arcade.Group,
    x:          number,
    y:          number,
    textureKey: string,
    hp:         number,
  ) {
    this.sprite = group.create(x, y, textureKey) as Phaser.Physics.Arcade.Sprite
    this.sprite.setData('hp', hp)
  }

  get hp():     number  { return this.sprite.getData('hp') as number }
  get isDead(): boolean { return this.hp <= 0 }

  /** Returns true when the sprite has scrolled off-screen. */
  abstract get isOffScreen(): boolean

  damage(): void {
    this.sprite.setData('hp', this.hp - 1)
  }
}
