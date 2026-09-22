import { Ice } from '../entities/Ice'
import { Arena, CellType } from '../world/Arena'

interface ActiveIce {
  ice: Ice
  gridX: number
  gridY: number
  remainingLifetime: number
}

export class IceSystem {
  private readonly iceBlocks =
    new Map<string, ActiveIce>()

  private readonly arena: Arena
  private readonly iceLifetime = 7

  public constructor(arena: Arena) {
    this.arena = arena
  }

  public createIce(
    gridX: number,
    gridY: number,
    range = 2,
  ): void {
    this.createIceBlock(gridX, gridY)

    const directions = [
      { deltaX: 0, deltaY: -1 },
      { deltaX: 0, deltaY: 1 },
      { deltaX: -1, deltaY: 0 },
      { deltaX: 1, deltaY: 0 },
    ]

    for (const direction of directions) {
      for (let distance = 1; distance <= range; distance += 1) {
        const targetX =
          gridX + direction.deltaX * distance
        const targetY =
          gridY + direction.deltaY * distance

        const cellType =
          this.arena.getCellType(targetX, targetY)

        if (
          cellType === null ||
          cellType === CellType.Wall ||
          cellType === CellType.Destructible
        ) {
          break
        }

        this.createIceBlock(targetX, targetY)
      }
    }

    console.info(
      `[IceSystem] Ice field created at (${gridX}, ${gridY}) with range ${range}.`,
    )
  }

  public isIceAt(gridX: number, gridY: number): boolean {
    return this.iceBlocks.has(this.getCellKey(gridX, gridY))
  }

  public removeIceAt(gridX: number, gridY: number): boolean {
    const cellKey = this.getCellKey(gridX, gridY)
    const activeIce = this.iceBlocks.get(cellKey)

    if (activeIce === undefined) {
      return false
    }

    this.arena.removeObjectFromCell(
      gridX,
      gridY,
      activeIce.ice.object,
    )
    this.iceBlocks.delete(cellKey)

    console.info(
      `[IceSystem] Ice melted at (${gridX}, ${gridY}).`,
    )

    return true
  }

  public update(deltaTime: number): void {
    for (const [cellKey, activeIce] of this.iceBlocks) {
      activeIce.remainingLifetime -= deltaTime

      const lifeProgress =
        1 -
        Math.max(activeIce.remainingLifetime, 0) /
          this.iceLifetime

      activeIce.ice.update(lifeProgress)

      if (activeIce.remainingLifetime <= 0) {
        this.arena.removeObjectFromCell(
          activeIce.gridX,
          activeIce.gridY,
          activeIce.ice.object,
        )
        this.iceBlocks.delete(cellKey)

        console.info(
          `[IceSystem] Ice expired at (${activeIce.gridX}, ${activeIce.gridY}).`,
        )
      }
    }
  }

  private createIceBlock(
    gridX: number,
    gridY: number,
  ): boolean {
    const cellKey = this.getCellKey(gridX, gridY)

    if (this.iceBlocks.has(cellKey)) {
      return false
    }

    if (
      this.arena.getCellType(gridX, gridY) !==
      CellType.Floor
    ) {
      return false
    }

    const ice = new Ice()
    const added = this.arena.addObjectToCell(
      gridX,
      gridY,
      ice.object,
    )

    if (!added) {
      return false
    }

    this.iceBlocks.set(cellKey, {
      ice,
      gridX,
      gridY,
      remainingLifetime: this.iceLifetime,
    })

    return true
  }

  private getCellKey(
    gridX: number,
    gridY: number,
  ): string {
    return `${gridX},${gridY}`
  }
}
