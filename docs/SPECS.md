# Brave Sheep Game — Requirements & Full Technical Specifications

---

## 1. Framework Decision

### Phaser 3 (TypeScript) — **Recommended**

| Criterion | Phaser 3 | Godot 4 (HTML5 export) |
|---|---|---|
| Browser delivery | Native JS/TS — instant load | WASM bundle (~10–20 MB), slower cold start |
| NFT / Web3 integration | Native — same JS runtime, ethers.js drops in directly | Requires JS↔GDScript bridge, adds complexity |
| 2D physics | Arcade Physics (fast AABB) + Matter.js (arcs/grenades) | Built-in but overkill for 2D side-scroller |
| Pixel art support | TextureAtlas + palette-swap shaders | Excellent, but export overhead |
| Performance ceiling | Sufficient for this scope (WebGL renderer) | Higher ceiling, unnecessary here |
| Community / docs | Large, mature, many side-scroller examples | Growing, HTML5 export less polished |
| Input latency | Sub-frame via native browser events | Extra WASM dispatch layer |

**Verdict:** Use **Phaser 3 + TypeScript**. The game is browser-native, NFT wallet connection is trivial, and Arcade Physics handles all movement. Matter.js (bundled with Phaser) handles arc trajectories for grenades and rocks. Godot is the right choice only if a desktop build is later required — at that point, export the Phaser project to Electron or add a Godot port.

**Asset tooling (characters & art):**

| Tool | Use case |
|---|---|
| **Aseprite** | Primary pixel art editor — frame-by-frame animation, palette management |
| **LibreSprite** | Free/open Aseprite fork |
| **Piskel** | Browser-based, good for quick sprites |
| **TexturePacker** | Pack sprites into atlases (JSON-Hash format, Phaser-native) |
| **Tiled** | Level chunk authoring (used as templates for procedural engine) |
| AI generation | Midjourney / Stable Diffusion for concept art; pixel-upscale with `waifu2x` or `pixelcraft` |

---

## 2. Technical Stack

```
Language:       TypeScript 5.x
Framework:      Phaser 3.x (WebGL renderer, fallback Canvas)
Physics:        Phaser Arcade Physics (character/enemies) + Matter.js (projectile arcs)
Build:          Vite (HMR, tree-shaking, fast dev loop)
NFT/Web3:       ethers.js v6 (wallet connection, NFT metadata)
Asset pipeline: Aseprite → TexturePacker → JSON atlas → Phaser loader
Audio:          Howler.js or Phaser Sound Manager
Testing:        Vitest (unit), Playwright (e2e smoke)
Deployment:     Static site (Vercel / Netlify / IPFS for Web3 alignment)
Node version:   ≥ 20 LTS
```

---

## 3. Project Structure

```
/src
  /scenes
    Boot.ts          — asset preload
    MainMenu.ts      — title, wallet connect, NFT equip
    Game.ts          — main game loop orchestrator
    BossArena.ts     — boss encounter (scrolling paused)
    GameOver.ts      — score, replay
  /entities
    Hero.ts
    enemies/
      Wolf.ts
      FatCat.ts
      Helicopter.ts
      Ninja.ts
      Airplane.ts
    bosses/
      GiantFatCat.ts
      GiantWolf.ts
      Tank.ts
    obstacles/
      Bus.ts
      Limo.ts
    collectibles/
      WeaponBox.ts
  /systems
    ProceduralWorld.ts   — chunk spawner
    EnemySpawner.ts
    DifficultyManager.ts
    NFTService.ts
    PhysicsArc.ts        — grenade/rock trajectory helpers
  /ui
    HUD.ts
    WalletModal.ts
    EquipScreen.ts
  /config
    physics.ts           — all tunable numbers in one place
    enemies.ts           — spawn tables
    nft.ts               — contract addresses, chain config
  /assets
    sprites/
    audio/
    tilemaps/
/public
  index.html
```

---

## 4. Core Game Loop

```
Boot → MainMenu (wallet connect / NFT equip optional) → Game Scene
  └─ Rural Phase (0 – T/2 seconds)
       Enemies: Wolves, Helicopters + Ninjas
       Obstacles: Buses, Limos
  └─ Urban Phase (T/2 – T seconds)
       Enemies: Fat Cats, Airplanes + Bombs
       Obstacles: Buses, Limos
  └─ Weapon Box spawns at T - 10s
  └─ Boss Arena (scrolling stops)
       Boss type: random or seed-determined
  └─ Victory / Death → GameOver → loop
```

