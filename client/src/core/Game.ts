import * as THREE from 'three'
import { CameraManager } from './CameraManager'
import { SceneManager } from './SceneManager'
import { EnemySystem } from '../systems/EnemySystem'
import { Player } from '../entities/Player'
import { BombSystem } from '../systems/BombSystem'
import { ExplosionSystem } from '../systems/ExplosionSystem'
import { InputManager } from '../systems/InputManager'
import { PowerUpSystem } from '../systems/PowerUpSystem'
import { ExitSystem } from '../systems/ExitSystem'
import { Arena } from '../world/Arena'

export class Game {
  private readonly renderer: THREE.WebGLRenderer
  private readonly sceneManager: SceneManager
  private readonly cameraManager: CameraManager
  private readonly container: HTMLElement
  private readonly arena: Arena
  private readonly player: Player
  private readonly bombSystem: BombSystem
  private readonly explosionSystem: ExplosionSystem
  private readonly enemySystem: EnemySystem
  private readonly powerUpSystem: PowerUpSystem
  private readonly exitSystem: ExitSystem
  private readonly inputManager: InputManager
  private readonly clock = new THREE.Clock()

  private readonly animationDebugElement: HTMLDivElement
  private readonly healthHudElement: HTMLDivElement
  private readonly gameOverElement: HTMLDivElement
  private readonly stageClearElement: HTMLDivElement
  private readonly restartButton: HTMLButtonElement

  private animationFrameId: number | null = null
  private gameOverShown = false
  private gameOverTimer = 0
  private stageClearShown = false

