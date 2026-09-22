import {
  PowerUp,
  PowerUpType,
} from '../entities/PowerUp'
import {
  Arena,
  CellType,
} from '../world/Arena'

export const FIRE_POWERUP_DROP_CHANCE = 0.15
export const BOMB_POWERUP_DROP_CHANCE = 0.20
export const SPEED_POWERUP_DROP_CHANCE = 0.20
export const WATER_POWERUP_DROP_CHANCE = 0.15
export const WIND_POWERUP_DROP_CHANCE = 0.05
export const ICE_POWERUP_DROP_CHANCE = 0.15
export const ELECTRICITY_POWERUP_DROP_CHANCE = 0.05

export type PowerUpCollectionHandler =
  (type: PowerUpType) => void

export class PowerUpSystem {
  private readonly powerUps =
    new Map<string, PowerUp>()

  private readonly arena: Arena

  private readonly onCollect:
    PowerUpCollectionHandler

  public constructor(
    arena: Arena,
    onCollect: PowerUpCollectionHandler,
  ) {
    this.arena = arena
    this.onCollect = onCollect
  }

  public trySpawnPowerUp(
    gridX: number,
    gridY: number,
  ): boolean {
    const cellKey =
      this.getCellKey(
        gridX,
        gridY,
      )

    if (
      this.powerUps.has(
        cellKey,
      ) ||
      this.arena.getCellType(
        gridX,
        gridY,
      ) !== CellType.Floor
    ) {
      return false
    }

    const dropType =
      this.getDropType()

    console.info(
      `[PowerUpSystem] Drop result at (${gridX}, ${gridY}):`,
      dropType,
    )

    if (
      dropType === null
    ) {
      return false
    }

    const powerUp =
      new PowerUp(
        gridX,
        gridY,
        dropType,
      )

    powerUp.object.position.copy(
      this.arena.gridToWorld(
        gridX,
        gridY,
      ),
    )

    this.arena.object.add(
      powerUp.object,
    )

    this.powerUps.set(
      cellKey,
      powerUp,
    )

    console.info(
      `[PowerUpSystem] ${dropType} power-up spawned at (${gridX}, ${gridY}).`,
    )

    return true
  }

  private getDropType():
    PowerUpType | null {
    const roll =
      Math.random()

    let threshold = 0

    threshold +=
      BOMB_POWERUP_DROP_CHANCE

    if (
      roll < threshold
    ) {
      return PowerUpType.Bomb
    }

    threshold +=
      FIRE_POWERUP_DROP_CHANCE

    if (
      roll < threshold
    ) {
      return PowerUpType.Fire
    }

    threshold +=
      SPEED_POWERUP_DROP_CHANCE

    if (
      roll < threshold
    ) {
      return PowerUpType.Speed
    }

    threshold +=
      WATER_POWERUP_DROP_CHANCE

    if (
      roll < threshold
    ) {
      return PowerUpType.Water
    }

    threshold +=
      WIND_POWERUP_DROP_CHANCE

    if (
      roll < threshold
    ) {
      return PowerUpType.Wind
    }

    threshold +=
      ICE_POWERUP_DROP_CHANCE

    if (
      roll < threshold
    ) {
      return PowerUpType.Ice
    }

    threshold +=
      ELECTRICITY_POWERUP_DROP_CHANCE

    if (
      roll < threshold
    ) {
      return PowerUpType.Electricity
    }

    return null
  }

  public update(
    deltaTime: number,
    playerGridX: number,
    playerGridY: number,
  ): void {
    for (
      const [
        cellKey,
        powerUp,
      ] of this.powerUps
    ) {
      powerUp.update(
        deltaTime,
      )

      if (
        powerUp.gridX ===
          playerGridX &&
        powerUp.gridY ===
          playerGridY
      ) {
        powerUp.object.removeFromParent()

        this.powerUps.delete(
          cellKey,
        )

        this.onCollect(
          powerUp.type,
        )
      }
    }
  }

  private getCellKey(
    gridX: number,
    gridY: number,
  ): string {
    return `${gridX},${gridY}`
  }
}
