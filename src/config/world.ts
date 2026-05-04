// All tunable game constants live here — single source of truth.
// Tweak these values to adjust game feel without touching game logic.
export const WORLD = {
  WIDTH:  960,
  HEIGHT: 540,

  GROUND_Y:      488,   // y coordinate of the top of the ground platform
  GROUND_HEIGHT:  52,   // total visual + physics height of the ground strip

  INITIAL_SCROLL_SPEED: 150,  // px/s  starting world scroll speed
} as const
