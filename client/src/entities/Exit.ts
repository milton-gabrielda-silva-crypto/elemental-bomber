import * as THREE from 'three'

export class Exit {
  public readonly object: THREE.Group

  private readonly portal: THREE.Mesh
  private readonly ring: THREE.Mesh
  private readonly glow: THREE.Mesh
  private elapsedTime = 0

  public constructor(cellSize: number) {
    this.object = new THREE.Group()

    const portalMaterial = new THREE.MeshStandardMaterial({
      color: 0x39ffb6,
      emissive: 0x0b8f67,
      emissiveIntensity: 2.5,
      roughness: 0.35,
      metalness: 0.15,
    })

    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0xb86b00,
      emissiveIntensity: 1.8,
      roughness: 0.4,
      metalness: 0.25,
    })

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x39ffb6,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    })

    this.portal = new THREE.Mesh(
      new THREE.CylinderGeometry(
        cellSize * 0.26,
        cellSize * 0.26,
        0.08,
        24,
      ),
      portalMaterial,
    )

    this.portal.position.y = 0.07
    this.object.add(this.portal)

    this.ring = new THREE.Mesh(
      new THREE.TorusGeometry(
        cellSize * 0.31,
        cellSize * 0.055,
        10,
        32,
      ),
      ringMaterial,
    )

    this.ring.rotation.x = Math.PI / 2
    this.ring.position.y = 0.11
    this.object.add(this.ring)

    this.glow = new THREE.Mesh(
      new THREE.CircleGeometry(cellSize * 0.42, 32),
      glowMaterial,
    )

    this.glow.rotation.x = -Math.PI / 2
    this.glow.position.y = 0.035
    this.object.add(this.glow)

    this.object.visible = false
  }

  public show(): void {
    this.object.visible = true
  }

  public hide(): void {
    this.object.visible = false
  }

  public update(deltaTime: number): void {
    if (!this.object.visible) {
      return
    }

    this.elapsedTime += deltaTime

    const pulse = 1 + Math.sin(this.elapsedTime * 4) * 0.08

    this.portal.scale.setScalar(pulse)
    this.ring.rotation.z += deltaTime * 1.5

    const glowScale =
      1 + Math.sin(this.elapsedTime * 3) * 0.12

    this.glow.scale.setScalar(glowScale)
  }
}