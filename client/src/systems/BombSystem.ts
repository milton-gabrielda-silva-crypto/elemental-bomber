import { Bomb } from '../entities/Bomb'
import { Arena } from '../world/Arena'

export type BombDetonationHandler = (gridX: number, gridY: number) => void

interface ActiveBomb {
  bomb: Bomb
  remainingLifetime: number
}

export class BombSystem {
  private readonly bombs = new Map<string, ActiveBomb>()
  private readonly bombLifetime = 3
  private readonly arena: Arena
  private readonly onBombDetonate: BombDetonationHandler

  public constructor(arena: Arena, onBombDetonate: BombDetonationHandler) {
    this.arena = arena
    this.onBombDetonate = onBombDetonate
  }

  public get activeBombCount(): number {
    return this.bombs.size
  }

  public placeBomb(gridX: number, gridY: number, maxBombCount: number): boolean {
    const cellKey = this.getCellKey(gridX, gridY)

    if (this.bombs.has(cellKey) || this.activeBombCount >= maxBombCount) {
      return false
    }

    const bomb = new Bomb(gridX, gridY)
    bomb.object.position.copy(this.arena.gridToWorld(gridX, gridY))
    this.arena.object.add(bomb.object)
    this.bombs.set(cellKey, { bomb, remainingLifetime: this.bombLifetime })
    return true
  }

  public update(deltaTime: number): void {
    for (const [cellKey, activeBomb] of this.bombs) {
      activeBomb.bomb.update(deltaTime)
      activeBomb.remainingLifetime -= deltaTime

      if (activeBomb.remainingLifetime <= 0) {
        activeBomb.bomb.object.removeFromParent()
        this.bombs.delete(cellKey)
        this.onBombDetonate(activeBomb.bomb.gridX, activeBomb.bomb.gridY)
      }
    }
  }

  private getCellKey(gridX: number, gridY: number): string {
    return `${gridX},${gridY}`
  }
}
