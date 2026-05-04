import { RURAL } from '../config/chapters'
import { TEX } from '../config/textures'
import { BossWolf }   from '../entities/enemies/BossWolf'
import { Wolf }       from '../entities/enemies/Wolf'
import { FatCat }     from '../entities/enemies/FatCat'
import { Helicopter } from '../entities/enemies/Helicopter'
import type { IChapter } from './IChapter'

export class RuralChapter implements IChapter {
  readonly name    = RURAL.NAME
  readonly boss    = BossWolf
  readonly enemies = [Wolf, FatCat, Helicopter] as const
  readonly bg      = { scrollMult: RURAL.SCROLL_MULT, skyColor: RURAL.SKY_COLOR, texture: TEX.RURAL_BG }
}
