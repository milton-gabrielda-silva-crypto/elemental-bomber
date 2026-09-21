import { Steam } from '../entities/Steam'
import { Arena } from '../world/Arena'

interface ActiveSteam {
  steam: Steam
  remainingLifetime: number
}

export type SteamCellHandler = (
  gridX: number,
  gridY: number,
) => void

export class SteamSystem {
  private readonly steams =
    new Map<string, ActiveSteam>()

  private readonly steamLifetime = 1.25

  private readonly arena: Arena

  private readonly onSteamCell: SteamCellHandler

  public constructor(
    arena: Arena,
    onSteamCell: SteamCellHandler = () => undefined,
  ) {
    this.arena = arena
    this.onSteamCell = onSteamCell
  }

  public createSteam(
    gridX: number,
    gridY: number,
  ): void {
    const key =
      this.getCellKey(
        gridX,
        gridY,
      )

    const existingSteam =
      this.steams.get(key)

    if (
      existingSteam !== undefined
    ) {
      existingSteam.remainingLifetime =
        this.steamLifetime

      return
    }

    const steam =
      new Steam(
        gridX,
        gridY,
        this.arena.cellSize,
      )

    steam.object.position.copy(
      this.arena.gridToWorld(
        gridX,
        gridY,
      ),
    )

    this.arena.object.add(
      steam.object,
    )

    this.steams.set(
      key,
      {
        steam,
        remainingLifetime:
          this.steamLifetime,
      },
    )

    this.onSteamCell(
      gridX,
      gridY,
    )

    console.info(
      `[SteamSystem] Steam created at (${gridX}, ${gridY}).`,
    )
  }

  public isSteamAt(
    gridX: number,
    gridY: number,
  ): boolean {
    return this.steams.has(
      this.getCellKey(
        gridX,
        gridY,
      ),
    )
  }

  public removeSteamAt(
    gridX: number,
    gridY: number,
  ): boolean {
    const key =
      this.getCellKey(
        gridX,
        gridY,
      )

    const activeSteam =
      this.steams.get(key)

    if (
      activeSteam === undefined
    ) {
      return false
    }

    activeSteam.steam.object.removeFromParent()

    activeSteam.steam.dispose()

    this.steams.delete(key)

    return true
  }

  public update(
    deltaTime: number,
  ): void {
    for (
      const [
        key,
        activeSteam,
      ] of this.steams
    ) {
      activeSteam.remainingLifetime -=
        deltaTime

      const lifeProgress =
        1 -
        Math.max(
          activeSteam.remainingLifetime,
          0,
        ) /
          this.steamLifetime

      activeSteam.steam.update(
        lifeProgress,
      )

      if (
        activeSteam.remainingLifetime <= 0
      ) {
        activeSteam.steam.object.removeFromParent()

        activeSteam.steam.dispose()

        this.steams.delete(key)

        console.info(
          `[SteamSystem] Steam expired at ${key}.`,
        )
      }
    }
  }

  private getCellKey(
    gridX: number,
    gridY: number,
  ): string {
    return `${gridX}:${gridY}`
  }
}