- Level duration `T`: configurable, default **120 s**
- Speed increase: every **15 s**, world scroll speed multiplied by **1.12×**
- Max scroll speed cap: **configurable** (default 3× initial)
- Death: any unblocked hit (damage system, see §9)

---

## 5. Player — Hero (Brave Sheep)

### 5.1 Visual

- Pixel art sheep: wool body, superhero cape (palette-swappable per NFT)
- Animations: `idle`, `run`, `jump_rise`, `jump_fall`, `duck`, `attack_swing`, `attack_throw`, `hit`, `death`
- Sprite sheet size: 32×32 px base tile (scale 2×–3× at runtime)
- Cape rendered as separate sprite child (z-index above body, sways on movement)

### 5.2 Hitboxes

| State | Width | Height |
|---|---|---|
| Standing | 18 px | 28 px |
| Crouching | 22 px | 16 px |

Hitbox is centered on sprite; updated on state change via `setSize()` + `setOffset()`.

### 5.3 Physics Constants (`/src/config/physics.ts`)

```typescript
export const HERO_PHYSICS = {
  // Movement
  GROUND_SPEED:        220,   // px/s max horizontal velocity
  AIR_SPEED:           180,   // px/s max horizontal velocity airborne
  ACCELERATION:        900,   // px/s² ground
  AIR_ACCELERATION:    600,   // px/s² airborne (tunable "air control")
  DECELERATION:        1100,  // px/s² drag when no input

  // Jump
  JUMP_VELOCITY:      -520,   // px/s initial vertical (negative = up)
  GRAVITY:             1200,  // px/s²
  JUMP_HOLD_GRAVITY:   700,   // px/s² while jump key held (variable jump height)
  MAX_FALL_SPEED:      900,   // px/s terminal velocity

  // Misc
  COYOTE_TIME:         80,    // ms — can still jump after walking off ledge
  JUMP_BUFFER:         100,   // ms — jump input buffered before landing
};
```

> All values in `physics.ts` are the **single source of truth**. Tweak here, nowhere else.

### 5.4 Movement Rules

- **Ground movement:** full `GROUND_SPEED`, instant direction change
- **Airborne horizontal:** capped at `AIR_SPEED`, acceleration `AIR_ACCELERATION` — player **can reverse direction mid-air** (Mario-style), never locked
- **Jump arc:** hold jump key → lower gravity applied; release → normal gravity resumes → floatier vs snappy feel tunable
- **Duck:** crouch key held → hitbox shrinks, `run` blocked, hero decelerates to 0
- **Backward jump:** left input + jump → same arc, negative horizontal velocity; backward movement on ground always available

### 5.5 Health / Damage

- HP: 3 hits (visual: 3 cape icons in HUD)
- NFT cape modifiers: `DAMAGE_MULTIPLIER` 1.0 → 0.0 (invincible at tier 5)
- Hit invincibility frames: 1200 ms (flashing sprite)
- Death: `death` animation → transition to GameOver after 1.5 s

---

## 6. World & Procedural Generation

### 6.1 Parallax Layers

| Layer | Speed multiplier | Content |
|---|---|---|
| Sky | 0.05× | Gradient, clouds |
| Far BG | 0.2× | Mountains / city skyline silhouettes |
| Mid BG | 0.5× | Trees / buildings |
| Ground decoration | 0.8× | Bushes / fire hydrants |
| Ground platform | 1.0× | The lane the hero runs on |

### 6.2 Procedural Chunk System

- World divided into **chunks** (width = viewport width = 960 px)
- `ProceduralWorld` maintains a pool of 4 active chunks; recycles off-screen chunks
- Each chunk generated from a **weighted spawn table** (entries: enemy group, obstacle, empty gap)
- Spawn tables differ per biome and per difficulty tier
- **Color palette:** each run seeds a palette generator — foreground hue contrasts with background (HSL complementary split or triad). Palettes for Rural and Urban differ. Palette applied via Phaser `tintFill` + palette-swap shader on sprites.

### 6.3 Biome Transition

- At `T/2` a crossfade shader blends Rural palette/BG layers into Urban over 3 s
- Spawner switches spawn table at same timestamp
- Ground tile sheet swaps (dirt/grass → asphalt)

