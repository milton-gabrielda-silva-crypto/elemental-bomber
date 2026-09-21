import type { LevelConfig } from './LevelConfig'
import {
  STAGE_1_1,
  STAGE_1_2,
} from './LevelConfig'

export class LevelManager {
  private readonly levels: LevelConfig[]
  private currentLevelIndex = 0

  public constructor() {
    this.levels = [
      STAGE_1_1,
      STAGE_1_2,
    ]
  }

  public getCurrentLevel(): LevelConfig {
    return this.levels[
      this.currentLevelIndex
    ]
  }

  public getCurrentLevelIndex(): number {
    return this.currentLevelIndex
  }

  public getCurrentLevelNumber(): string {
    return this.getCurrentLevel().id
  }

  public getLevelCount(): number {
    return this.levels.length
  }

  public hasNextLevel(): boolean {
    return (
      this.currentLevelIndex <
      this.levels.length - 1
    )
  }

  public advanceToNextLevel(): boolean {
    if (!this.hasNextLevel()) {
      console.info(
        '[LevelManager] No more levels available.',
      )

      return false
    }

    this.currentLevelIndex += 1

    console.info(
      `[LevelManager] Advanced to ${this.getCurrentLevel().name}.`,
    )

    return true
  }

  public reset(): void {
    this.currentLevelIndex = 0

    console.info(
      '[LevelManager] Level progression reset.',
    )
  }
}