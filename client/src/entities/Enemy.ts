import * as THREE from 'three'
import { Arena } from '../world/Arena'

export type EnemyDirection = 'up' | 'down' | 'left' | 'right'

interface DirectionData {
  deltaX: number
  deltaY: number
  rotationY: number
}

export class Enemy {
  public readonly object: THREE.Group
  public readonly movementSpeed = 2
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

  public constructor(arena: Arena, gridX: number, gridY: number) {
    this.arena = arena
    this.gridX = gridX
    this.gridY = gridY
    this.targetGridX = gridX
    this.targetGridY = gridY
    this.object = this.createObject()
    this.object.position.copy(this.arena.gridToWorld(gridX, gridY))
  }

  public update(deltaTime: number): void {
    if (!this.isAlive) {
      return
    }

    this.elapsedTime += deltaTime
    this.visual.position.y = Math.sin(this.elapsedTime * 3) * 0.04

    if (this.isMoving()) {
      this.updateMovement(deltaTime)
      return
    }

    const nextDirection = this.chooseDirection()
    if (nextDirection === null) {
      return
    }

    this.direction = nextDirection
    const directionData = this.getDirectionData(nextDirection)
    this.object.rotation.y = directionData.rotationY
    this.targetGridX = this.gridX + directionData.deltaX
    this.targetGridY = this.gridY + directionData.deltaY
    this.startPosition.copy(this.object.position)
    this.targetPosition.copy(this.arena.gridToWorld(this.targetGridX, this.targetGridY))
    this.movementProgress = 0
  }

  public destroy(): void {
    if (!this.isAlive) {
      return
    }

    this.isAlive = false
    this.object.removeFromParent()
  }

  public receiveExplosion(gridX: number, gridY: number): boolean {
    if (!this.isAlive || this.gridX !== gridX || this.gridY !== gridY) {
      return false
    }

    this.destroy()
    return true
  }

  private createObject(): THREE.Group {
    const enemy = new THREE.Group()
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xb83bdb,
      emissive: 0x43105e,
      emissiveIntensity: 0.8,
      roughness: 0.55,
    })
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xf6fbff, roughness: 0.35 })
    const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x16121d, roughness: 0.45 })
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 14), bodyMaterial)
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), eyeMaterial)
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), eyeMaterial)
    const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), pupilMaterial)
    const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), pupilMaterial)

    body.position.y = 0.34
    leftEye.position.set(-0.13, 0.46, 0.27)
    rightEye.position.set(0.13, 0.46, 0.27)
    leftPupil.position.set(-0.13, 0.46, 0.35)
    rightPupil.position.set(0.13, 0.46, 0.35)
    this.visual.add(body, leftEye, rightEye, leftPupil, rightPupil)
    enemy.add(this.visual)

    return enemy
  }

  private chooseDirection(): EnemyDirection | null {
    const availableDirections = this.getAvailableDirections()
    if (availableDirections.length === 0) {
      return null
    }

    if (availableDirections.includes(this.direction)) {
      return this.direction
    }

    const reverseDirection = this.getReverseDirection(this.direction)
    const nonReverseDirections = availableDirections.filter((direction) => direction !== reverseDirection)
    const choices = nonReverseDirections.length > 0 ? nonReverseDirections : availableDirections
    return choices[Math.floor(Math.random() * choices.length)]
  }

  private getAvailableDirections(): EnemyDirection[] {
    const directions: EnemyDirection[] = ['up', 'down', 'left', 'right']
    return directions.filter((direction) => {
      const { deltaX, deltaY } = this.getDirectionData(direction)
      return this.arena.isWalkable(this.gridX + deltaX, this.gridY + deltaY)
    })
  }

  private updateMovement(deltaTime: number): void {
    this.movementProgress = Math.min(this.movementProgress + deltaTime * this.movementSpeed, 1)
    this.object.position.lerpVectors(this.startPosition, this.targetPosition, this.movementProgress)

    if (this.movementProgress === 1) {
      this.gridX = this.targetGridX
      this.gridY = this.targetGridY
    }
  }

  private isMoving(): boolean {
    return this.movementProgress < 1
  }

  private getReverseDirection(direction: EnemyDirection): EnemyDirection {
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

  private getDirectionData(direction: EnemyDirection): DirectionData {
    switch (direction) {
      case 'up':
        return { deltaX: 0, deltaY: -1, rotationY: Math.PI }
      case 'down':
        return { deltaX: 0, deltaY: 1, rotationY: 0 }
      case 'left':
        return { deltaX: -1, deltaY: 0, rotationY: -Math.PI / 2 }
      case 'right':
        return { deltaX: 1, deltaY: 0, rotationY: Math.PI / 2 }
    }
  }
}
