import {
  Explosion,
  type ExplosionSegment,
} from '../entities/Explosion'
import {
  Arena,
  CellType,
} from '../world/Arena'

interface ActiveExplosion {
  explosion: Explosion
  remainingLifetime: number
}

interface ExplosionCell {
  gridX: number
  gridY: number
  segment: ExplosionSegment
}

export type ExplosionCellHandler = (
  gridX: number,
  gridY: number,
) => void

export type WaterCellChecker = (
  gridX: number,
  gridY: number,
) => boolean

export type WaterImpactHandler = (
  gridX: number,
  gridY: number,
  segment: ExplosionSegment,
) => void

export type IceCellChecker = (
  gridX: number,
  gridY: number,
) => boolean

export type IceImpactHandler = (
  gridX: number,
  gridY: number,
  segment: ExplosionSegment,
) => void

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

  private readonly isWaterAt: WaterCellChecker

  private readonly onWaterImpact: WaterImpactHandler

  private readonly isIceAt: IceCellChecker

  private readonly onIceImpact: IceImpactHandler

  public constructor(
    arena: Arena,
    onExplosionCell: ExplosionCellHandler = () => undefined,
    isWaterAt: WaterCellChecker = () => false,
    onWaterImpact: WaterImpactHandler = () => undefined,
    isIceAt: IceCellChecker = () => false,
    onIceImpact: IceImpactHandler = () => undefined,
  ) {
    this.arena = arena
    this.onExplosionCell = onExplosionCell
    this.isWaterAt = isWaterAt
    this.onWaterImpact = onWaterImpact
    this.isIceAt = isIceAt
    this.onIceImpact = onIceImpact
  }

  public createExplosion(
    gridX: number,
    gridY: number,
    blastRange = 2,
  ): void {
    /*
     * FIRE + ICE
     *
     * If the explosion starts directly on water,
     * keep the existing Fire + Water -> Steam behavior.
     */
    if (
      this.isWaterAt(
        gridX,
        gridY,
      )
    ) {
      this.onWaterImpact(
        gridX,
        gridY,
        'center',
      )

      return
    }

    /*
     * Build the normal fire explosion.
     *
     * Ice is handled during propagation.
     */
    this.getExplosionCells(
      gridX,
      gridY,
      blastRange,
    ).forEach((cell) => {
      const explosion =
        new Explosion(
          cell.gridX,
          cell.gridY,
          cell.segment,
        )

      explosion.object.position.copy(
        this.arena.gridToWorld(
          cell.gridX,
          cell.gridY,
        ),
      )

      this.arena.object.add(
        explosion.object,
      )

      this.explosions.push({
        explosion,
        remainingLifetime:
          this.explosionDuration,
      })

      this.onExplosionCell(
        cell.gridX,
        cell.gridY,
      )
    })
  }

  public update(
    deltaTime: number,
  ): void {
    for (
      let index =
        this.explosions.length - 1;
      index >= 0;
      index -= 1
    ) {
      const activeExplosion =
        this.explosions[index]

      activeExplosion.remainingLifetime -=
        deltaTime

      const lifeProgress =
        1 -
        Math.max(
          activeExplosion.remainingLifetime,
          0,
        ) /
          this.explosionDuration

      activeExplosion.explosion.update(
        lifeProgress,
      )

      if (
        activeExplosion.remainingLifetime <=
        0
      ) {
        activeExplosion.explosion.object.removeFromParent()

        this.explosions.splice(
          index,
          1,
        )
      }
    }
  }

  public consumeDestroyedDestructibleCells(): DestroyedDestructibleCell[] {
    return this.destroyedDestructibleCells.splice(
      0,
    )
  }

  private getExplosionCells(
    gridX: number,
    gridY: number,
    blastRange: number,
  ): ExplosionCell[] {
    const cells: ExplosionCell[] = [
      {
        gridX,
        gridY,
        segment: 'center',
      },
    ]

    const directions = [
      {
        deltaX: 0,
        deltaY: -1,
        segment: 'vertical',
      },
      {
        deltaX: 0,
        deltaY: 1,
        segment: 'vertical',
      },
      {
        deltaX: -1,
        deltaY: 0,
        segment: 'horizontal',
      },
      {
        deltaX: 1,
        deltaY: 0,
        segment: 'horizontal',
      },
    ] as const

    directions.forEach(
      ({
        deltaX,
        deltaY,
        segment,
      }) => {
        for (
          let distance = 1;
          distance <= blastRange;
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

          /*
           * FIRE + ICE -> WATER
           *
           * Ice has priority over water here.
           *
           * The fire reaches the ice,
           * the ice reaction is triggered,
           * and propagation stops at that cell.
           *
           * The water created by the reaction
           * will NOT be processed by this same
           * explosion.
           */
          if (
            this.isIceAt(
              targetGridX,
              targetGridY,
            )
          ) {
            this.onIceImpact(
              targetGridX,
              targetGridY,
              segment,
            )

            cells.push({
              gridX: targetGridX,
              gridY: targetGridY,
              segment,
            })

            break
          }

          /*
           * FIRE + WATER -> STEAM
           *
           * This is the existing reaction.
           */
          if (
            this.isWaterAt(
              targetGridX,
              targetGridY,
            )
          ) {
            this.onWaterImpact(
              targetGridX,
              targetGridY,
              segment,
            )

            break
          }

          cells.push({
            gridX: targetGridX,
            gridY: targetGridY,
            segment,
          })

          if (
            cellType ===
            CellType.Destructible
          ) {
            if (
              this.arena.destroyDestructibleBlock(
                targetGridX,
                targetGridY,
              )
            ) {
              this.destroyedDestructibleCells.push(
                {
                  gridX: targetGridX,
                  gridY: targetGridY,
                },
              )
            }

            break
          }
        }
      },
    )

    return cells
  }
}