---

## 7. Enemies

All enemies use **Arcade Physics** bodies. Spawned off right edge, despawned off left edge.

### 7.1 Wolves

```
Type:         Ground melee — pack charger
HP:           1 hit (stomp or weapon)
Spawn:        Pack of exactly 3, gap ~80 px between wolves
Speed:        WORLD_SPEED + 220 px/s (fast charge)
Jump:         None — wolves never jump
Behavior:     Front wolf charges immediately; each follower waits until its
              predecessor clears CHARGE_GAP = 80 px, then charges in turn
Hitbox:       20×20 px
Biome:        Rural
```

### 7.2 Fat Cats

```
Type:         Ranged (laser)
HP:           1 hit
Spawn:        Singular, spawns from right edge
Speed:        WORLD_SPEED (scrolls only, no chase)
Attack:       Fires a horizontal laser beam every 2–4 s (random interval)
              Laser is ALWAYS at a fixed mid-screen height (~310 px from top)
              Hero must JUMP OVER or DUCK UNDER the beam
Hitbox:       24×34 px
Biome:        Rural
```

### 7.3 Helicopters

```
Type:         Aerial spawner
HP:           3 hits (can be destroyed)
Spawn:        From the side OPPOSITE the hero:
                hero on left half  → helicopter spawns from right, flies left
                hero on right half → helicopter spawns from left, flies right
Speed:        WORLD_SPEED + 120 px/s
Behavior:     Flies in and drops 3 ninjas when it crosses a point DROP_LEAD
              (200 px) ahead of the hero on the approach side.
              After dropping, continues flying off-screen.
Ninja spread: Ninjas dropped at dropX, dropX ± DROP_SPREAD (45 px)
Biome:        Rural
```

### 7.4 Ninjas

```
Type:         Aerial bouncer (ground melee via high jumps)
HP:           1 hit (stomp or weapon)
Speed:        No horizontal scroll speed — jumps autonomously
Behavior:     Dropped straight down from helicopter.
              On landing, jumps toward hero with a very high arc (vY = -640 px/s).
              Aims each jump at hero's current X using estimated time of flight.
              Hero must DUCK to avoid the arc (ninja sails overhead).
              Jumps indefinitely until stomped or off-screen.
Jump cooldown: 120 ms between landing and next jump
Hitbox:       14×28 px
Biome:        Rural (helicopter-spawned only)
```

### 7.5 Airplanes

```
Type:         Aerial bomber
HP:           5 hits (can be destroyed)
Spawn:        From the side OPPOSITE the hero (same rule as Helicopter)
Speed:        WORLD_SPEED + 80 px/s
Behavior:     Flies in and drops 3 bombs spread around a point DROP_LEAD
              (180 px) ahead of the hero on the approach side.
              After dropping, continues flying off-screen.
Bomb spread:  Bombs dropped at dropCenter, ± DROP_SPREAD (60 px)
Biome:        Urban
```

### 7.6 Bombs

```
Type:         Bouncing projectile (urban equivalent of Ninja)
Spawn:        Dropped by Airplane at the designated drop positions
Behavior:     Falls under gravity with initial horizontal velocity aimed at hero.
              Bounces on the ground (bounce coefficient 0.65) up to MAX_BOUNCES (5).
              Hero takes damage on direct contact — no explosion radius.
              Despawns after MAX_BOUNCES or when off-screen.
Hitbox:       12×16 px
Biome:        Urban (airplane-spawned only)
```

---

## 8. Urban Ground Enemies

### 8.1 Buses

```
Type:         Ranged turret (laser)
HP:           2 hits
Spawn:        Singular, from right edge, scrolls with world
Speed:        WORLD_SPEED (scrolls only, no chase)
Attack:       Fires a horizontal laser beam every 2–4 s (same as Fat Cat)
              Laser at fixed mid-screen height (310 px) — hero must jump or duck
              Laser fires left (toward hero)
Hitbox:       72×40 px
Biome:        Urban  (urban equivalent of Fat Cat)
```

### 8.2 Black Limousines

