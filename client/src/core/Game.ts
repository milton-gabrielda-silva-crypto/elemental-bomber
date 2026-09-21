import * as THREE from 'three'
import { CameraManager } from './CameraManager'
import { SceneManager } from './SceneManager'
import { Player } from '../entities/Player'
import { InputManager } from '../systems/InputManager'
import { Arena } from '../world/Arena'

export class Game {
  private readonly renderer: THREE.WebGLRenderer
  private readonly sceneManager: SceneManager
  private readonly cameraManager: CameraManager
  private readonly container: HTMLElement
  private readonly arena: Arena
  private readonly player: Player
  private readonly inputManager: InputManager
  private readonly clock = new THREE.Clock()
  private readonly animationDebugElement: HTMLDivElement
  private animationFrameId: number | null = null

  public constructor(container: HTMLElement) {
    this.container = container
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.container.appendChild(this.renderer.domElement)
    this.animationDebugElement = document.createElement('div')
    this.animationDebugElement.className = 'animation-debug'
    this.container.appendChild(this.animationDebugElement)

    this.sceneManager = new SceneManager()
    this.cameraManager = new CameraManager(1)
    this.arena = new Arena()
    this.player = new Player(this.arena, 1, 1)
    this.inputManager = new InputManager()
    this.arena.object.add(this.player.object)
    this.sceneManager.scene.add(this.arena.object)

    this.resize()
    window.addEventListener('resize', this.resize)
  }

  public start(): void {
    this.clock.start()
    this.animate()
  }

  public stop(): void {
    if (this.animationFrameId !== null) {
      window.cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  private readonly resize = (): void => {
    const { clientWidth: width, clientHeight: height } = this.container
    const safeHeight = Math.max(height, 1)

    this.renderer.setSize(width, safeHeight)
    this.cameraManager.updateAspect(width / safeHeight)
  }

  private readonly animate = (): void => {
    this.animationFrameId = window.requestAnimationFrame(this.animate)
    this.player.update(
      this.clock.getDelta(),
      this.inputManager.getMovementDirection(),
      this.inputManager.consumeDebugAnimation(),
    )
    this.animationDebugElement.textContent = `Animation: ${this.player.getCurrentAnimationName()}`
    this.renderer.render(this.sceneManager.scene, this.cameraManager.camera)
  }
}
