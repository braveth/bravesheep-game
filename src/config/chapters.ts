/**
 * Chapter definitions — one entry per biome cycle.
 * The game loops through these indefinitely.
 *
 * Adding a new chapter is as simple as pushing a new entry here.
 * Everything else (difficulty ramp, boss fight, scrolling) is identical
 * for every chapter.
 */

import { RuralChapter } from '../chapters/RuralChapter'
import { UrbanChapter } from '../chapters/UrbanChapter'
import { BossWolf }     from '../entities/enemies/BossWolf'
import { BossCat }      from '../entities/enemies/BossCat'
import { Wolf }         from '../entities/enemies/Wolf'
import { FatCat }       from '../entities/enemies/FatCat'
import { Helicopter }   from '../entities/enemies/Helicopter'
import { Limo }         from '../entities/enemies/Limo'
import { Bus }          from '../entities/enemies/Bus'
import { Airplane }     from '../entities/enemies/Airplane'
import type { BaseChapter } from '../chapters/BaseChapter'

export type { BaseChapter }

export const CHAPTERS: readonly BaseChapter[] = [
  new RuralChapter({ name: 'Rural', boss: BossWolf, enemies: [Wolf, FatCat, Helicopter] }),
  new UrbanChapter({ name: 'Urban', boss: BossCat,  enemies: [Limo, Bus, Airplane] }),
]