```
Type:         Ground melee — pack charger  (urban equivalent of Wolf pack)
HP:           1 hit per limo
Spawn:        Pack of exactly 3 limos from right edge, gap = PACK_GAP (80 px)
Speed:        WORLD_SPEED + 260 px/s (faster than wolves)
Jump:         None — vehicle stays on road
Behavior:     Front limo charges immediately; each follower waits until its
              predecessor clears PACK_GAP = 80 px, then charges in turn
Hitbox:       88×28 px
Biome:        Urban  (urban equivalent of Wolf pack)
```

---

## 9. Weapon System

### 9.1 Weapon Box

- Spawns at `T - 10 s` (10 s before boss arena transition)
- Floating crate, glowing outline; hero walks into it → opens → weapon equipped
- If hero already owns NFT weapon of matching boss type → box shows that weapon automatically
- If no NFT → random weapon from pool

### 9.2 Weapons

| Weapon | Boss | Type | Mechanic |
|---|---|---|---|
| **Stick** | Giant Fat Cat | Melee swing | `ATTACK` key → wide hitbox arc, must be within 80 px |
| **Rocks** | Giant Wolf | Arc projectile | Hold `ATTACK` → power charge, release → throws arc; damage on direct hit; range 100–400 px |
| **Grenades** | Tank | Arcing explosive | Hold `ATTACK` → aim angle indicator; release → grenade follows parabolic arc; AoE 80 px on landing |

### 9.3 Arc Trajectory (Rocks & Grenades)

- Computed with Matter.js body or manual ballistic formula:
  `x(t) = v₀·cos(θ)·t`, `y(t) = v₀·sin(θ)·t − ½g·t²`
- Trajectory preview line drawn while holding `ATTACK` (dashed arc, 8 points)
- `v₀` fixed; `θ` derived from charge time: `θ = lerp(20°, 65°, chargeRatio)`

---

## 10. Boss Encounters

At boss transition: scrolling halts, `BossArena` scene overlays, boss enters from right.

### 10.1 Giant Fat Cat

```
Composition:  ~9 smaller fat cats in a 3×3 stack (rendered as one sprite + particle outline)
HP:           12 (each "layer hit" removes one constituent cat visually)
Size:         128×128 px
Attacks:
  - Laser beam (horizontal, high/low variants) — same as normal fat cat
  - Jump slam: leaps toward hero → lands → shockwave hitbox at feet
Movement:     Jumps to reposition; while airborne → hero can duck under safely
Strategy:     Duck under jump arc, close distance, swing stick during landing recovery
Win:          All 12 HP depleted → explosion of cats
```

### 10.2 Giant Wolf

```
Composition:  Fractal wolf (large wolf drawn with small wolves as pixels)
HP:           Phase 1: 8 HP (takes rock hits); Phase 2: splits into 6 small wolves
Phase 1:      Charges hero periodically; hero must dodge and throw rocks (arc required)
Phase 2:      Splits → individual wolves rush in same pattern as normal wolves
              Hero must defeat all 6 (rocks or dodge)
Movement:     Paces, leaps, charges
Strategy:     Maintain distance, aim rocks at arc; in phase 2, duck/rock the pack
Win:          All small wolves defeated
```

### 10.3 Tank

```
HP:           10 (grenade hits only; stick/rocks do nothing)
Size:         160×64 px
Movement:     Rolls back and forth on ground (cannot jump)
Attacks:
  - Cannon shell: fired at hero; hero must jump over shell (ground-level projectile)
  - Secondary turret: fires occasionally, alternates heights
Strategy:     Jump over shells, throw grenades at arc to land on tank top
Win:          10 grenade hits → tank explodes
```

---

## 11. NFT Integration

### 11.1 Architecture

```
src/systems/NFTService.ts
  connect()              → triggers MetaMask / WalletConnect popup
  getOwnedTokens()       → reads ERC-721 / ERC-1155 balance
  parseMetadata(token)   → returns { type: 'cape'|'weapon', tier, attributes }
  isConnected(): boolean
```

- Chain: **Ethereum mainnet** + **Base L2** supported (configurable in `nft.ts`)
- Contract standard: ERC-721 with `tokenURI` returning JSON metadata
- Metadata schema:

```json
{
  "name": "Gold Cape",
  "type": "cape",
  "tier": 3,
  "attributes": {
    "damage_reduction": 0.6,
    "color_hex": "#FFD700",
    "palette_override": ["#FFD700", "#FFA500", "#CC8800"]
  }
}
```

