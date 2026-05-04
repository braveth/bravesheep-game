// Hero tuning constants — tweak here, not in entity code.

export const HERO = {
  // Sprite / hitbox
  SPRITE_W:          32,
  SPRITE_H:          48,
  HIT_W:             18,
  HIT_H:             34,
  HIT_OX:             7,   // (SPRITE_W - HIT_W) / 2
  HIT_OY:            14,   // SPRITE_H - HIT_H

  // Ground movement
  GROUND_SPEED:     220,   // px/s  max horizontal velocity on ground
  AIR_SPEED:        180,   // px/s  max horizontal velocity airborne
  ACCELERATION:     900,   // px/s² acceleration (ground)
  AIR_ACCELERATION: 600,   // px/s² acceleration (airborne)
  DECELERATION:    1100,   // px/s² drag when no input (ground)
  AIR_DECELERATION: 330,   // px/s² drag when no input (air)

  // Jump
  JUMP_VELOCITY:   -520,   // px/s  initial vertical velocity (negative = up)
  GRAVITY:         1200,   // px/s² applied per-body (world gravity = 0)
  MAX_FALL_SPEED:   900,   // px/s  terminal velocity cap
  COYOTE_TIME:       80,   // ms    jump window after walking off a ledge
  JUMP_BUFFER:      100,   // ms    jump window before landing

  // Combat
  INVINCIBILITY_MS: 1200,  // ms    iframes after taking damage
  STOMP_BOUNCE_VY: -320,   // px/s  upward bounce after stomping an enemy
} as const
