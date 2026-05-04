/**
 * ProgressionManager — owns the full game loop.
 *
 * Sequence (repeats indefinitely):
 *   Chapter 0: rural  runner → rural  boss
 *   Chapter 1: urban  runner → urban  boss
 *   Chapter 2: rural  runner → rural  boss
 *   ...
 *
 * Game.ts reads `phase` and `chapter` each frame and reacts to state
 * transitions via `startBoss()` / `bossDefeated()`.
 */

import { type BaseChapter, CHAPTERS } from '../config/chapters'

export type Phase = 'runner' | 'boss'

export class ProgressionManager {
  private _chapter     = 0
  private _phase: Phase = 'runner'
  private _transitioning = false   // one-shot guard between phase changes

  get chapterIndex(): number      { return this._chapter }
  get phase():        Phase       { return this._phase }
  get chapter():      BaseChapter    { return CHAPTERS[this._chapter % CHAPTERS.length] }

  /** Call once when difficulty reaches max — enters boss phase. */
  startBoss(): void {
    if (this._phase !== 'runner') return
    this._phase = 'boss'
    this._transitioning = false
  }

  /**
   * Call once when the boss is defeated.
   * Advances chapter, switches biome, resets to runner phase.
   * Returns true the first call; subsequent calls before the next
   * `startBoss()` are no-ops.
   */
  bossDefeated(): boolean {
    if (this._phase !== 'boss' || this._transitioning) return false
    this._transitioning = true
    this._chapter++
    this._phase = 'runner'
    return true
  }

  /** Dev / restart — full reset. */
  reset(): void {
    this._chapter     = 0
    this._phase       = 'runner'
    this._transitioning = false
  }
}
