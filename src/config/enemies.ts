// Enemy constants — tweak here, not in entity code.

export const WOLF = {
  SPEED:           300,    // fast charge speed (no jumping)
  HP:                1,
  SPRITE_W:         48,
  SPRITE_H:         36,
  HIT_W:            20,
  HIT_H:            20,
  PACK_MIN:          3,
  PACK_MAX:          3,
  PACK_STAGGER:    400,    // ms -- chargeDelay = i2 * STAGGER (quadratic spacing)
} as const

export const FAT_CAT = {
  HP:                1,
  SPRITE_W:         36,
  SPRITE_H:         40,
  HIT_W:            24,
  HIT_H:            34,
  LASER_SPEED:     620,
  LASER_W:          56,
  LASER_H:           4,
  LASER_EYE_OFFSET_Y: -10,  // px above sprite centre -> ~eye height
  LASER_LOW_AIM_BEHIND: 120, // px behind hero where the low shot targets the ground
  LASER_FIRE_WINDOW: 3200,   // ms -- total window for all shots to fit within
  LASER_MIN_GAP:      70,    // ms -- minimum gap between consecutive shots
  MIN_FIRE_DIST:    80,    // px -- won't fire if hero is closer than this
} as const

export const HELICOPTER = {
  HP:                3,
  SPRITE_W:         64,
  SPRITE_H:         32,
  HIT_W:            52,
  HIT_H:            24,
  FLY_Y_MIN:       160,
  FLY_Y_MAX:       220,
  SPEED:           120,    // faster than before
  HOVER_DURATION: 1000,    // (unused -- no hover, kept for reference)
  NINJA_DROP_COUNT:  3,    // always drop exactly 3
  DROP_LEAD:       320,    // px from hero where first ninja is released
  DROP_INTERVAL:   150,   // ms between consecutive ninja releases (constant, scaled by speedFactor)
} as const

export const NINJA = {
  HP:                1,
  SPRITE_W:         20,
  SPRITE_H:         32,
  HIT_W:            14,
  HIT_H:            28,
  JUMP_VELOCITY:  -640,    // very high arc -- player must duck under
  JUMP_HVX:        260,    // horizontal speed per bounce (direction locked at drop)
  GRAVITY:        1100,
  JUMP_COOLDOWN:   120,    // ms between landing and next jump
} as const

// Urban air enemy: Airplane + Bomb drop
export const AIRPLANE = {
  HP:                5,
  SPRITE_W:         80,
  SPRITE_H:         32,
  HIT_W:            68,
  HIT_H:            20,
  FLY_Y:            80,
  SPEED:            80,    // faster than before
  BOMB_DROP_COUNT:   3,    // drops 3 bombs per pass (sequential)
  DROP_LEAD:       300,    // px from hero where first bomb is released
  DROP_INTERVAL:   150,   // ms between consecutive bomb releases (constant, scaled by speedFactor)
} as const

export const BOMB = {
  SPRITE_W:         16,
  SPRITE_H:         20,
  HIT_W:            12,
  HIT_H:            16,
  JUMP_VELOCITY:  -580,    // bouncing arc velocity
  GRAVITY:        1000,
  MAX_BOUNCES:       5,    // despawn after this many bounces without hitting hero
} as const

// Urban ground enemies: Limo (pack charger) + Bus (turret)
export const LIMO = {
  HP:                1,
  SPRITE_W:         96,
  SPRITE_H:         36,
  HIT_W:            88,
  HIT_H:            28,
  SPEED:           340,    // fast charge (car)
  PACK_MIN:          3,
  PACK_MAX:          3,
  PACK_STAGGER:    400,    // ms -- chargeDelay = i2 * STAGGER (quadratic spacing)
} as const

export const BUS = {
  HP:                2,
  SPRITE_W:         80,
  SPRITE_H:         48,
  HIT_W:            72,
  HIT_H:            40,
  // Shares FAT_CAT laser constants (same gameplay behaviour)
  MIN_FIRE_DIST:    80,    // px -- won't fire if hero is closer than this
} as const

export const BOSS = {
  HP:           20,
  SPRITE_W:     80,
  SPRITE_H:     64,
  HIT_W:        64,
  HIT_H:        56,
  SPEED:        80,      // charge speed
  CHARGE_RANGE: 500,     // triggers charge when hero is within this many px
  CHARGE_PAUSE: 1800,    // ms between charges
} as const

// Spawn configuration -- controls what appears in each biome slot
export const SPAWN_CONFIG = {
  simultaneous:     false,   // air + ground at the same time?
  maxGroundActive:      1,   // max concurrent ground enemy groups
  maxAirActive:         1,   // max concurrent air enemy groups
} as const

export const DIFFICULTY = {
  // ── Base values (level 0) ───────────────────────────────────────────────
  scrollSpeed:   150,   // px/s
  waveInterval: 5000,   // ms between waves
  turretShots:     3,   // laser shots per turret encounter
  airDropCount:    3,   // ninjas/bombs per air-vehicle pass
  packCount:       3,   // units per ground pack
  packSpeedMult: 1.0,   // charge speed multiplier

  // ── Per-level increment (applied n times at level n) ───────────────────
  stepScrollSpeed:     50,   // +px/s per level
  stepWaveInterval:  -100,   // ms per level (negative = faster waves)
  stepTurretShots:      1,   // +shots per level
  stepAirDropCount:     1,   // +drops per level
  stepPackCount:        1,   // +chargers per level
  stepPackSpeedMult:  0.25,   // +multiplier per level

  // ── Level progression ──────────────────────────────────────────────────
  levelInterval:   30,   // seconds between level increases
  levelMax:         5,   // maximum level (caps all increments)
} as const
