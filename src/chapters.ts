import { RuralChapter } from './chapters/RuralChapter'
import { UrbanChapter } from './chapters/UrbanChapter'

export type { IChapter, IBg, BossConstructor, EnemyClass } from './chapters/IChapter'

export type ChapterConstructor = new () => import('./chapters/IChapter').IChapter

export const CHAPTER_ORDER: readonly ChapterConstructor[] = [RuralChapter, UrbanChapter]
