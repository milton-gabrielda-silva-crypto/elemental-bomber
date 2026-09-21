export type MovementDirection = 'up' | 'down' | 'left' | 'right'
export type DebugAnimationName =
  | 'Fire_IDLE'
  | 'Fire_WALK'
  | 'Fire_RUN'
  | 'Fire_PLACE_BOMB'
  | 'Fire_HIT'
  | 'Fire_DEATH'
  | 'Fire_VICTORY'

export class InputManager {
  private readonly pressedKeys = new Set<string>()
  private requestedDebugAnimation: DebugAnimationName | null = null
  private requestedBombPlacement = false

  public constructor() {
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
  }

  public getMovementDirection(): MovementDirection | null {
    if (this.isPressed('KeyW', 'ArrowUp')) {
      return 'up'
    }
    if (this.isPressed('KeyS', 'ArrowDown')) {
      return 'down'
    }
    if (this.isPressed('KeyA', 'ArrowLeft')) {
      return 'left'
    }
    if (this.isPressed('KeyD', 'ArrowRight')) {
      return 'right'
    }

    return null
  }

  public consumeDebugAnimation(): DebugAnimationName | null {
    const animation = this.requestedDebugAnimation
    this.requestedDebugAnimation = null
    return animation
  }

  public consumeBombPlacement(): boolean {
    const shouldPlaceBomb = this.requestedBombPlacement
    this.requestedBombPlacement = false
    return shouldPlaceBomb
  }

  public dispose(): void {
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)
    this.pressedKeys.clear()
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    const debugAnimation = this.getDebugAnimation(event.code)
    const isBombKey = event.code === 'Space'

    if (!this.isMovementKey(event.code) && debugAnimation === null && !isBombKey) {
      return
    }

    event.preventDefault()

    if (this.isMovementKey(event.code)) {
      this.pressedKeys.add(event.code)
    }

    if (debugAnimation !== null) {
      this.requestedDebugAnimation = debugAnimation
    }

    if (isBombKey && !event.repeat) {
      this.requestedBombPlacement = true
    }
  }

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    if (!this.isMovementKey(event.code) && event.code !== 'Space') {
      return
    }

    event.preventDefault()
    this.pressedKeys.delete(event.code)
  }

  private isPressed(firstKey: string, secondKey: string): boolean {
    return this.pressedKeys.has(firstKey) || this.pressedKeys.has(secondKey)
  }

  private isMovementKey(key: string): boolean {
    return ['KeyW', 'ArrowUp', 'KeyS', 'ArrowDown', 'KeyA', 'ArrowLeft', 'KeyD', 'ArrowRight'].includes(key)
  }

  private getDebugAnimation(key: string): DebugAnimationName | null {
    const debugAnimations: Record<string, DebugAnimationName> = {
      Digit1: 'Fire_IDLE',
      Digit2: 'Fire_WALK',
      Digit3: 'Fire_RUN',
      Digit4: 'Fire_PLACE_BOMB',
      Digit5: 'Fire_HIT',
      Digit6: 'Fire_DEATH',
      Digit7: 'Fire_VICTORY',
    }

    return debugAnimations[key] ?? null
  }
}
