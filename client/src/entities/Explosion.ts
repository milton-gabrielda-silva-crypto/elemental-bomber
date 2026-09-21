import * as THREE from 'three'

export type ExplosionSegment = 'center' | 'horizontal' | 'vertical'

export class Explosion {
  public readonly object: THREE.Group
  public readonly gridX: number
  public readonly gridY: number

  private readonly materials: THREE.MeshStandardMaterial[]

  public constructor(gridX: number, gridY: number, segment: ExplosionSegment) {
    this.gridX = gridX
    this.gridY = gridY
    this.materials = []
    this.object = this.createObject(segment)
  }

  public update(lifeProgress: number): void {
    const remainingVisibility = 1 - lifeProgress
    const pulse = 0.85 + Math.sin(lifeProgress * Math.PI) * 0.25

    this.object.scale.setScalar(pulse)
    this.materials.forEach((material) => {
      material.opacity = remainingVisibility
    })
  }

  private createObject(segment: ExplosionSegment): THREE.Group {
    const explosion = new THREE.Group()
    const isCenter = segment === 'center'
    const radius = isCenter ? 0.34 : 0.24
    const flameHeight = isCenter ? 0.68 : 0.48
    const coreMaterial = this.createMaterial(0xff7a1a, 0x9c2500)
    const flameMaterial = this.createMaterial(0xffe066, 0xa64600)
    const core = new THREE.Mesh(new THREE.SphereGeometry(radius, 20, 14), coreMaterial)
    const flame = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.68, flameHeight, 8), flameMaterial)

    core.position.y = radius
    flame.position.y = radius * 2 + flameHeight * 0.35

    if (segment === 'horizontal') {
      flame.rotation.z = Math.PI / 2
    } else if (segment === 'vertical') {
      flame.rotation.x = Math.PI / 2
    }

    explosion.add(core, flame)
    return explosion
  }

  private createMaterial(color: number, emissive: number): THREE.MeshStandardMaterial {
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive,
      transparent: true,
      opacity: 1,
      depthWrite: false,
    })
    this.materials.push(material)
    return material
  }
}
