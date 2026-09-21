import { Arena } from '../world/Arena'
import { Exit } from '../entities/Exit'

export interface ExitPosition {
  gridX: number
  gridY: number
}

export class ExitSystem {
  private readonly arena: Arena
  private readonly exit: Exit
  private readonly exitPosition: ExitPosition

  private revealed = false
  private completed = false

  public constructor(
    arena: Arena,
    exitPosition: ExitPosition,
  ) {
    this.arena = arena
    this.exitPosition = exitPosition

    this.exit = new Exit(
      arena.cellSize,
    )

    this.exit.object.position.copy(
      this.arena.gridToWorld(
        this.exitPosition.gridX,
        this.exitPosition.gridY,
      ),
    )

    this.arena.object.add(
      this.exit.object,
    )
  }

  public update(
    deltaTime: number,
    playerGridX: number,
    playerGridY: number,
  ): void {
    this.exit.update(
      deltaTime,
    )

    if (
      !this.revealed ||
      this.completed
    ) {
      return
    }

    if (
      playerGridX ===
        this.exitPosition.gridX &&
      playerGridY ===
        this.exitPosition.gridY
    ) {
      this.completed = true
    }
  }

  public reveal(): void {
    if (this.revealed) {
      return
    }

    this.revealed = true

    this.exit.show()

    console.info(
      `[ExitSystem] Exit revealed at (${this.exitPosition.gridX}, ${this.exitPosition.gridY}).`,
    )
  }

  public isRevealed(): boolean {
    return this.revealed
  }

  public isCompleted(): boolean {
    return this.completed
  }

  public getGridPosition(): ExitPosition {
    return {
      gridX: this.exitPosition.gridX,
      gridY: this.exitPosition.gridY,
    }
  }
}