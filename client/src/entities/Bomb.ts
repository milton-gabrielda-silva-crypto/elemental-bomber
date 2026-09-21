import * as THREE from 'three'

export class Bomb {
  public readonly object: THREE.Group
  public readonly gridX: number
  public readonly gridY: number

  private elapsedTime = 0

  public constructor(gridX: number, gridY: number) {
    this.gridX = gridX
    this.gridY = gridY
    this.object = this.createObject()
  }

  public update(deltaTime: number): void {
    this.elapsedTime += deltaTime

    const pulse = 1 + Math.sin(this.elapsedTime * 3) * 0.06
    this.object.scale.setScalar(pulse)
    this.object.rotation.y += deltaTime * 0.6
  }

  private createObject(): THREE.Group {
    const bomb = new THREE.Group()
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x1c232d, roughness: 0.45 })
    const fuseMaterial = new THREE.MeshStandardMaterial({ color: 0x6b4327, roughness: 0.8 })
    const sparkMaterial = new THREE.MeshStandardMaterial({ color: 0xff9a2e, emissive: 0x7a2600 })

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 16), bodyMaterial)
    const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.18, 8), fuseMaterial)
    const spark = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), sparkMaterial)

    body.position.y = 0.28
    fuse.position.y = 0.63
    fuse.rotation.z = -0.25
    spark.position.set(0.02, 0.72, 0)
    bomb.add(body, fuse, spark)

    return bomb
  }
}
