import { URBAN } from '../config/chapters'
import { TEX } from '../config/textures'
import { BossCat }    from '../entities/enemies/BossCat'
import { Limo }       from '../entities/enemies/Limo'
import { Bus }        from '../entities/enemies/Bus'
import { Airplane }   from '../entities/enemies/Airplane'
import type { IChapter } from './IChapter'

export class UrbanChapter implements IChapter {
  readonly name    = URBAN.NAME
  readonly boss    = BossCat
  readonly enemies = [Limo, Bus, Airplane] as const
  readonly bg      = { scrollMult: URBAN.SCROLL_MULT, skyColor: URBAN.SKY_COLOR, texture: TEX.URBAN_BG }
}