```json
{
  "name": "Iron Stick",
  "type": "weapon",
  "weapon_id": "stick",
  "attributes": {
    "damage_bonus": 1.5,
    "swing_arc_deg": 90
  }
}
```

### 11.2 Cape Effects

| Tier | Damage reduction | Visual |
|---|---|---|
| 0 (default) | 0% | Plain white |
| 1 | 20% | Blue cape |
| 2 | 40% | Purple cape |
| 3 | 60% | Gold cape |
| 4 | 80% | Black cape, particles |
| 5 | 100% (invincible) | Rainbow animated cape |

### 11.3 Equip Screen

- Shown in `MainMenu` after wallet connect
- Lists owned NFTs by type
- Player selects one cape + one weapon (weapon only affects boss; ignored in run if no matching boss)
- Selection persisted in `sessionStorage` (not chain — no gas for equip)

---

## 12. UI / HUD

```
Top-left:    HP indicator (3 cape icons)
Top-center:  Distance/score counter
Top-right:   Current biome indicator + speed tier badge
Bottom-left: Equipped weapon icon (shown when weapon collected)
Boss HP bar: Full-width bar at top during boss fight
```

---

## 13. Audio

| Event | Sound |
|---|---|
| Jump | Short spring SFX |
| Duck | Whoosh |
| Wolf bark | Pack growl per wolf |
| Laser | Zap / hum |
| Bomb explosion | Boom + rumble |
| Ninja shuriken | Swish |
| Weapon swing | Swoosh |
| Rock throw | Thwack |
| Grenade arc | Whistle → boom |
| Boss hit | Deep impact |
| Boss death | Epic SFX |
| Background | Looping chiptune; tempo increases with speed tier |

---

## 14. Difficulty Scaling Table

| Time (s) | Scroll speed mult | Spawn rate mult | New enemy types unlocked |
|---|---|---|---|
| 0–15 | 1.0× | 1.0× | Wolves |
| 15–30 | 1.12× | 1.1× | Buses, Limos |
| 30–45 | 1.25× | 1.2× | Fat Cats |
| 45–60 | 1.40× | 1.35× | Helicopters → Ninjas |
| 60–75 | 1.57× | 1.5× | Airplanes |
| 75–90 | 1.76× | 1.7× | Mixed packs |
| 90–110 | 2.0× | 2.0× | High-density urban |
| 110–120 | 2.0× | 2.5× | Weapon box spawns, boss intro |

---

## 15. Performance Requirements

- Target: **60 fps** on mid-range desktop + mobile (iPhone 13+, Pixel 7+)
- WebGL renderer mandatory; Canvas fallback acceptable for old devices at 30 fps
- Max draw calls per frame: < 100 (use sprite batching / texture atlases)
- Max simultaneous physics bodies: < 80
- Asset bundle (initial load): < 5 MB gzipped
- No memory leaks: all despawned objects returned to object pool

---

## 16. Open Design Questions (Decisions Required Before Build)

| # | Question | Options |
|---|---|---|
| 1 | Run-based or endless? | ① Fixed 120 s run + boss → score board ② Endless scaling with periodic mini-bosses |
| 2 | Leaderboard | ① Off-chain (Supabase) ② On-chain score (gas cost) ③ None |
| 3 | NFT minting in-game? | ① External marketplace only ② In-game mint UI |
| 4 | Mobile controls | ① Virtual d-pad ② Swipe gestures ③ Desktop only for MVP |
| 5 | Multiplayer? | Out of scope for v1 |
| 6 | Exact HP tuning numbers | Requires playtest; placeholders in §5.5 and §10 |

---

## 17. Recommended Build Phases

| Phase | Deliverable |
|---|---|
| **P0 — Core** | Hero controller with all physics constants; flat ground level; scroll system |
| **P1 — Enemies** | Wolves + Fat Cats + spawn system; collision + damage; HUD HP |
| **P2 — World** | Procedural chunks; parallax layers; biome transition; palettes |
| **P3 — Full enemies** | Ninjas + Helicopters + Airplanes + Buses + Limos |
| **P4 — Bosses** | Weapon box; all 3 bosses; BossArena scene |
| **P5 — NFT** | Wallet connect; cape equip; weapon ownership; metadata parsing |
| **P6 — Polish** | Audio; particles; animations; difficulty table tuning; mobile controls |
| **P7 — Launch** | Leaderboard; IPFS/Vercel deploy; smart contract deploy |
