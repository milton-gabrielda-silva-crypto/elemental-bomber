import * as THREE from 'three'
import { Arena } from '../world/Arena'

export type EnemyDirection =
  | 'up'
  | 'down'
  | 'left'
  | 'right'

export type EnemyElement =
  | 'NORMAL'
  | 'FIRE'
  | 'WATER'
  | 'ICE'
  | 'NATURE'
  | 'ELECTRICITY'

interface DirectionData {
  deltaX: number
  deltaY: number
  rotationY: number
}

interface GridPosition {
  gridX: number
  gridY: number
}

interface EnemyVisualStyle {
  color: number
  emissive: number
  emissiveIntensity: number
}

export class Enemy {
  public readonly object: THREE.Group
  public readonly movementSpeed = 2

  public readonly element: EnemyElement

  public gridX: number
  public gridY: number

  public direction: EnemyDirection = 'down'
  public isAlive = true

  private readonly arena: Arena
  private readonly startPosition = new THREE.Vector3()
  private readonly targetPosition = new THREE.Vector3()
  private readonly visual = new THREE.Group()

  private targetGridX: number
  private targetGridY: number
  private movementProgress = 1
  private elapsedTime = 0

  public constructor(
    arena: Arena,
    gridX: number,
    gridY: number,
    element: EnemyElement = 'NORMAL',
  ) {
    this.arena = arena
    this.gridX = gridX
    this.gridY = gridY
    this.targetGridX = gridX
    this.targetGridY = gridY
    this.element = element

    this.object = this.createObject()

    this.object.position.copy(
      this.arena.gridToWorld(
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
    if (!this.isAlive) {
      return
    }

    this.elapsedTime += deltaTime

    this.visual.position.y =
      Math.sin(
        this.elapsedTime * 3,
      ) * 0.04

    if (this.isMoving()) {
      this.updateMovement(
        deltaTime,
      )

      return
    }

    const nextDirection =
      this.chooseDirection(
        playerGridX,
        playerGridY,
      )

    if (
      nextDirection === null
    ) {
      return
    }

    this.direction =
      nextDirection

    const directionData =
      this.getDirectionData(
        nextDirection,
      )

    this.object.rotation.y =
      directionData.rotationY

    this.targetGridX =
      this.gridX +
      directionData.deltaX

    this.targetGridY =
      this.gridY +
      directionData.deltaY

    this.startPosition.copy(
      this.object.position,
    )

    this.targetPosition.copy(
      this.arena.gridToWorld(
        this.targetGridX,
        this.targetGridY,
      ),
    )

    this.movementProgress = 0
  }

  public destroy(): void {
    if (!this.isAlive) {
      return
    }

    this.isAlive = false
    this.object.removeFromParent()
  }

  public receiveExplosion(
    gridX: number,
    gridY: number,
  ): boolean {
    if (
      !this.isAlive ||
      this.gridX !== gridX ||
      this.gridY !== gridY
    ) {
      return false
    }

    this.destroy()

    return true
  }

  private createObject(): THREE.Group {
    const enemy =
      new THREE.Group()

    const visualStyle =
      this.getVisualStyle()

    const bodyMaterial =
      new THREE.MeshStandardMaterial({
        color: visualStyle.color,
        emissive: visualStyle.emissive,
        emissiveIntensity:
          visualStyle.emissiveIntensity,
        roughness: 0.55,
      })

    const eyeMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xf6fbff,
        roughness: 0.35,
      })

    const pupilMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x16121d,
        roughness: 0.45,
      })

    const body =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.34,
          20,
          14,
        ),
        bodyMaterial,
      )

    const leftEye =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.09,
          12,
          8,
        ),
        eyeMaterial,
      )

    const rightEye =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.09,
          12,
          8,
        ),
        eyeMaterial,
      )

    const leftPupil =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.04,
          8,
          6,
        ),
        pupilMaterial,
      )

    const rightPupil =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.04,
          8,
          6,
        ),
        pupilMaterial,
      )

    body.position.y = 0.34

    leftEye.position.set(
      -0.13,
      0.46,
      0.27,
    )

    rightEye.position.set(
      0.13,
      0.46,
      0.27,
    )

    leftPupil.position.set(
      -0.13,
      0.46,
      0.35,
    )

    rightPupil.position.set(
      0.13,
      0.46,
      0.35,
    )

    this.visual.add(
      body,
      leftEye,
      rightEye,
      leftPupil,
      rightPupil,
    )

    enemy.add(
      this.visual,
    )

    return enemy
  }

  private getVisualStyle():
    EnemyVisualStyle {
    switch (this.element) {
      case 'FIRE':
        return {
          color: 0xf04422,
          emissive: 0x7a1608,
          emissiveIntensity: 1.2,
        }

      case 'WATER':
        return {
          color: 0x2196f3,
          emissive: 0x063b78,
          emissiveIntensity: 1.1,
        }

      case 'ICE':
        return {
          color: 0x7ddcff,
          emissive: 0x0b6688,
          emissiveIntensity: 1.2,
        }

      case 'NATURE':
        return {
          color: 0x55b947,
          emissive: 0x123d0d,
          emissiveIntensity: 0.9,
        }

      case 'ELECTRICITY':
        return {
          color: 0xc65cff,
          emissive: 0x5a0c82,
          emissiveIntensity: 1.4,
        }

      case 'NORMAL':
      default:
        return {
          color: 0xb83bdb,
          emissive: 0x43105e,
          emissiveIntensity: 0.8,
        }
    }
  }

  private chooseDirection(
    playerGridX: number,
    playerGridY: number,
  ): EnemyDirection | null {
    const path =
      this.findPathToPlayer(
        playerGridX,
        playerGridY,
      )

    if (
      path.length >= 2
    ) {
      const nextCell =
        path[1]

      return this.getDirectionToCell(
        nextCell.gridX,
        nextCell.gridY,
      )
    }

    /*
     * If the enemy is already on the
     * player's cell, do not start another
     * movement. EnemySystem handles the
     * collision.
     */
    if (
      path.length === 1
    ) {
      return null
    }

    /*
     * If no path exists, keep the enemy
     * moving using the fallback behavior.
     */
    return this.chooseFallbackDirection()
  }

  private findPathToPlayer(
    playerGridX: number,
    playerGridY: number,
  ): GridPosition[] {
    const start: GridPosition = {
      gridX: this.gridX,
      gridY: this.gridY,
    }

    const target: GridPosition = {
      gridX: playerGridX,
      gridY: playerGridY,
    }

    if (
      start.gridX === target.gridX &&
      start.gridY === target.gridY
    ) {
      return [start]
    }

    const queue: GridPosition[] = [
      start,
    ]

    const visited =
      new Set<string>()

    const previous =
      new Map<
        string,
        GridPosition | null
      >()

    const startKey =
      this.getCellKey(
        start.gridX,
        start.gridY,
      )

    visited.add(
      startKey,
    )

    previous.set(
      startKey,
      null,
    )

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

      if (
        current.gridX ===
          target.gridX &&
        current.gridY ===
          target.gridY
      ) {
        return this.reconstructPath(
          target,
          previous,
        )
      }

      const neighbors =
        this.getNeighbors(
          current.gridX,
          current.gridY,
        )

      for (
        const neighbor of neighbors
      ) {
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

        /*
         * The player's current cell is
         * allowed as a destination so the
         * enemy can reach the player and
         * trigger the collision system.
         */
        const isPlayerCell =
          neighbor.gridX ===
            playerGridX &&
          neighbor.gridY ===
            playerGridY

        if (
          !isPlayerCell &&
          !this.arena.isWalkable(
            neighbor.gridX,
            neighbor.gridY,
          )
        ) {
          continue
        }

        visited.add(
          neighborKey,
        )

        previous.set(
          neighborKey,
          current,
        )

        queue.push(
          neighbor,
        )
      }
    }

    return []
  }

  private reconstructPath(
    target: GridPosition,
    previous: Map<
      string,
      GridPosition | null
    >,
  ): GridPosition[] {
    const path: GridPosition[] = []

    let current:
      GridPosition | null =
      target

    while (
      current !== null
    ) {
      path.push(
        current,
      )

      const currentKey =
        this.getCellKey(
          current.gridX,
          current.gridY,
        )

      current =
        previous.get(
          currentKey,
        ) ?? null
    }

    path.reverse()

    return path
  }

  private chooseFallbackDirection():
    | EnemyDirection
    | null {
    const availableDirections =
      this.getAvailableDirections()

    if (
      availableDirections.length === 0
    ) {
      return null
    }

    if (
      availableDirections.includes(
        this.direction,
      )
    ) {
      return this.direction
    }

    const reverseDirection =
      this.getReverseDirection(
        this.direction,
      )

    const nonReverseDirections =
      availableDirections.filter(
        (direction) =>
          direction !==
          reverseDirection,
      )

    const choices =
      nonReverseDirections.length > 0
        ? nonReverseDirections
        : availableDirections

    return choices[
      Math.floor(
        Math.random() *
          choices.length,
      )
    ]
  }

  private getAvailableDirections():
    EnemyDirection[] {
    const directions:
      EnemyDirection[] = [
        'up',
        'down',
        'left',
        'right',
      ]

    return directions.filter(
      (direction) => {
        const {
          deltaX,
          deltaY,
        } =
          this.getDirectionData(
            direction,
          )

        return this.arena.isWalkable(
          this.gridX + deltaX,
          this.gridY + deltaY,
        )
      },
    )
  }

  private updateMovement(
    deltaTime: number,
  ): void {
    this.movementProgress =
      Math.min(
        this.movementProgress +
          deltaTime *
            this.movementSpeed,
        1,
      )

    this.object.position.lerpVectors(
      this.startPosition,
      this.targetPosition,
      this.movementProgress,
    )

    if (
      this.movementProgress === 1
    ) {
      this.gridX =
        this.targetGridX

      this.gridY =
        this.targetGridY
    }
  }

  private isMoving(): boolean {
    return (
      this.movementProgress < 1
    )
  }

  private getDirectionToCell(
    targetGridX: number,
    targetGridY: number,
  ): EnemyDirection | null {
    const deltaX =
      targetGridX - this.gridX

    const deltaY =
      targetGridY - this.gridY

    if (
      deltaX === 1 &&
      deltaY === 0
    ) {
      return 'right'
    }

    if (
      deltaX === -1 &&
      deltaY === 0
    ) {
      return 'left'
    }

    if (
      deltaX === 0 &&
      deltaY === 1
    ) {
      return 'down'
    }

    if (
      deltaX === 0 &&
      deltaY === -1
    ) {
      return 'up'
    }

    return null
  }

  private getReverseDirection(
    direction: EnemyDirection,
  ): EnemyDirection {
    switch (direction) {
      case 'up':
        return 'down'

      case 'down':
        return 'up'

      case 'left':
        return 'right'

      case 'right':
        return 'left'
    }
  }

  private getDirectionData(
    direction: EnemyDirection,
  ): DirectionData {
    switch (direction) {
      case 'up':
        return {
          deltaX: 0,
          deltaY: -1,
          rotationY: Math.PI,
        }

      case 'down':
        return {
          deltaX: 0,
          deltaY: 1,
          rotationY: 0,
        }

      case 'left':
        return {
          deltaX: -1,
          deltaY: 0,
          rotationY:
            -Math.PI / 2,
        }

      case 'right':
        return {
          deltaX: 1,
          deltaY: 0,
          rotationY:
            Math.PI / 2,
        }
    }
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
