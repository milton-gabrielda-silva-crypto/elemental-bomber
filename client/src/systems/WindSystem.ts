
import type { MovementDirection } from './InputManager'
import { Wind } from '../entities/Wind'
import { Arena } from '../world/Arena'

interface ActiveWind {
  wind: Wind
  remainingLifetime: number
}

export class WindSystem {
  private readonly effects: ActiveWind[] = []
  private readonly arena: Arena
  private readonly lifetime = 0.55

  public constructor(arena: Arena) {
    this.arena = arena
  }

  public createGust(
    gridX: number,
    gridY: number,
    direction: MovementDirection,
    distance = 3,
  ): void {
    const origin = this.arena.gridToWorld(gridX, gridY)
    const wind = new Wind(
      origin,
      direction,
      this.arena.cellSize,
      distance,
    )

    this.arena.object.add(wind.object)
    this.effects.push({
      wind,
      remainingLifetime: this.lifetime,
    })
  }

  public update(deltaTime: number): void {
    for (let index = this.effects.length - 1; index >= 0; index -= 1) {
      const activeWind = this.effects[index]
      activeWind.remainingLifetime -= deltaTime

      const lifeProgress =
        1 -
        Math.max(activeWind.remainingLifetime, 0) /
          this.lifetime

      activeWind.wind.update(lifeProgress)

      if (activeWind.remainingLifetime <= 0) {
        activeWind.wind.object.removeFromParent()
        activeWind.wind.dispose()
        this.effects.splice(index, 1)
      }
    }
  }

  public clear(): void {
    this.effects.forEach(({ wind }) => {
      wind.object.removeFromParent()
      wind.dispose()
    })

    this.effects.length = 0
  }
}
