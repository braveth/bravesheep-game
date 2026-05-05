import { type IChapter, type IRunnerConfig, type IBossConfig, type ChapterConstructor, CHAPTER_ORDER } from '../chapters'

export const PHASE = { RUNNER: 'runner', BOSS: 'boss' } as const
export type Phase = typeof PHASE[keyof typeof PHASE]

export class ChapterState {
  private _index         = 0
  private _phase: Phase  = PHASE.RUNNER
  private _instance!:    IChapter

  constructor(startIndex = 0) {
    this._index    = startIndex
    this._instance = this.loadChapter(startIndex)
  }

  get index():        number        { return this._index }
  get phase():        Phase         { return this._phase }
  get runnerConfig(): IRunnerConfig { return this._instance }
  get bossConfig():   IBossConfig   { return this._instance }

  startBoss(): void {
    if (this._phase !== PHASE.RUNNER) return
    this._phase = PHASE.BOSS
  }

  /** Dev-only: exit boss phase without advancing the chapter. */
  cancelBoss(): void {
    this._phase = PHASE.RUNNER
  }

  reset(): void {
    this._index    = 0
    this._phase    = PHASE.RUNNER
    this._instance = this.loadChapter(0)
  }

  private loadChapter(index: number): IChapter {
    const Ctor = CHAPTER_ORDER[index % CHAPTER_ORDER.length] as ChapterConstructor
    return new Ctor()
  }
}
