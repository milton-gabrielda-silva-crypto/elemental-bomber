import { Arena } from '../world/Arena'
import { Exit } from '../entities/Exit'

export class ExitSystem {
  private readonly arena: Arena
  private readonly exit: Exit

  private readonly exitGridX = 9
  private readonly exitGridY = 11

  private revealed = false
  private completed = false

  public constructor(arena: Arena) {
    this.arena = arena
    this.exit = new Exit(arena.cellSize)

    this.exit.object.position.copy(
      this.arena.gridToWorld(
        this.exitGridX,
        this.exitGridY,
      ),
    )

    this.arena.object.add(this.exit.object)
  }

  public update(
    deltaTime: number,
    playerGridX: number,
    playerGridY: number,
  ): void {
    this.exit.update(deltaTime)

    if (!this.revealed || this.completed) {
      return
    }

    if (
      playerGridX === this.exitGridX &&
      playerGridY === this.exitGridY
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
      `[ExitSystem] Exit revealed at (${this.exitGridX}, ${this.exitGridY}).`,
    )
  }

  public isRevealed(): boolean {
    return this.revealed
  }

  public isCompleted(): boolean {
    return this.completed
  }

  public getGridPosition(): {
    gridX: number
    gridY: number
  } {
    return {
      gridX: this.exitGridX,
      gridY: this.exitGridY,
    }
  }
}