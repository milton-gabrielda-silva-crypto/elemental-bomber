import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type {
  DebugAnimationName,
  MovementDirection,
} from '../systems/InputManager'
import type { PowerUpType } from './PowerUp'
import { Arena } from '../world/Arena'

const oneShotAnimations =
  new Set<DebugAnimationName>([
    'Fire_PLACE_BOMB',
    'Fire_HIT',
    'Fire_DEATH',
    'Fire_VICTORY',
  ])

const returnToIdleAnimations =
  new Set<DebugAnimationName>([
    'Fire_PLACE_BOMB',
    'Fire_HIT',
    'Fire_VICTORY',
  ])

export const SPEED_POWERUP_AMOUNT = 1
export const WATER_POWERUP_AMOUNT = 1
export const WIND_POWERUP_AMOUNT = 1

export class Player {
  public readonly object: THREE.Group
  public gridX: number
  public gridY: number
  public movementSpeed = 4
  public bombExplosionRange = 2
  public bombMaxCount = 1
  public waterPower = 0
  public windPower = 0

  public readonly maxHealth = 3
  public health = this.maxHealth
  public isDead = false

  private readonly arena: Arena
  private readonly startPosition = new THREE.Vector3()
  private readonly targetPosition = new THREE.Vector3()
  private targetGridX: number
  private targetGridY: number
  private movementProgress = 1

  private animationMixer: THREE.AnimationMixer | null = null
  private activeAnimation: THREE.AnimationAction | null = null
  private currentAnimationName = 'Loading...'
  private debugAnimation: DebugAnimationName | null = null

  private readonly animationActions =
    new Map<string, THREE.AnimationAction>()

  private invulnerabilityTimer = 0
  private readonly invulnerabilityDuration = 2

  private isWaterAt:
    | ((gridX: number, gridY: number) => boolean)
    | null = null

  private slidingDirection:
    | MovementDirection
    | null = null

  private sliding = false

  private facingDirection: MovementDirection = 'down'

  public constructor(
    arena: Arena,
    startGridX: number,
    startGridY: number,
    isWaterAt?: (
      gridX: number,
      gridY: number,
    ) => boolean,
  ) {
    if (
      !arena.isWalkable(
        startGridX,
        startGridY,
      )
    ) {
      throw new Error(
        'Player must start on a walkable arena cell.',
      )
    }

    this.arena = arena

    this.gridX = startGridX
    this.gridY = startGridY

    this.targetGridX = startGridX
    this.targetGridY = startGridY

    this.isWaterAt =
      isWaterAt ?? null

    this.object =
      this.createObject()

    this.object.position.copy(
      this.arena.gridToWorld(
        this.gridX,
        this.gridY,
      ),
    )
  }

  public getFacingDirection(): MovementDirection {
    return this.facingDirection
  }

  public setWaterChecker(
    isWaterAt: (
      gridX: number,
      gridY: number,
    ) => boolean,
  ): void {
    this.isWaterAt = isWaterAt
  }

  public update(
    deltaTime: number,
    direction: MovementDirection | null,
    debugAnimation: DebugAnimationName | null,
  ): void {
    this.animationMixer?.update(
      deltaTime,
    )

    if (
      this.invulnerabilityTimer > 0
    ) {
      this.invulnerabilityTimer =
        Math.max(
          0,
          this.invulnerabilityTimer -
            deltaTime,
        )
    }

    if (
      debugAnimation !== null
    ) {
      this.playDebugAnimation(
        debugAnimation,
      )
    }

    if (this.isDead) {
      return
    }

    if (this.isMoving()) {
      this.updateMovement(
        deltaTime,
      )
    } else if (
      this.sliding
    ) {
      this.continueSliding(
        direction,
      )
    } else if (
      direction !== null
    ) {
      this.tryMove(
        direction,
      )
    }

    if (
      this.debugAnimation === null
    ) {
      this.playAnimation(
        this.isMoving()
          ? 'Fire_WALK'
          : 'Fire_IDLE',
      )
    }
  }

  public getCurrentAnimationName(): string {
    return this.currentAnimationName
  }

  public getHealth(): number {
    return this.health
  }

  public getMaxHealth(): number {
    return this.maxHealth
  }

  public isInvulnerable(): boolean {
    return (
      this.invulnerabilityTimer > 0
    )
  }

