import * as THREE from 'three'

export class Ice {
  public readonly object: THREE.Group

  private readonly mainMaterial: THREE.MeshStandardMaterial
  private readonly crystalMaterial: THREE.MeshStandardMaterial

  public constructor() {
    this.object = new THREE.Group()

    this.mainMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x78dfff,
        emissive: 0x147ca8,
        emissiveIntensity: 2.2,
        roughness: 0.16,
        metalness: 0.08,
        transparent: true,
        opacity: 0.92,
      })

    this.crystalMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xdffaff,
        emissive: 0x58dfff,
        emissiveIntensity: 3.5,
        roughness: 0.08,
        metalness: 0.04,
        transparent: true,
        opacity: 0.88,
      })

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.78, 0.78),
      this.mainMaterial,
    )
    body.position.y = 0.39
    body.rotation.y = Math.PI / 4

    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.31, 1),
      this.crystalMaterial,
    )
    crystal.position.y = 0.48
    crystal.scale.set(0.75, 1.25, 0.75)

    const shardLeft = new THREE.Mesh(
      new THREE.ConeGeometry(0.09, 0.34, 6),
      this.crystalMaterial,
    )
    shardLeft.position.set(-0.27, 0.46, 0.02)
    shardLeft.rotation.z = -0.35

    const shardRight = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.28, 6),
      this.mainMaterial,
    )
    shardRight.position.set(0.26, 0.43, -0.02)
    shardRight.rotation.z = 0.4

    const glowRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.36, 0.025, 8, 24),
      this.crystalMaterial,
    )
    glowRing.position.y = 0.03
    glowRing.rotation.x = Math.PI / 2

    this.object.add(
      body,
      crystal,
      shardLeft,
      shardRight,
      glowRing,
    )
  }

  public update(lifeProgress: number): void {
    const pulse =
      1 + Math.sin(lifeProgress * Math.PI * 8) * 0.025
    this.object.scale.setScalar(pulse)

    if (lifeProgress >= 0.82) {
      const fadeProgress =
        (lifeProgress - 0.82) / 0.18

      this.mainMaterial.opacity =
        Math.max(0.92 * (1 - fadeProgress), 0)
      this.crystalMaterial.opacity =
        Math.max(0.88 * (1 - fadeProgress), 0)
    }
  }
}
