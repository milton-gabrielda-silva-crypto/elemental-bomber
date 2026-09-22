import { Electricity } from '../entities/Electricity'
import { Arena, CellType } from '../world/Arena'

interface ActiveElectricity {
  electricity: Electricity
  remainingLifetime: number
}

interface GridPosition {
  gridX: number
  gridY: number
}

export type ElectricityDamageHandler = () => void

export class ElectricitySystem {
  private readonly arena: Arena

  private readonly isWaterAt:
    (gridX: number, gridY: number) => boolean

  private readonly onPlayerDamage:
    ElectricityDamageHandler

  private readonly electrified =
    new Map<string, ActiveElectricity>()

  private readonly electricityLifetime = 2.5

  public constructor(
    arena: Arena,
    isWaterAt: (
      gridX: number,
      gridY: number,
    ) => boolean,
    onPlayerDamage: ElectricityDamageHandler,
  ) {
    this.arena = arena
    this.isWaterAt = isWaterAt
    this.onPlayerDamage = onPlayerDamage
  }

  public createElectricity(
    gridX: number,
    gridY: number,
  ): void {
    const cells: GridPosition[] = []

    /*
     * The bomb cell is always electrified.
     *
     * If the bomb is placed on water, the electricity
     * propagates through all connected water cells.
     *
     * If the bomb is next to water, the electricity
     * also enters the connected water area.
     */
    cells.push({
      gridX,
      gridY,
    })

    const connectedWater =
      this.collectConnectedWater(
        gridX,
        gridY,
      )

    for (const waterCell of connectedWater) {
      const alreadyIncluded =
        cells.some(
          (cell) =>
            cell.gridX === waterCell.gridX &&
            cell.gridY === waterCell.gridY,
        )

      if (!alreadyIncluded) {
        cells.push(waterCell)
      }
    }

    for (const cell of cells) {
      this.createElectricityAt(
        cell.gridX,
        cell.gridY,
      )
    }

    console.info(
      `[ElectricitySystem] Electrified ${cells.length} cell(s) starting at (${gridX}, ${gridY}).`,
    )
  }

  public isElectrifiedAt(
    gridX: number,
    gridY: number,
  ): boolean {
    return this.electrified.has(
      this.getCellKey(
        gridX,
        gridY,
      ),
    )
  }

  public update(
    deltaTime: number,
    playerGridX: number,
    playerGridY: number,
  ): void {
    for (
      const [
        cellKey,
        active,
      ] of this.electrified
    ) {
      active.remainingLifetime -=
        deltaTime

      const lifeProgress =
        1 -
        active.remainingLifetime /
          this.electricityLifetime

      active.electricity.update(
        deltaTime,
        Math.min(
          Math.max(
            lifeProgress,
            0,
          ),
          1,
        ),
      )

      if (
        active.electricity.object.parent ===
        null
      ) {
        continue
      }

      /*
       * Damage the player while standing
       * on an electrified cell.
       *
       * Player.takeDamage() already controls
       * the invulnerability period.
       */
      if (
        active.electricity.object.userData.gridX ===
          playerGridX &&
        active.electricity.object.userData.gridY ===
          playerGridY
      ) {
        this.onPlayerDamage()
      }

      if (
        active.remainingLifetime <=
        0
      ) {
        active.electricity.object.removeFromParent()

        this.electrified.delete(
          cellKey,
        )
      }
    }
  }

  private createElectricityAt(
    gridX: number,
    gridY: number,
  ): void {
    const cellKey =
      this.getCellKey(
        gridX,
        gridY,
      )

    if (
      this.electrified.has(
        cellKey,
      )
    ) {
      return
    }

    const cellType =
      this.arena.getCellType(
        gridX,
        gridY,
      )

    /*
     * Electricity can only visually exist
     * on normal floor cells.
     */
    if (
      cellType !== CellType.Floor
    ) {
      return
    }

    const electricity =
      new Electricity(
        gridX,
        gridY,
        this.arena.gridToWorld(
          gridX,
          gridY,
        ),
      )

    /*
     * Electricity is purely visual/electrical.
     * It does NOT occupy the Arena cell and
     * therefore does not block movement.
     */
    this.arena.object.add(
      electricity.object,
    )

    this.electrified.set(
      cellKey,
      {
        electricity,
        remainingLifetime:
          this.electricityLifetime,
      },
    )
  }

  private collectConnectedWater(
    startGridX: number,
    startGridY: number,
  ): GridPosition[] {
    const result: GridPosition[] = []

    const visited =
      new Set<string>()

    const queue: GridPosition[] = []

    /*
     * If the bomb itself is on water,
     * start the flood fill there.
     */
    if (
      this.isWaterAt(
        startGridX,
        startGridY,
      )
    ) {
      queue.push({
        gridX: startGridX,
        gridY: startGridY,
      })
    }

    /*
     * Otherwise search the four adjacent
     * cells for water.
     */
    if (
      !this.isWaterAt(
        startGridX,
        startGridY,
      )
    ) {
      const neighbors =
        this.getNeighbors(
          startGridX,
          startGridY,
        )

      for (const neighbor of neighbors) {
        if (
          this.isWaterAt(
            neighbor.gridX,
            neighbor.gridY,
          )
        ) {
          queue.push(neighbor)
        }
      }
    }

    while (
      queue.length > 0
    ) {
      const current =
        queue.shift()

      if (
        current === undefined
      ) {
        break
      }

      const currentKey =
        this.getCellKey(
          current.gridX,
          current.gridY,
        )

      if (
        visited.has(
          currentKey,
        )
      ) {
        continue
      }

      visited.add(
        currentKey,
      )

      if (
        !this.isWaterAt(
          current.gridX,
          current.gridY,
        )
      ) {
        continue
      }

      result.push(
        current,
      )

      const neighbors =
        this.getNeighbors(
          current.gridX,
          current.gridY,
        )

      for (const neighbor of neighbors) {
        const neighborKey =
          this.getCellKey(
            neighbor.gridX,
            neighbor.gridY,
          )

        if (
          visited.has(
            neighborKey,
          )
        ) {
          continue
        }

        if (
          this.isWaterAt(
            neighbor.gridX,
            neighbor.gridY,
          )
        ) {
          queue.push(
            neighbor,
          )
        }
      }
    }

    return result
  }

  private getNeighbors(
    gridX: number,
    gridY: number,
  ): GridPosition[] {
    return [
      {
        gridX,
        gridY: gridY - 1,
      },
      {
        gridX,
        gridY: gridY + 1,
      },
      {
        gridX: gridX - 1,
        gridY,
      },
      {
        gridX: gridX + 1,
        gridY,
      },
    ]
  }

  private getCellKey(
    gridX: number,
    gridY: number,
  ): string {
    return `${gridX},${gridY}`
  }
}
