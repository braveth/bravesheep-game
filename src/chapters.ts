import { RuralChapter } from './chapters/RuralChapter'
import { UrbanChapter } from './chapters/UrbanChapter'

export type { IChapter, IRunnerConfig, IBossConfig, IBg, BossConstructor, EnemyClass } from './chapters/IChapter'
import type { IChapter } from './chapters/IChapter'

export type ChapterConstructor = new () => IChapter

export const CHAPTER_ORDER: readonly ChapterConstructor[] = [RuralChapter, UrbanChapter]