  public takeDamage(): void {
    if (
      this.isDead ||
      this.invulnerabilityTimer > 0
    ) {
      return
    }

    this.health -= 1

    this.invulnerabilityTimer =
      this.invulnerabilityDuration

    console.info(
      `[Player] Damage received. Health: ${this.health}/${this.maxHealth}`,
    )

    if (this.health <= 0) {
      this.health = 0
      this.isDead = true
      this.sliding = false
      this.slidingDirection = null
      this.debugAnimation =
        'Fire_DEATH'

      this.playDebugAnimation(
        'Fire_DEATH',
      )

      console.info(
        '[Player] Player died.',
      )

      return
    }

    this.debugAnimation =
      'Fire_HIT'

    this.playDebugAnimation(
      'Fire_HIT',
    )
  }

  public collectPowerUp(
    type: PowerUpType,
  ): void {
    if (this.isDead) {
      return
    }

    if (type === 'FIRE') {
      this.bombExplosionRange += 1

      console.info(
        `[Player] Fire power-up collected. Explosion range: ${this.bombExplosionRange}`,
      )
    } else if (
      type === 'BOMB'
    ) {
      this.bombMaxCount += 1

      console.info(
        `[Player] Bomb power-up collected. Max bombs: ${this.bombMaxCount}`,
      )
    } else if (
      type === 'SPEED'
    ) {
      this.movementSpeed +=
        SPEED_POWERUP_AMOUNT

      console.info(
        `[Player] Speed power-up collected. Movement speed: ${this.movementSpeed}`,
      )
    } else if (
      type === 'WATER'
    ) {
      this.waterPower +=
        WATER_POWERUP_AMOUNT

      console.info(
        `[Player] Water power-up collected. Water power: ${this.waterPower}`,
      )
    } else if (
      type === 'WIND'
    ) {
      this.windPower +=
        WIND_POWERUP_AMOUNT

      console.info(
        `[Player] Wind power-up collected. Wind power: ${this.windPower}`,
      )
    }
  }

  private createObject(): THREE.Group {
    const player =
      new THREE.Group()

    const loader =
      new GLTFLoader()

    loader.load(
      '/assets/fire_character.glb',
      (gltf) =>
        this.addCharacterModel(
          player,
          gltf.scene,
          gltf.animations,
        ),
      undefined,
      (error: unknown) => {
        console.error(
          '[Player] Failed to load /assets/fire_character.glb.',
          error,
        )
      },
    )

    return player
  }

  private addCharacterModel(
    player: THREE.Group,
    model: THREE.Group,
    animations: THREE.AnimationClip[],
  ): void {
    model.rotation.y = Math.PI

    this.fitModelToCell(
      model,
    )

    player.add(model)

    const mixer =
      new THREE.AnimationMixer(
        model,
      )

    this.animationMixer =
      mixer

    mixer.addEventListener(
      'finished',
      this.handleAnimationFinished,
    )

    animations.forEach(
      (clip) => {
        this.animationActions.set(
          clip.name,
          mixer.clipAction(clip),
        )
      },
    )

    console.info(
      '[Player] Fire character loaded. Animations found:',
      animations.map(
        (clip) => clip.name,
      ),
    )

    this.logMissingAnimation(
      'Fire_IDLE',
    )

    this.logMissingAnimation(
      'Fire_WALK',
    )

    this.logMissingAnimation(
      'Fire_HIT',
    )

    this.logMissingAnimation(
      'Fire_DEATH',
    )

    this.playAnimation(
      this.debugAnimation ??
        (this.isMoving()
          ? 'Fire_WALK'
          : 'Fire_IDLE'),
    )
  }

  private fitModelToCell(
    model: THREE.Group,
  ): void {
    const bounds =
      new THREE.Box3().setFromObject(
        model,
      )

    const dimensions =
      bounds.getSize(
        new THREE.Vector3(),
      )

    const targetWidth =
      this.arena.cellSize * 0.75

    const modelWidth =
      dimensions.x

    if (modelWidth <= 0) {
      console.warn(
        '[Player] Could not calculate the Fire character width for cell sizing.',
      )

      return
    }

    const scale =
      targetWidth / modelWidth

    model.scale.setScalar(
      scale,
    )

    model.updateMatrixWorld(
      true,
    )

    const scaledBounds =
      new THREE.Box3().setFromObject(
        model,
      )

    model.position.y -=
      scaledBounds.min.y

    const finalDimensions =
      scaledBounds.getSize(
        new THREE.Vector3(),
      )

    console.info(
      '[Player] Fire character sizing:',
      {
        cellSize:
          this.arena.cellSize,
        sourceBounds: {
          min:
            bounds.min.toArray(),
          max:
            bounds.max.toArray(),
          size:
            dimensions.toArray(),
        },
        targetWidth,
        finalScale: scale,
        finalHeight:
          finalDimensions.y,
      },
    )
  }

