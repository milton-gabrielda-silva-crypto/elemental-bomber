import { Explosion, type ExplosionSegment } from '../entities/Explosion'
import { Arena, CellType } from '../world/Arena'

interface ActiveExplosion {
  explosion: Explosion
  remainingLifetime: number
}

interface ExplosionCell {
  gridX: number
  gridY: number
  segment: ExplosionSegment
}

export type ExplosionCellHandler = (gridX: number, gridY: number) => void

export interface DestroyedDestructibleCell {
  gridX: number
  gridY: number
}

export class ExplosionSystem {
  private readonly explosions: ActiveExplosion[] = []
  private readonly destroyedDestructibleCells: DestroyedDestructibleCell[] = []
  private readonly explosionDuration = 0.5
  private readonly arena: Arena
  private readonly onExplosionCell: ExplosionCellHandler

  public constructor(arena: Arena, onExplosionCell: ExplosionCellHandler = () => undefined) {
    this.arena = arena
    this.onExplosionCell = onExplosionCell
  }

  public createExplosion(gridX: number, gridY: number, blastRange = 2): void {
    this.getExplosionCells(gridX, gridY, blastRange).forEach((cell) => {
      const explosion = new Explosion(cell.gridX, cell.gridY, cell.segment)
      explosion.object.position.copy(this.arena.gridToWorld(cell.gridX, cell.gridY))
      this.arena.object.add(explosion.object)
      this.explosions.push({ explosion, remainingLifetime: this.explosionDuration })
      this.onExplosionCell(cell.gridX, cell.gridY)
    })
  }

  public update(deltaTime: number): void {
    for (let index = this.explosions.length - 1; index >= 0; index -= 1) {
      const activeExplosion = this.explosions[index]
      activeExplosion.remainingLifetime -= deltaTime
      const lifeProgress = 1 - Math.max(activeExplosion.remainingLifetime, 0) / this.explosionDuration
      activeExplosion.explosion.update(lifeProgress)

      if (activeExplosion.remainingLifetime <= 0) {
        activeExplosion.explosion.object.removeFromParent()
        this.explosions.splice(index, 1)
      }
    }
  }

  public consumeDestroyedDestructibleCells(): DestroyedDestructibleCell[] {
    return this.destroyedDestructibleCells.splice(0)
  }

  private getExplosionCells(gridX: number, gridY: number, blastRange: number): ExplosionCell[] {
    const cells: ExplosionCell[] = [{ gridX, gridY, segment: 'center' }]
    const directions = [
      { deltaX: 0, deltaY: -1, segment: 'vertical' },
      { deltaX: 0, deltaY: 1, segment: 'vertical' },
      { deltaX: -1, deltaY: 0, segment: 'horizontal' },
      { deltaX: 1, deltaY: 0, segment: 'horizontal' },
    ] as const

    directions.forEach(({ deltaX, deltaY, segment }) => {
      for (let distance = 1; distance <= blastRange; distance += 1) {
        const targetGridX = gridX + deltaX * distance
        const targetGridY = gridY + deltaY * distance

        const cellType = this.arena.getCellType(targetGridX, targetGridY)

        if (cellType === CellType.Wall || cellType === null) {
          break
        }

        cells.push({ gridX: targetGridX, gridY: targetGridY, segment })

        if (cellType === CellType.Destructible) {
          if (this.arena.destroyDestructibleBlock(targetGridX, targetGridY)) {
            this.destroyedDestructibleCells.push({ gridX: targetGridX, gridY: targetGridY })
          }
          break
        }
      }
    })

    return cells
  }
}
