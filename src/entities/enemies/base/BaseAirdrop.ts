import type Phaser from 'phaser'

/**
 * Common base for all airdrop payloads (Ninja, Bomb).
 * Standardises the constructor signature so AirVehicleSpawner can create
 * any payload without knowing the concrete type.
 */
export abstract class BaseAirdrop {
  abstract readonly sprite: Phaser.Physics.Arcade.Sprite

  /**
   * Per-frame tick. Returns true when this payload should be removed.
   * Implementations may ignore heroX / scrollSpeed if not needed.
   */
  abstract tick(time: number, heroX: number, scrollSpeed: number): boolean

  abstract get isOffScreen(): boolean
}
