import { PowerUp, PowerUpType } from '../entities/PowerUp'
import { Arena, CellType } from '../world/Arena'

export const FIRE_POWERUP_DROP_CHANCE = 0.3
export const BOMB_POWERUP_DROP_CHANCE = 0.3
export const SPEED_POWERUP_DROP_CHANCE = 0.3

export type PowerUpCollectionHandler = (type: PowerUpType) => void

export class PowerUpSystem {
  private readonly powerUps = new Map<string, PowerUp>()
  private readonly arena: Arena
  private readonly onCollect: PowerUpCollectionHandler

  public constructor(arena: Arena, onCollect: PowerUpCollectionHandler) {
    this.arena = arena
    this.onCollect = onCollect
  }

  public trySpawnPowerUp(gridX: number, gridY: number): boolean {
    const cellKey = this.getCellKey(gridX, gridY)

    if (this.powerUps.has(cellKey) || this.arena.getCellType(gridX, gridY) !== CellType.Floor) {
      return false
    }

    const dropType = this.getDropType()
    if (dropType === null) {
      return false
    }

    const powerUp = new PowerUp(gridX, gridY, dropType)
    powerUp.object.position.copy(this.arena.gridToWorld(gridX, gridY))
    this.arena.object.add(powerUp.object)
    this.powerUps.set(cellKey, powerUp)
    return true
  }

  private getDropType(): PowerUpType | null {
    const roll = Math.random()

    if (roll < BOMB_POWERUP_DROP_CHANCE) {
      return PowerUpType.Bomb
    }

    if (roll < BOMB_POWERUP_DROP_CHANCE + FIRE_POWERUP_DROP_CHANCE) {
      return PowerUpType.Fire
    }

    if (roll < BOMB_POWERUP_DROP_CHANCE + FIRE_POWERUP_DROP_CHANCE + SPEED_POWERUP_DROP_CHANCE) {
      return PowerUpType.Speed
    }

    return null
  }

  public update(deltaTime: number, playerGridX: number, playerGridY: number): void {
    for (const [cellKey, powerUp] of this.powerUps) {
      powerUp.update(deltaTime)

      if (powerUp.gridX === playerGridX && powerUp.gridY === playerGridY) {
        powerUp.object.removeFromParent()
        this.powerUps.delete(cellKey)
        this.onCollect(powerUp.type)
      }
    }
  }

  private getCellKey(gridX: number, gridY: number): string {
    return `${gridX},${gridY}`
  }
}
