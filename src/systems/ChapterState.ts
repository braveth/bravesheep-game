import { type IChapter, type ChapterConstructor, CHAPTER_ORDER } from '../chapters'

export const PHASE = { RUNNER: 'runner', BOSS: 'boss' } as const
export type Phase = typeof PHASE[keyof typeof PHASE]

export class ChapterState {
  private _index         = 0
  private _phase: Phase  = PHASE.RUNNER
  private _transitioning = false
  private _instance: IChapter = this.loadChapter(0)

  get index():   number   { return this._index }
  get phase():   Phase    { return this._phase }
  get chapter(): IChapter { return this._instance }

  startBoss(): void {
    if (this._phase !== PHASE.RUNNER) return
    this._phase = PHASE.BOSS
    this._transitioning = false
  }

  startRunner(): boolean {
    if (this._phase !== PHASE.BOSS || this._transitioning) return false
    this._transitioning = true
    this._index++
    this._phase    = PHASE.RUNNER
    this._instance = this.loadChapter(this._index)
    return true
  }

  reset(): void {
    this._index         = 0
    this._phase         = PHASE.RUNNER
    this._transitioning = false
    this._instance      = this.loadChapter(0)
  }

  private loadChapter(index: number): IChapter {
    const Ctor = CHAPTER_ORDER[index % CHAPTER_ORDER.length] as ChapterConstructor
    return new Ctor()
  }
}
