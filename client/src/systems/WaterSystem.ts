import { Water } from '../entities/Water'
import { Arena, CellType } from '../world/Arena'

interface ActiveWater {
  water: Water
  remainingLifetime: number
}

export type WaterCellHandler = (
  gridX: number,
  gridY: number,
) => void

export class WaterSystem {
  private readonly waters =
    new Map<string, ActiveWater>()

  private readonly waterLifetime = 8

  private readonly arena: Arena

  private readonly onWaterCell: WaterCellHandler

  public constructor(
    arena: Arena,
    onWaterCell: WaterCellHandler = () => undefined,
  ) {
    this.arena = arena
    this.onWaterCell = onWaterCell
  }

  public createWater(
    gridX: number,
    gridY: number,
    spreadRange = 2,
  ): void {
    this.getWaterCells(
      gridX,
      gridY,
      spreadRange,
    ).forEach((cell) => {
      this.addWaterCell(
        cell.gridX,
        cell.gridY,
      )
    })
  }

  public isWaterAt(
    gridX: number,
    gridY: number,
  ): boolean {
    return this.waters.has(
      this.getCellKey(
        gridX,
        gridY,
      ),
    )
  }

  public removeWaterAt(
    gridX: number,
    gridY: number,
  ): boolean {
    const key =
      this.getCellKey(
        gridX,
        gridY,
      )

    const activeWater =
      this.waters.get(key)

    if (activeWater === undefined) {
      return false
    }

    activeWater.water.object.removeFromParent()

    this.waters.delete(key)

    console.info(
      `[WaterSystem] Water removed at (${gridX}, ${gridY}).`,
    )

    return true
  }

  public update(
    deltaTime: number,
  ): void {
    for (
      const [
        key,
        activeWater,
      ] of this.waters
    ) {
      activeWater.remainingLifetime -=
        deltaTime

      const lifeProgress =
        1 -
        Math.max(
          activeWater.remainingLifetime,
          0,
        ) /
          this.waterLifetime

      activeWater.water.update(
        lifeProgress,
      )

      if (
        activeWater.remainingLifetime <= 0
      ) {
        activeWater.water.object.removeFromParent()

        this.waters.delete(key)
      }
    }
  }

  private addWaterCell(
    gridX: number,
    gridY: number,
  ): void {
    const key =
      this.getCellKey(
        gridX,
        gridY,
      )

    const existingWater =
      this.waters.get(key)

    if (
      existingWater !== undefined
    ) {
      existingWater.remainingLifetime =
        this.waterLifetime

      return
    }

    const water =
      new Water(
        gridX,
        gridY,
        this.arena.cellSize,
      )

    water.object.position.copy(
      this.arena.gridToWorld(
        gridX,
        gridY,
      ),
    )

    this.arena.object.add(
      water.object,
    )

    this.waters.set(
      key,
      {
        water,
        remainingLifetime:
          this.waterLifetime,
      },
    )

    this.onWaterCell(
      gridX,
      gridY,
    )
  }

  private getWaterCells(
    gridX: number,
    gridY: number,
    spreadRange: number,
  ): Array<{
    gridX: number
    gridY: number
  }> {
    const cells: Array<{
      gridX: number
      gridY: number
    }> = [
      {
        gridX,
        gridY,
      },
    ]

    const directions = [
      {
        deltaX: 0,
        deltaY: -1,
      },
      {
        deltaX: 0,
        deltaY: 1,
      },
      {
        deltaX: -1,
        deltaY: 0,
      },
      {
        deltaX: 1,
        deltaY: 0,
      },
    ]

    directions.forEach(
      ({
        deltaX,
        deltaY,
      }) => {
        for (
          let distance = 1;
          distance <= spreadRange;
          distance += 1
        ) {
          const targetGridX =
            gridX +
            deltaX * distance

          const targetGridY =
            gridY +
            deltaY * distance

          const cellType =
            this.arena.getCellType(
              targetGridX,
              targetGridY,
            )

          if (
            cellType === CellType.Wall ||
            cellType === null
          ) {
            break
          }

          if (
            cellType ===
            CellType.Destructible
          ) {
            break
          }

          if (
            cellType === CellType.Floor
          ) {
            cells.push({
              gridX: targetGridX,
              gridY: targetGridY,
            })
          }
        }
      },
    )

    return cells
  }

  private getCellKey(
    gridX: number,
    gridY: number,
  ): string {
    return `${gridX}:${gridY}`
  }
}