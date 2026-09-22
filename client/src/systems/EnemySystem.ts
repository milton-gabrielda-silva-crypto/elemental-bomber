import { Enemy } from '../entities/Enemy'
import { Arena } from '../world/Arena'

export type EnemyPlayerCollisionHandler = (
  enemy: Enemy,
) => void

export class EnemySystem {
  private readonly arena: Arena

  private readonly onPlayerCollision:
    EnemyPlayerCollisionHandler

  private enemies: Enemy[] = []

  private readonly playerContactEnemies =
    new Set<Enemy>()

  public constructor(
    arena: Arena,
    onPlayerCollision:
      EnemyPlayerCollisionHandler,
  ) {
    this.arena = arena
    this.onPlayerCollision =
      onPlayerCollision
  }

  public spawnInitialEnemy(
    playerGridX: number,
    playerGridY: number,
  ): Enemy | null {
    const spawnCell =
      this.findFarthestWalkableCell(
        playerGridX,
        playerGridY,
      )

    if (
      spawnCell === null
    ) {
      return null
    }

    return this.spawnEnemy(
      spawnCell.gridX,
      spawnCell.gridY,
    )
  }

  public spawnEnemies(
    count: number,
    playerGridX: number,
    playerGridY: number,
  ): number {
    let spawnedCount = 0

    const candidates =
      this.getWalkableCellsByDistance(
        playerGridX,
        playerGridY,
      )

    for (
      const candidate of candidates
    ) {
      if (
        spawnedCount >= count
      ) {
        break
      }

      const enemy =
        this.spawnEnemy(
          candidate.gridX,
          candidate.gridY,
        )

      if (
        enemy !== null
      ) {
        spawnedCount += 1
      }
    }

    console.info(
      `[EnemySystem] Spawned ${spawnedCount}/${count} enemies.`,
    )

    return spawnedCount
  }

  public spawnEnemy(
    gridX: number,
    gridY: number,
  ): Enemy | null {
    if (
      !this.arena.isWalkable(
        gridX,
        gridY,
      ) ||
      this.enemies.some(
        (enemy) =>
          enemy.gridX === gridX &&
          enemy.gridY === gridY,
      )
    ) {
      return null
    }

    const enemy =
      new Enemy(
        this.arena,
        gridX,
        gridY,
      )

    this.enemies.push(
      enemy,
    )

    this.arena.object.add(
      enemy.object,
    )

    console.info(
      `[EnemySystem] Enemy spawned at (${gridX}, ${gridY}).`,
    )

    return enemy
  }

  public update(
    deltaTime: number,
    playerGridX: number,
    playerGridY: number,
  ): void {
    /*
     * The Enemy now receives the player's
     * current grid position and calculates
     * a path toward the player.
     */
    this.enemies.forEach(
      (enemy) => {
        enemy.update(
          deltaTime,
          playerGridX,
          playerGridY,
        )
      },
    )

    this.enemies.forEach(
      (enemy) => {
        if (
          !enemy.isAlive
        ) {
          return
        }

        const colliding =
          enemy.gridX ===
            playerGridX &&
          enemy.gridY ===
            playerGridY

        if (
          colliding &&
          !this.playerContactEnemies.has(
            enemy,
          )
        ) {
          this.playerContactEnemies.add(
            enemy,
          )

          console.warn(
            `[EnemySystem] Enemy/player collision at (${enemy.gridX}, ${enemy.gridY}).`,
          )

          this.onPlayerCollision(
            enemy,
          )
        } else if (
          !colliding
        ) {
          this.playerContactEnemies.delete(
            enemy,
          )
        }
      },
    )

    this.removeDeadEnemies()
  }

  public handleExplosionCell(
    gridX: number,
    gridY: number,
  ): void {
    this.enemies.forEach(
      (enemy) => {
        if (
          enemy.receiveExplosion(
            gridX,
            gridY,
          )
        ) {
          this.playerContactEnemies.delete(
            enemy,
          )

          console.info(
            `[EnemySystem] Enemy destroyed at (${gridX}, ${gridY}).`,
          )
        }
      },
    )

    this.removeDeadEnemies()
  }

  private removeDeadEnemies(): void {
    this.enemies =
      this.enemies.filter(
        (enemy) => {
          if (
            enemy.isAlive
          ) {
            return true
          }

          this.playerContactEnemies.delete(
            enemy,
          )

          return false
        },
      )
  }

  private findFarthestWalkableCell(
    playerGridX: number,
    playerGridY: number,
  ): {
    gridX: number
    gridY: number
  } | null {
    const cells =
      this.getWalkableCellsByDistance(
        playerGridX,
        playerGridY,
      )

    return cells[0] ?? null
  }

  private getWalkableCellsByDistance(
    playerGridX: number,
    playerGridY: number,
  ): {
    gridX: number
    gridY: number
  }[] {
    const cells: {
      gridX: number
      gridY: number
      distance: number
    }[] = []

    for (
      let gridY = 0;
      gridY <
      this.arena.size;
      gridY += 1
    ) {
      for (
        let gridX = 0;
        gridX <
        this.arena.size;
        gridX += 1
      ) {
        if (
          gridX === playerGridX &&
          gridY === playerGridY
        ) {
          continue
        }

        if (
          !this.arena.isWalkable(
            gridX,
            gridY,
          )
        ) {
          continue
        }

        if (
          this.enemies.some(
            (enemy) =>
              enemy.gridX === gridX &&
              enemy.gridY === gridY,
          )
        ) {
          continue
        }

        const distance =
          Math.abs(
            gridX -
              playerGridX,
          ) +
          Math.abs(
            gridY -
              playerGridY,
          )

        cells.push({
          gridX,
          gridY,
          distance,
        })
      }
    }

    cells.sort(
      (first, second) =>
        second.distance -
        first.distance,
    )

    return cells.map(
      ({
        gridX,
        gridY,
      }) => ({
        gridX,
        gridY,
      }),
    )
  }
}