  public constructor(container: HTMLElement) {
    this.container = container

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    })

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2),
    )

    this.renderer.outputColorSpace =
      THREE.SRGBColorSpace

    this.container.appendChild(
      this.renderer.domElement,
    )

    this.animationDebugElement =
      document.createElement('div')

    this.animationDebugElement.className =
      'animation-debug'

    this.container.appendChild(
      this.animationDebugElement,
    )

    this.healthHudElement =
      document.createElement('div')

    this.healthHudElement.className =
      'health-hud'

    this.container.appendChild(
      this.healthHudElement,
    )

    this.gameOverElement =
      document.createElement('div')

    this.gameOverElement.className =
      'game-over'

    this.gameOverElement.innerHTML = `
      <div class="game-over__panel">
        <div class="game-over__eyebrow">
          ELEMENTAL BOMBER
        </div>

        <h1 class="game-over__title">
          GAME OVER
        </h1>

        <p class="game-over__message">
          The fire has gone out...
        </p>

        <button
          class="game-over__restart"
          type="button"
        >
          RESTART
        </button>
      </div>
    `

    this.container.appendChild(
      this.gameOverElement,
    )

    const restartButton =
      this.gameOverElement.querySelector<HTMLButtonElement>(
        '.game-over__restart',
      )

    if (restartButton === null) {
      throw new Error(
        'Restart button could not be created.',
      )
    }

    this.restartButton = restartButton

    this.restartButton.addEventListener(
      'click',
      this.restart,
    )

    this.stageClearElement =
      document.createElement('div')

    this.stageClearElement.className =
      'stage-clear'

    this.stageClearElement.innerHTML = `
      <div class="stage-clear__panel">
        <div class="stage-clear__eyebrow">
          ELEMENTAL BOMBER
        </div>

        <h1 class="stage-clear__title">
          STAGE CLEAR
        </h1>

        <p class="stage-clear__message">
          The fire burns brighter.
        </p>
      </div>
    `

    this.container.appendChild(
      this.stageClearElement,
    )

    this.sceneManager = new SceneManager()
    this.cameraManager = new CameraManager(1)

    this.arena = new Arena()

    this.player = new Player(
      this.arena,
      1,
      1,
    )

    this.enemySystem = new EnemySystem(
      this.arena,
      (enemy) => {
        console.warn(
          `[EnemySystem] Enemy/player collision at (${enemy.gridX}, ${enemy.gridY}).`,
        )

        this.player.takeDamage()
      },
    )

    this.enemySystem.spawnInitialEnemy(
      this.player.gridX,
      this.player.gridY,
    )

    this.explosionSystem =
      new ExplosionSystem(
        this.arena,
        (gridX, gridY) => {
          this.enemySystem.handleExplosionCell(
            gridX,
            gridY,
          )
        },
      )

    this.powerUpSystem =
      new PowerUpSystem(
        this.arena,
        (type) => {
          this.player.collectPowerUp(type)
        },
      )

    this.exitSystem =
      new ExitSystem(this.arena)

    this.bombSystem =
      new BombSystem(
        this.arena,
        (gridX, gridY) => {
          this.explosionSystem.createExplosion(
            gridX,
            gridY,
            this.player.bombExplosionRange,
          )
        },
      )

    this.inputManager =
      new InputManager()

    this.arena.object.add(
      this.player.object,
    )

    this.sceneManager.scene.add(
      this.arena.object,
    )

    this.gameOverElement.classList.remove(
      'is-visible',
    )

    this.stageClearElement.classList.remove(
      'is-visible',
    )

    this.updateHealthHud()

    this.resize()

    window.addEventListener(
      'resize',
      this.resize,
    )
  }

  public start(): void {
    this.clock.start()
    this.animate()
  }

  public stop(): void {
    if (
      this.animationFrameId !== null
    ) {
      window.cancelAnimationFrame(
        this.animationFrameId,
      )

      this.animationFrameId = null
    }
  }

  private readonly resize = (): void => {
    const {
      clientWidth: width,
      clientHeight: height,
    } = this.container

    const safeHeight =
      Math.max(height, 1)

    this.renderer.setSize(
      width,
      safeHeight,
    )

    this.cameraManager.updateAspect(
      width / safeHeight,
    )
  }

  private updateHealthHud(): void {
    const hearts: string[] = []

    for (
      let index = 0;
      index < this.player.maxHealth;
      index += 1
    ) {
      if (
        index < this.player.health
      ) {
        hearts.push('❤️')
      } else {
        hearts.push('🖤')
      }
    }

    this.healthHudElement.innerHTML = `
      <div class="health-hud__label">
        LIFE
      </div>

      <div class="health-hud__hearts">
        ${hearts.join('')}
      </div>
    `

    if (this.player.isDead) {
      this.healthHudElement.classList.add(
        'is-dead',
      )
    } else {
      this.healthHudElement.classList.remove(
        'is-dead',
      )
    }
  }

  private showGameOver(): void {
    if (this.gameOverShown) {
      return
    }

    this.gameOverShown = true

    this.gameOverElement.classList.add(
      'is-visible',
    )

    console.info(
      '[Game] Game Over screen displayed.',
    )
  }

  private showStageClear(): void {
    if (
      this.stageClearShown ||
      this.gameOverShown
    ) {
      return
    }

    this.stageClearShown = true

    this.stageClearElement.classList.add(
      'is-visible',
    )

    console.info(
      '[Game] Stage 1-1 cleared.',
    )
  }

  private readonly restart = (): void => {
    console.info(
      '[Game] Restarting game.',
    )

    window.location.reload()
  }

  private readonly animate = (): void => {
    this.animationFrameId =
      window.requestAnimationFrame(
        this.animate,
      )

    const deltaTime =
      this.clock.getDelta()

    if (
      !this.gameOverShown &&
      !this.stageClearShown
    ) {
      this.player.update(
        deltaTime,
        this.inputManager.getMovementDirection(),
        this.inputManager.consumeDebugAnimation(),
      )

      if (
        this.inputManager.consumeBombPlacement()
      ) {
        this.bombSystem.placeBomb(
          this.player.gridX,
          this.player.gridY,
          this.player.bombMaxCount,
        )
      }

      this.bombSystem.update(
        deltaTime,
      )

      this.explosionSystem.update(
        deltaTime,
      )

      this.explosionSystem
        .consumeDestroyedDestructibleCells()
        .forEach(
          ({ gridX, gridY }) => {
            this.powerUpSystem.trySpawnPowerUp(
              gridX,
              gridY,
            )

            if (
              gridX === 9 &&
              gridY === 11
            ) {
              this.exitSystem.reveal()
            }
          },
        )

      this.powerUpSystem.update(
        deltaTime,
        this.player.gridX,
        this.player.gridY,
      )

      this.enemySystem.update(
        deltaTime,
        this.player.gridX,
        this.player.gridY,
      )

      this.exitSystem.update(
        deltaTime,
        this.player.gridX,
        this.player.gridY,
      )

      if (
        this.exitSystem.isCompleted()
      ) {
        this.showStageClear()
      }

      if (
        this.player.isDead
      ) {
        this.gameOverTimer +=
          deltaTime

        if (
          this.gameOverTimer >= 1.5
        ) {
          this.showGameOver()
        }
      }

      this.updateHealthHud()
    }

    this.animationDebugElement.textContent =
      `Animation: ${this.player.getCurrentAnimationName()}`

    this.renderer.render(
      this.sceneManager.scene,
      this.cameraManager.camera,
    )
  }
}