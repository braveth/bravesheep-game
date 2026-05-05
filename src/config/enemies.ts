// Enemy constants — tweak here, not in entity code.

/** Shared safe-distance threshold: enemies won't fire/home within this range. */
export const HERO_SAFE_DISTANCE = 80   // px

/** Shared speed range for scaling enemies (wolves, limos, missiles). */
export const ENEMY_SPEED_MIN = 300   // px/s at base scroll speed
export const ENEMY_SPEED_MAX = 500   // px/s hard cap

export const WOLF = {
  SPEED:           ENEMY_SPEED_MIN,
  SPEED_MAX:       ENEMY_SPEED_MAX,
  HP:                1,
  SPRITE_W:         48,
  SPRITE_H:         36,
  HIT_W:            20,
  HIT_H:            20,
  PACK_MIN:          3,
  PACK_MAX:          3,
  PACK_STAGGER:    400,    // ms -- chargeDelay = i2 * STAGGER (quadratic spacing)
  SPAWN_OFFSET_X:   24,
  GRAVITY:        1200,
  MAX_FALL_SPEED:  900,
} as const

export const FAT_CAT = {
  HP:                1,
  SPRITE_W:         36,
  SPRITE_H:         40,
  HIT_W:            24,
  HIT_H:            34,
  MIN_FIRE_DIST:    HERO_SAFE_DISTANCE,
  SPAWN_OFFSET_X:   20,
} as const

/** Shared laser-projectile constants for all LaserTurret subclasses. */
export const LASER_TURRET = {
  SPEED:            620,
  WIDTH:             56,
  HEIGHT:             4,
  EYE_OFFSET_Y:     -10,  // px above sprite centre -> ~eye height
  LOW_AIM_BEHIND:   120,  // px behind hero where the low shot targets the ground
  FIRE_WINDOW:     3200,  // ms -- total window for all shots
} as const

export const HELICOPTER = {
  HP:                3,
  SPRITE_W:         64,
  SPRITE_H:         32,
  HIT_W:            52,
  HIT_H:            24,
  FLY_Y_MIN:       160,
  FLY_Y_MAX:       220,
  SPEED:           120,
  DROP_LEAD:       320,    // px from hero where first ninja is released
  DROP_INTERVAL:   150,   // ms between consecutive ninja releases (constant, scaled by speedFactor)
  SPAWN_OFFSET:     80,   // px past screen edge to spawn at
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
  MAX_FALL_SPEED:  900,
} as const

// Urban air enemy: Airplane + Bomb drop
export const AIRPLANE = {
  HP:                5,
  SPRITE_W:         80,
  SPRITE_H:         32,
  HIT_W:            68,
  HIT_H:            20,
  FLY_Y:            80,
  SPEED:            80,
  DROP_LEAD:       300,    // px from hero where first bomb is released
  DROP_INTERVAL:   150,   // ms between consecutive bomb releases (constant, scaled by speedFactor)
  SPAWN_OFFSET:     50,   // px past screen edge to spawn at
} as const

export const BOMB = {
  SPRITE_W:              20,
  SPRITE_H:              10,
  HIT_W:                 16,
  HIT_H:                  8,
  SPEED:                ENEMY_SPEED_MIN,   // homing missile base speed (px/s)
  SPEED_MAX:            ENEMY_SPEED_MAX,   // hard cap
  HERO_SAFE_DISTANCE,         // stop homing once within this distance of hero
} as const

// Urban ground enemies: Limo (pack charger) + Bus (turret)
export const LIMO = {
  HP:                1,
  SPRITE_W:         96,
  SPRITE_H:         36,
  HIT_W:            88,
  HIT_H:            28,
  SPEED:           ENEMY_SPEED_MIN,
  SPEED_MAX:       ENEMY_SPEED_MAX,
  PACK_MIN:          3,
  PACK_MAX:          3,
  PACK_STAGGER:    400,    // ms -- chargeDelay = i2 * STAGGER (quadratic spacing)
  SPAWN_OFFSET_X:   40,
} as const

export const BUS = {
  HP:                2,
  SPRITE_W:         80,
  SPRITE_H:         48,
  HIT_W:            72,
  HIT_H:            40,
  // Shares FAT_CAT laser constants (same gameplay behaviour)
  MIN_FIRE_DIST:    HERO_SAFE_DISTANCE,    // px -- won't fire if hero is closer than this
  SPAWN_OFFSET_X:   24,
} as const

export const BOSS = {
  HP:           20,
  SPRITE_W:     80,
  SPRITE_H:     64,
  HIT_W:        64,
  HIT_H:        56,
  SPEED:             80,      // charge speed
  CHARGE_RANGE:     500,     // triggers charge when hero is within this many px
  CHARGE_PAUSE:    1800,    // ms between charges
  GRAVITY:          800,
  MAX_FALL_SPEED:   800,
  ARENA_X_FRAC:    0.68,    // fraction of WORLD.WIDTH where boss holds position
  ENTER_PAUSE:      800,    // ms before boss starts acting after reaching arena
  LASER_CLEANUP_X: -120,   // destroy lasers that scroll past this x
} as const

export const BOSS_CAT = {
  FIRE_DELAY_ENTER:  1200,  // ms before first shot after entering arena
  FIRE_DELAY_RETURN:  500,  // ms before first shot after returning from charge
  FIRE_INTERVAL:      700,  // ms between shots while idle
} as const

/** Shared constants for AirVehicle base class. */
export const AIR_VEHICLE = {
  OFF_SCREEN_MARGIN: 200,  // px past screen edge before despawning
} as const

// Spawn configuration -- controls what appears in each biome slot
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
