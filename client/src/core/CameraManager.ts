import * as THREE from 'three'

export class CameraManager {
  public readonly camera: THREE.OrthographicCamera
  private readonly minimumViewHeight = 15
  private readonly minimumViewWidth = 20.5

  public constructor(aspect: number) {
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)

    const elevation = THREE.MathUtils.degToRad(60)
    const distance = 22
    const horizontalDistance = distance * Math.cos(elevation)
    const verticalDistance = distance * Math.sin(elevation)

    this.camera.position.set(0, verticalDistance, horizontalDistance)
    this.camera.lookAt(0, 0, 0)

    this.updateAspect(aspect)
  }

  public updateAspect(aspect: number): void {
    const viewHeight = Math.max(this.minimumViewHeight, this.minimumViewWidth / aspect)
    const halfHeight = viewHeight / 2
    const halfWidth = (viewHeight * aspect) / 2

    this.camera.left = -halfWidth
    this.camera.right = halfWidth
    this.camera.top = halfHeight
    this.camera.bottom = -halfHeight
    this.camera.updateProjectionMatrix()
  }
}
