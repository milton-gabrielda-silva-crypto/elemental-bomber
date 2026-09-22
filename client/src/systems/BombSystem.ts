import {
  Bomb,
  BombType,
} from '../entities/Bomb'
import type { MovementDirection } from './InputManager'
import {
  Arena,
  CellType,
} from '../world/Arena'

export type BombDetonationHandler = (
  gridX: number,
  gridY: number,
) => void

interface ActiveBomb {
  bomb: Bomb
  remainingLifetime: number
}

export class BombSystem {
  private readonly bombs =
    new Map<string, ActiveBomb>()

  private readonly bombLifetime = 3
  private readonly arena: Arena

  private readonly onFireBombDetonate:
    BombDetonationHandler

  private readonly onWaterBombDetonate:
    BombDetonationHandler

  private readonly onIceBombDetonate:
    BombDetonationHandler

  public constructor(
    arena: Arena,
    onFireBombDetonate:
      BombDetonationHandler,
    onWaterBombDetonate:
      BombDetonationHandler = () =>
        undefined,
    onIceBombDetonate:
      BombDetonationHandler = () =>
        undefined,
  ) {
    this.arena = arena
    this.onFireBombDetonate =
      onFireBombDetonate
    this.onWaterBombDetonate =
      onWaterBombDetonate
    this.onIceBombDetonate =
      onIceBombDetonate
  }

  public get activeBombCount(): number {
    return this.bombs.size
  }

  public placeBomb(
    gridX: number,
    gridY: number,
    maxBombCount: number,
    type: BombType =
      BombType.Fire,
  ): boolean {
    const cellKey =
      this.getCellKey(
        gridX,
        gridY,
      )

    if (
      this.bombs.has(cellKey) ||
      this.activeBombCount >=
        maxBombCount
    ) {
      return false
    }

    const bomb =
      new Bomb(
        gridX,
        gridY,
        type,
      )

    bomb.object.position.copy(
      this.arena.gridToWorld(
        gridX,
        gridY,
      ),
    )

    this.arena.object.add(
      bomb.object,
    )

    this.bombs.set(
      cellKey,
      {
        bomb,
        remainingLifetime:
          this.bombLifetime,
      },
    )

    console.info(
      `[BombSystem] ${type} bomb placed at (${gridX}, ${gridY}).`,
    )

    return true
  }

  public pushBomb(
    playerGridX: number,
    playerGridY: number,
    direction: MovementDirection,
    maxDistance = 3,
  ): boolean {
    const {
      deltaX,
      deltaY,
    } =
      this.getDirectionData(
        direction,
      )

    const targetGridX =
      playerGridX + deltaX

    const targetGridY =
      playerGridY + deltaY

    const activeBomb =
      this.bombs.get(
        this.getCellKey(
          targetGridX,
          targetGridY,
        ),
      )

    if (
      activeBomb === undefined
    ) {
      console.info(
        `[BombSystem] Wind found no bomb at (${targetGridX}, ${targetGridY}).`,
      )
      return false
    }

    let currentGridX =
      targetGridX
    let currentGridY =
      targetGridY
    let movedDistance = 0

    for (
      let distance = 1;
      distance <= maxDistance;
      distance += 1
    ) {
      const nextGridX =
        currentGridX + deltaX
      const nextGridY =
        currentGridY + deltaY

      const cellType =
        this.arena.getCellType(
          nextGridX,
          nextGridY,
        )

      if (
        cellType === null ||
        cellType === CellType.Wall ||
        cellType === CellType.Destructible
      ) {
        break
      }

      if (
        this.bombs.has(
          this.getCellKey(
            nextGridX,
            nextGridY,
          ),
        )
      ) {
        break
      }

      currentGridX = nextGridX
      currentGridY = nextGridY
      movedDistance = distance
    }

    if (movedDistance === 0) {
      console.info(
        `[BombSystem] Wind could not move bomb at (${targetGridX}, ${targetGridY}).`,
      )
      return false
    }

    this.bombs.delete(
      this.getCellKey(
        targetGridX,
        targetGridY,
      ),
    )

    activeBomb.bomb.moveTo(
      currentGridX,
      currentGridY,
      this.arena.gridToWorld(
        currentGridX,
        currentGridY,
      ),
    )

    this.bombs.set(
      this.getCellKey(
        currentGridX,
        currentGridY,
      ),
      activeBomb,
    )

    console.info(
      `[BombSystem] Wind pushed ${activeBomb.bomb.type} bomb from (${targetGridX}, ${targetGridY}) to (${currentGridX}, ${currentGridY}).`,
    )

    return true
  }

  public update(
    deltaTime: number,
  ): void {
    for (
      const [
        cellKey,
        activeBomb,
      ] of this.bombs
    ) {
      activeBomb.bomb.update(
        deltaTime,
      )

      activeBomb.remainingLifetime -=
        deltaTime

      if (
        activeBomb.remainingLifetime <=
        0
      ) {
        const {
          gridX,
          gridY,
        } = activeBomb.bomb

        const bombType =
          activeBomb.bomb.type

        activeBomb.bomb.object.removeFromParent()
        this.bombs.delete(cellKey)

        if (
          bombType === BombType.Water
        ) {
          this.onWaterBombDetonate(
            gridX,
            gridY,
          )
        } else if (
          bombType === BombType.Ice
        ) {
          this.onIceBombDetonate(
            gridX,
            gridY,
          )
        } else {
          this.onFireBombDetonate(
            gridX,
            gridY,
          )
        }

        console.info(
          `[BombSystem] ${bombType} bomb detonated at (${gridX}, ${gridY}).`,
        )
      }
    }
  }

  private getDirectionData(
    direction: MovementDirection,
  ): {
    deltaX: number
    deltaY: number
  } {
    switch (direction) {
      case 'up':
        return { deltaX: 0, deltaY: -1 }
      case 'down':
        return { deltaX: 0, deltaY: 1 }
      case 'left':
        return { deltaX: -1, deltaY: 0 }
      case 'right':
        return { deltaX: 1, deltaY: 0 }
    }
  }

  private getCellKey(
    gridX: number,
    gridY: number,
  ): string {
    return `${gridX},${gridY}`
  }
}
