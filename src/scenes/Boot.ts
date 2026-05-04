import Phaser from 'phaser'
import { TEX } from '../config/textures'

export class Boot extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' })
  }

  create(): void {
    this.makeHeroTexture()
    this.makeGroundTexture()
    this.makeRuralTexture()
    this.makeWolfTexture()
    this.makeFatCatTexture()
    this.makeLaserTexture()
    this.makeHpIconTexture()
    this.makeUrbanTexture()
    this.makeHelicopterTexture()
    this.makeNinjaTexture()
    this.makeShurikenTexture()
    this.makeAirplaneTexture()
    this.makeBombTexture()
    this.makeLimoTexture()
    this.makeBusTexture()
    this.scene.start('Home')
  }

  // ── Hero: 32×48 px, origin (0.5, 0.5) ──────────────────────────────────
  private makeHeroTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false)

    // Cape (behind body — drawn first)
    g.fillStyle(0xcc0000)
    g.fillTriangle(7, 22, 0, 46, 9, 40)

    // Wool body
    g.fillStyle(0xeeeeee)
    g.fillRoundedRect(7, 20, 18, 20, 5)

    // Head
    g.fillCircle(16, 11, 10)

    // Inner ear
    g.fillStyle(0xffb090)
    g.fillEllipse(8, 6, 4, 7)

    // Snout
    g.fillEllipse(20, 15, 9, 6)

    // Nostrils
    g.fillStyle(0xcc7755)
    g.fillCircle(18, 15, 1)
    g.fillCircle(21, 15, 1)

    // Eye
    g.fillStyle(0x222222)
    g.fillCircle(13, 9, 2)

    // Eye shine
    g.fillStyle(0xffffff)
    g.fillCircle(14, 8, 1)

    // Cape shading stripe
    g.fillStyle(0xaa0000)
    g.fillTriangle(7, 22, 3, 38, 7, 34)

    g.generateTexture(TEX.HERO, 32, 48)
    g.destroy()
  }

  // ── Ground tile: 32×32 px ───────────────────────────────────────────────
  private makeGroundTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false)

    // Grass top
    g.fillStyle(0x3ab83a)
    g.fillRect(0, 0, 32, 8)

    // Dirt
    g.fillStyle(0x8b5e3c)
    g.fillRect(0, 8, 32, 24)

    // Grass highlights
    g.fillStyle(0x55d055)
    g.fillRect(2, 0, 4, 4)
    g.fillRect(12, 0, 3, 5)
    g.fillRect(22, 0, 5, 3)

    // Dirt spots
    g.fillStyle(0x7a4e2c)
    g.fillCircle(8, 18, 3)
    g.fillCircle(24, 22, 2)
    g.fillCircle(16, 28, 2)

    g.generateTexture(TEX.GROUND, 32, 32)
    g.destroy()
  }

  // ── Rural parallax tile: 320×80 px ─────────────────────────────────────
  private makeRuralTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false)
    const H = 80

    // Dark green hill silhouettes — circles centred below bottom edge
    // so only the tops peek into the tile
    g.fillStyle(0x237a23)
    g.fillCircle(60, H, 68)
    g.fillCircle(180, H, 88)
    g.fillCircle(290, H, 58)

    // Lighter highlight on top of each hill
    g.fillStyle(0x2ea82e)
    g.fillCircle(60, H - 20, 44)
    g.fillCircle(180, H - 24, 58)
    g.fillCircle(290, H - 16, 38)

    g.generateTexture(TEX.RURAL_BG, 320, H)
    g.destroy()
  }

  // ── Wolf: 48×36 px — drawn facing RIGHT; Wolf.ts applies setFlipX(true) ─
  // (left = tail/rear, right = head/snout — after flip it correctly faces left)
  private makeWolfTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false)

    // Tail (left side = rear when facing right)
    g.fillStyle(0x6a6a80)
    g.fillRoundedRect(0, 9, 12, 6, 4)

    // Main body
    g.fillStyle(0x555566)
    g.fillRoundedRect(6, 13, 28, 17, 4)

    // Belly lighter shade
    g.fillStyle(0x7a7a90)
    g.fillEllipse(20, 24, 16, 7)

    // Head (right side — front when facing right)
    g.fillStyle(0x555566)
    g.fillCircle(35, 12, 12)

    // Snout / muzzle
    g.fillStyle(0x8888aa)
    g.fillEllipse(45, 16, 10, 7)

    // Nose (black tip, rightmost)
    g.fillStyle(0x111111)
    g.fillCircle(47, 14, 2)

    // Angry red eye
    g.fillStyle(0xff3333)
    g.fillCircle(31, 9, 3)
    // Eye shine
    g.fillStyle(0xffffff)
    g.fillCircle(32, 8, 1)

    // Pointy wolf ears on top-right of head
    g.fillStyle(0x333344)
    g.fillTriangle(26, 5, 22, 0, 32, 9)   // rear ear
    g.fillTriangle(36, 3, 32, 0, 42, 9)   // front ear
    // Inner ear (pink)
    g.fillStyle(0xffbbbb)
    g.fillTriangle(27, 5, 24, 2, 31, 8)
    g.fillTriangle(37, 4, 34, 1, 41, 8)

    // Four legs (running stance — alternating heights)
    g.fillStyle(0x444455)
    g.fillRect(10, 28, 5, 8)   // rear-left
    g.fillRect(17, 29, 5, 7)   // rear-right
    g.fillRect(23, 28, 5, 8)   // front-left
    g.fillRect(30, 29, 5, 7)   // front-right

    g.generateTexture(TEX.WOLF, 48, 36)
    g.destroy()
  }

  // ── FatCat: 36×40 px ────────────────────────────────────────────────────
  private makeFatCatTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false)

    // Fat body (wide ellipse — obviously overweight)
    g.fillStyle(0xdd7722)
    g.fillEllipse(18, 27, 34, 26)

    // Belly (pale stripe)
    g.fillStyle(0xffcc88)
    g.fillEllipse(18, 29, 18, 14)

    // Tabby stripes on body
    g.fillStyle(0xaa4400)
    g.fillRect(8,  18, 3, 12)
    g.fillRect(14, 16, 2, 14)
    g.fillRect(20, 16, 2, 14)
    g.fillRect(25, 18, 3, 12)

    // Head
    g.fillStyle(0xdd7722)
    g.fillCircle(18, 13, 12)

    // Ears
    g.fillStyle(0xdd7722)
    g.fillTriangle(8,  4, 5,  0, 14, 6)
    g.fillTriangle(28, 4, 31, 0, 22, 6)
    // Inner ear
    g.fillStyle(0xff9999)
    g.fillTriangle(9,  4, 7,  2, 13, 6)
    g.fillTriangle(27, 4, 29, 2, 23, 6)

    // Glowing laser eyes
    g.fillStyle(0x00ee55)
    g.fillCircle(13, 12, 4)
    g.fillCircle(23, 12, 4)
    // Pupils (vertical slit — cat eyes)
    g.fillStyle(0x001a00)
    g.fillEllipse(13, 12, 2, 5)
    g.fillEllipse(23, 12, 2, 5)
    // Eye shine
    g.fillStyle(0xaaffcc)
    g.fillCircle(14, 11, 1)
    g.fillCircle(24, 11, 1)

    // Whiskers — the most cat-like feature
    g.fillStyle(0xffffff)
    g.fillRect(0,  14, 11, 1)   // left whisker 1
    g.fillRect(1,  16, 10, 1)   // left whisker 2
    g.fillRect(25, 14, 11, 1)   // right whisker 1
    g.fillRect(25, 16, 10, 1)   // right whisker 2

    // Scowl
    g.fillStyle(0x000000)
    g.fillRect(14, 18, 8, 1)
    g.fillRect(13, 17, 2, 2)
    g.fillRect(21, 17, 2, 2)

    // Stubby legs
    g.fillStyle(0xaa4400)
    g.fillRect(7,  36, 8, 4)
    g.fillRect(21, 36, 8, 4)

    g.generateTexture(TEX.FAT_CAT, 36, 40)
    g.destroy()
  }

  // ── Laser: 56×4 px ──────────────────────────────────────────────────────
  private makeLaserTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false)

    g.fillStyle(0xff22cc)  // outer glow
    g.fillRect(0, 0, 56, 4)
    g.fillStyle(0xff88ee)  // mid
    g.fillRect(0, 1, 56, 2)
    g.fillStyle(0xffffff)  // hot core
    g.fillRect(0, 1, 56, 1)

    g.generateTexture(TEX.LASER, 56, 4)
    g.destroy()
  }

  // ── HP icon: 20×20 px ───────────────────────────────────────────────────
  private makeHpIconTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false)

    // Cape shape: collar bar + flowing triangle
    g.fillStyle(0xcc0000)
    g.fillRect(2, 0, 16, 5)       // collar
    g.fillTriangle(2, 5, 10, 20, 18, 5)  // flowing cape body

    // Highlight
    g.fillStyle(0xff5555)
    g.fillRect(4, 0, 4, 3)
    g.fillTriangle(4, 5, 8, 15, 10, 5)

    g.generateTexture(TEX.HP_ICON, 20, 20)
    g.destroy()
  }

  // ── Urban background tile: 320×80 px (transparent bg, building silhouettes) ─
  // Sky colour comes from Game's skyBg rectangle; only the shapes are drawn here.
  private makeUrbanTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false)
    const H = 80

    // Building silhouettes — dark blue-grey, bases flush with bottom of tile
    g.fillStyle(0x1e2d5a)
    g.fillRect(  4,  6, 26, H -  6)  // skyscraper
    g.fillRect( 38, 22, 30, H - 22)  // office block
    g.fillRect( 80,  4, 14, H -  4)  // narrow tower
    g.fillRect(104, 34, 36, H - 34)  // wide flat
    g.fillRect(150, 12, 20, H - 12)  // tall slab
    g.fillRect(182, 26, 26, H - 26)  // medium
    g.fillRect(220, 17, 16, H - 17)  // left of pair
    g.fillRect(246, 30, 20, H - 30)  // right of pair
    g.fillRect(276,  9, 20, H -  9)  // far tower
    g.fillRect(302, 24, 18, H - 24)  // far block

    // Lit windows (yellow squares)
    g.fillStyle(0xffdd44)
    // Skyscraper
    g.fillRect( 8, 13, 4, 3)
    g.fillRect(15, 13, 4, 3)
    g.fillRect(22, 13, 4, 3)
    g.fillRect( 8, 22, 4, 3)
    g.fillRect(22, 22, 4, 3)
    g.fillRect( 8, 31, 4, 3)
    g.fillRect(15, 31, 4, 3)
    // Narrow tower
    g.fillRect(82, 11, 4, 3)
    g.fillRect(82, 22, 4, 3)
    // Far tower
    g.fillRect(279, 15, 4, 3)
    // Pair
    g.fillRect(223, 24, 4, 3)
    g.fillRect(249, 36, 4, 3)

    g.generateTexture(TEX.URBAN_BG, 320, H)
    g.destroy()
  }

  // ── Helicopter: 64×32 px — side view, rotor on top ─────────────────────
  private makeHelicopterTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false)

    // Body — military olive green
    g.fillStyle(0x556644)
    g.fillRoundedRect(4, 10, 48, 18, 5)

    // Cockpit bubble
    g.fillStyle(0x88ccff)
    g.fillEllipse(14, 16, 24, 16)
    g.fillStyle(0x556644)
    g.fillRect(0, 16, 4, 8)   // left cockpit edge

    // Tail boom
    g.fillStyle(0x445533)
    g.fillRect(52, 14, 12, 6)

    // Tail rotor
    g.fillStyle(0x223322)
    g.fillRect(62, 8, 2, 18)

    // Main rotor (horizontal bar across top)
    g.fillStyle(0x222222)
    g.fillRect(0, 6, 64, 3)

    // Landing skids
    g.fillStyle(0x334422)
    g.fillRect(10, 28, 20, 3)
    g.fillRect(34, 28, 20, 3)
    g.fillRect(16, 25, 4, 4)
    g.fillRect(44, 25, 4, 4)

    // Window tint
    g.fillStyle(0x2255aa, 0.4)
    g.fillEllipse(14, 16, 18, 12)

    g.generateTexture(TEX.HELICOPTER, 64, 32)
    g.destroy()
  }

  // ── Ninja: 20×32 px — dark bodysuit, headband ──────────────────────────
  private makeNinjaTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false)

    // Body (dark navy)
    g.fillStyle(0x111133)
    g.fillRoundedRect(4, 10, 12, 14, 3)

    // Legs
    g.fillRect(4, 22, 5, 10)
    g.fillRect(11, 22, 5, 10)

    // Head
    g.fillStyle(0x111133)
    g.fillCircle(10, 7, 6)

    // Red headband
    g.fillStyle(0xcc0000)
    g.fillRect(4, 5, 12, 3)

    // Eyes (white slit in mask)
    g.fillStyle(0xffffff)
    g.fillRect(6, 6, 8, 2)

    // Arms
    g.fillStyle(0x111133)
    g.fillRect(1, 12, 4, 8)
    g.fillRect(15, 12, 4, 8)

    // Weapon (kunai in right hand)
    g.fillStyle(0xaaaaaa)
    g.fillRect(17, 8, 2, 10)
    g.fillTriangle(17, 8, 19, 8, 18, 4)

    g.generateTexture(TEX.NINJA, 20, 32)
    g.destroy()
  }

  // ── Shuriken: 12×12 px ─────────────────────────────────────────────────
  private makeShurikenTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false)

    g.fillStyle(0x888888)
    // Four-pointed star by two overlapping rects rotated
    g.fillRect(4, 0, 4, 12)
    g.fillRect(0, 4, 12, 4)
    // Diagonal blades
    g.fillTriangle(0, 0, 4, 4, 6, 0)
    g.fillTriangle(12, 0, 8, 4, 6, 0)
    g.fillTriangle(0, 12, 4, 8, 6, 12)
    g.fillTriangle(12, 12, 8, 8, 6, 12)

    // Centre bolt
    g.fillStyle(0x333333)
    g.fillCircle(6, 6, 2)

    g.generateTexture(TEX.SHURIKEN, 12, 12)
    g.destroy()
  }

  // ── Airplane: 80×32 px — top-down-ish fighter silhouette ───────────────
  private makeAirplaneTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false)

    // Fuselage
    g.fillStyle(0x888888)
    g.fillRoundedRect(8, 10, 56, 12, 4)

    // Nose cone
    g.fillStyle(0xaaaaaa)
    g.fillTriangle(64, 10, 64, 22, 80, 16)

    // Wings
    g.fillStyle(0x777777)
    g.fillTriangle(28, 16, 44, 2, 52, 16)
    g.fillTriangle(28, 16, 44, 30, 52, 16)

    // Tail fins
    g.fillStyle(0x666666)
    g.fillTriangle(8, 16, 16, 6, 24, 16)
    g.fillTriangle(8, 16, 16, 26, 24, 16)

    // Engine pods under wings
    g.fillStyle(0x555555)
    g.fillRoundedRect(32, 4, 12, 6, 2)
    g.fillRoundedRect(32, 22, 12, 6, 2)

    // Cockpit
    g.fillStyle(0x88ccff)
    g.fillEllipse(58, 16, 16, 8)

    g.generateTexture(TEX.AIRPLANE, 80, 32)
    g.destroy()
  }

  // ── Bomb: 16×20 px ──────────────────────────────────────────────────────
  private makeBombTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false)

    // Body
    g.fillStyle(0x222222)
    g.fillEllipse(8, 12, 14, 16)

    // Nose cone
    g.fillStyle(0x333333)
    g.fillTriangle(3, 6, 13, 6, 8, 0)

    // Tail fins
    g.fillStyle(0x444444)
    g.fillTriangle(2, 16, 6, 12, 2, 20)
    g.fillTriangle(14, 16, 10, 12, 14, 20)

    // Warning stripe
    g.fillStyle(0xffaa00)
    g.fillRect(3, 9, 10, 3)

    g.generateTexture(TEX.BOMB, 16, 20)
    g.destroy()
  }

  // ── Limo: 96×36 px ──────────────────────────────────────────────────────
  private makeLimoTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false)

    // Chassis
    g.fillStyle(0x111111)
    g.fillRoundedRect(2, 18, 92, 16, 4)

    // Body (dark grey, stretched)
    g.fillStyle(0x333333)
    g.fillRoundedRect(6, 8, 84, 18, 6)

    // Window band
    g.fillStyle(0x88bbff)
    g.fillRect(16, 10, 52, 10)
    // Window dividers
    g.fillStyle(0x222222)
    g.fillRect(32, 10, 2, 10)
    g.fillRect(48, 10, 2, 10)
    g.fillRect(64, 10, 2, 10)

    // Wheels
    g.fillStyle(0x000000)
    g.fillCircle(20, 32, 7)
    g.fillCircle(76, 32, 7)
    // Hubcaps
    g.fillStyle(0x888888)
    g.fillCircle(20, 32, 3)
    g.fillCircle(76, 32, 3)

    // Headlight
    g.fillStyle(0xffffaa)
    g.fillRect(88, 14, 5, 6)

    // Taillight
    g.fillStyle(0xff2200)
    g.fillRect(3, 14, 5, 6)

    g.generateTexture(TEX.LIMO, 96, 36)
    g.destroy()
  }

  // ── Bus: 80×48 px ───────────────────────────────────────────────────────
  private makeBusTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false)

    // Body (yellow school bus)
    g.fillStyle(0xffcc00)
    g.fillRoundedRect(2, 4, 76, 36, 4)

    // Black bumper / grille
    g.fillStyle(0x222222)
    g.fillRect(72, 14, 6, 16)
    g.fillRect(2, 38, 76, 4)

    // Windows
    g.fillStyle(0x88bbff)
    g.fillRect(8,  8, 14, 12)
    g.fillRect(28, 8, 14, 12)
    g.fillRect(48, 8, 14, 12)
    // Window dividers
    g.fillStyle(0xffcc00)
    g.fillRect(23, 8, 4, 12)
    g.fillRect(43, 8, 4, 12)

    // Door
    g.fillStyle(0xffbb00)
    g.fillRect(8, 22, 10, 16)
    g.fillStyle(0x222222)
    g.fillRect(14, 26, 2, 8)

    // Wheels
    g.fillStyle(0x000000)
    g.fillCircle(18, 44, 8)
    g.fillCircle(62, 44, 8)
    g.fillStyle(0x888888)
    g.fillCircle(18, 44, 4)
    g.fillCircle(62, 44, 4)

    // Headlight
    g.fillStyle(0xffffaa)
    g.fillRect(72, 10, 5, 8)

    g.generateTexture(TEX.BUS, 80, 48)
    g.destroy()

    // ── Boss Wolf (80×64) ─────────────────────────────────────────────────
    {
      const bw = this.make.graphics({ x: 0, y: 0 }, false)
      bw.fillStyle(0x2a1a0a); bw.fillRect(8, 16, 64, 40)
      bw.fillStyle(0x3a2010); bw.fillRect(44, 4, 32, 28)
      bw.fillStyle(0x2a1a0a)
      bw.fillTriangle(44, 4, 52, 4, 48, -4)
      bw.fillTriangle(64, 4, 72, 4, 68, -4)
      bw.fillStyle(0xff2200); bw.fillRect(50, 10, 6, 6); bw.fillRect(64, 10, 6, 6)
      bw.fillStyle(0xffffff); bw.fillRect(52, 28, 4, 6); bw.fillRect(62, 28, 4, 6)
      bw.fillStyle(0x2a1a0a)
      bw.fillRect(12, 52, 10, 12); bw.fillRect(28, 52, 10, 12)
      bw.fillRect(44, 52, 10, 12); bw.fillRect(60, 52, 10, 12)
      bw.fillStyle(0xff4400); bw.fillRect(50, 14, 2, 8)
      bw.generateTexture(TEX.BOSS_WOLF, 80, 64)
      bw.destroy()
    }

    // ── Boss Cat (80×64) ──────────────────────────────────────────────────
    {
      const bc = this.make.graphics({ x: 0, y: 0 }, false)
      bc.fillStyle(0x1a1a2e); bc.fillRect(8, 20, 60, 36)
      bc.fillStyle(0xffffff)
      bc.fillTriangle(28, 20, 36, 20, 32, 36)
      bc.fillTriangle(44, 20, 52, 20, 48, 36)
      bc.fillStyle(0xf0c060); bc.fillRect(20, 0, 40, 28)
      bc.fillTriangle(20, 0, 28, 0, 24, -8)
      bc.fillTriangle(52, 0, 60, 0, 56, -8)
      bc.fillStyle(0x00ff44); bc.fillRect(26, 8, 8, 8); bc.fillRect(46, 8, 8, 8)
      bc.fillStyle(0x000000); bc.fillRect(28, 10, 4, 4); bc.fillRect(48, 10, 4, 4)
      bc.lineStyle(2, 0xffd700); bc.strokeCircle(30, 12, 7)
      bc.fillStyle(0x888888); bc.fillRect(64, 28, 16, 8)
      bc.fillStyle(0xff2200); bc.fillRect(76, 30, 8, 4)
      bc.fillStyle(0x1a1a2e); bc.fillRect(16, 52, 12, 12); bc.fillRect(52, 52, 12, 12)
      bc.generateTexture(TEX.BOSS_CAT, 80, 64)
      bc.destroy()
    }
  }
}