  private playDebugAnimation(
    name: DebugAnimationName,
  ): void {
    const action =
      this.animationActions.get(
        name,
      )

    if (action === undefined) {
      console.warn(
        `[Player] Debug animation "${name}" was not found in fire_character.glb.`,
      )

      return
    }

    this.debugAnimation = name

    action.clampWhenFinished =
      name === 'Fire_DEATH'

    action.setLoop(
      oneShotAnimations.has(name)
        ? THREE.LoopOnce
        : THREE.LoopRepeat,
      Infinity,
    )

    this.playAnimation(
      name,
      true,
    )
  }

  private playAnimation(
    name: string,
    restart = false,
  ): void {
    const nextAnimation =
      this.animationActions.get(
        name,
      )

    if (nextAnimation === undefined) {
      return
    }

    if (
      nextAnimation ===
      this.activeAnimation
    ) {
      if (restart) {
        nextAnimation
          .reset()
          .play()
      }

      return
    }

    this.activeAnimation?.fadeOut(
      0.2,
    )

    nextAnimation
      .reset()
      .fadeIn(0.2)
      .play()

    this.activeAnimation =
      nextAnimation

    this.currentAnimationName =
      name
  }

  private readonly handleAnimationFinished =
    (
      event: THREE.Event,
    ): void => {
      const finishedAction =
        (
          event as THREE.Event & {
            action: THREE.AnimationAction
          }
        ).action

      if (
        finishedAction ===
          this.activeAnimation &&
        this.debugAnimation !==
          null &&
        returnToIdleAnimations.has(
          this.debugAnimation,
        )
      ) {
        this.debugAnimation = null

        this.playAnimation(
          'Fire_IDLE',
        )
      }
    }

  private logMissingAnimation(
    name: string,
  ): void {
    if (
      !this.animationActions.has(
        name,
      )
    ) {
      console.warn(
        `[Player] Animation "${name}" was not found in fire_character.glb.`,
      )
    }
  }

  private tryMove(
    direction: MovementDirection,
  ): void {
    if (this.isDead) {
      return
    }

    const {
      deltaX,
      deltaY,
      rotationY,
    } =
      this.getDirectionData(
        direction,
      )

    this.facingDirection = direction
    this.object.rotation.y =
      rotationY

    const nextGridX =
      this.gridX + deltaX

    const nextGridY =
      this.gridY + deltaY

    if (
      !this.arena.isWalkable(
        nextGridX,
        nextGridY,
      )
    ) {
      this.sliding = false
      this.slidingDirection = null

      return
    }

    this.targetGridX =
      nextGridX

    this.targetGridY =
      nextGridY

    this.startPosition.copy(
      this.object.position,
    )

    this.targetPosition.copy(
      this.arena.gridToWorld(
        nextGridX,
        nextGridY,
      ),
    )

    this.movementProgress = 0

    if (
      this.isWaterAt !== null &&
      this.isWaterAt(
        nextGridX,
        nextGridY,
      )
    ) {
      this.slidingDirection =
        direction
    } else {
      this.slidingDirection = null
    }
  }

  private continueSliding(
    direction: MovementDirection | null,
  ): void {
    if (
      this.slidingDirection === null
    ) {
      this.sliding = false
      return
    }

    const currentOnWater =
      this.isWaterAt !== null &&
      this.isWaterAt(
        this.gridX,
        this.gridY,
      )

    if (!currentOnWater) {
      this.sliding = false
      this.slidingDirection = null

      if (direction !== null) {
        this.tryMove(
          direction,
        )
      }

      return
    }

    this.tryMove(
      this.slidingDirection,
    )

    if (!this.isMoving()) {
      this.sliding = false
      this.slidingDirection = null
    }
  }

  private updateMovement(
    deltaTime: number,
  ): void {
    if (this.isDead) {
      return
    }

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

      const onWater =
        this.isWaterAt !== null &&
        this.isWaterAt(
          this.gridX,
          this.gridY,
        )

      if (onWater) {
        this.sliding = true
      } else {
        this.sliding = false
        this.slidingDirection = null
      }
    }
  }

  private isMoving(): boolean {
    return (
      this.movementProgress < 1
    )
  }

  private getDirectionData(
    direction: MovementDirection,
  ): {
    deltaX: number
    deltaY: number
    rotationY: number
  } {
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
}