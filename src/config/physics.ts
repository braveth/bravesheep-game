// All tunable game constants live here — single source of truth.
// Tweak these values to adjust game feel without touching game logic.

export const HERO_PHYSICS = {
  // Ground movement
  GROUND_SPEED:       220,   // px/s  max horizontal velocity on ground
  AIR_SPEED:          180,   // px/s  max horizontal velocity airborne
  ACCELERATION:       900,   // px/s² acceleration (ground)
  AIR_ACCELERATION:   600,   // px/s² acceleration (airborne — "air control")
  DECELERATION:      1100,   // px/s² drag when no directional input (ground)
  AIR_DECELERATION:   330,   // px/s² drag when no directional input (air)

  // Jump
  JUMP_VELOCITY:     -520,   // px/s  initial vertical velocity (negative = up)
  GRAVITY:           1200,   // px/s² normal gravity (applied per-body, world gravity = 0)
  JUMP_HOLD_GRAVITY:  700,   // px/s² reduced gravity while jump key held + ascending
  MAX_FALL_SPEED:     900,   // px/s  terminal velocity cap

  // Jump feel
  COYOTE_TIME:         80,   // ms    window to jump after walking off a ledge
  JUMP_BUFFER:        100,   // ms    window to queue a jump before landing
} as const

export const WORLD = {
  WIDTH:  960,
  HEIGHT: 540,

  GROUND_Y:      488,   // y coordinate of the top of the ground platform
  GROUND_HEIGHT:  52,   // total visual + physics height of the ground strip

  INITIAL_SCROLL_SPEED: 150,  // px/s  starting world scroll speed
} as const
