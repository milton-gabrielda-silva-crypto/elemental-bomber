import * as THREE from 'three'
import type { MovementDirection } from '../systems/InputManager'

export class Wind {
  public readonly object: THREE.Group

  private readonly ribbons: THREE.Mesh[] = []
  private readonly particles: THREE.Mesh[] = []
  private readonly materials: THREE.MeshStandardMaterial[] = []
  private readonly direction: THREE.Vector3
  private readonly origin = new THREE.Vector3()
  private readonly baseHeight: number
  private readonly length: number

  public constructor(
    origin: THREE.Vector3,
    direction: MovementDirection,
    cellSize: number,
    distance: number,
  ) {
    this.object = new THREE.Group()
    this.object.name = 'WindGust'
    this.origin.copy(origin)
    this.baseHeight = cellSize * 0.62
    this.length = Math.max(distance, 1) * cellSize
    this.direction = this.getDirectionVector(direction)

    this.object.position.copy(this.origin)

    const windMaterial = new THREE.MeshStandardMaterial({
      color: 0xe9fbff,
      emissive: 0x32d9ff,
      emissiveIntensity: 5,
      roughness: 0.12,
      metalness: 0,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    })

    const glowMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x9befff,
      emissiveIntensity: 7,
      roughness: 0.05,
      metalness: 0,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    })

    const ribbonGeometry = new THREE.CapsuleGeometry(
      cellSize * 0.055,
      cellSize * 0.34,
      4,
      8,
    )

    const particleGeometry = new THREE.SphereGeometry(
      cellSize * 0.065,
      10,
      8,
    )

    const ribbonOffsets = [
      { side: -0.22, height: 0.02, scale: 1.0 },
      { side: 0.00, height: 0.12, scale: 0.82 },
      { side: 0.22, height: -0.02, scale: 0.68 },
    ]

    ribbonOffsets.forEach(({ side, height, scale }, index) => {
      const mesh = new THREE.Mesh(
        ribbonGeometry,
        index === 1 ? glowMaterial : windMaterial,
      )

      mesh.position.set(
        this.direction.x * cellSize * (0.25 + index * 0.18) +
          this.getSideVector().x * cellSize * side,
        this.baseHeight + height * cellSize,
        this.direction.z * cellSize * (0.25 + index * 0.18) +
          this.getSideVector().z * cellSize * side,
      )

      mesh.scale.set(
        scale,
        scale,
        0.75 + index * 0.15,
      )

      this.orientAlongDirection(mesh)
      this.ribbons.push(mesh)
      this.object.add(mesh)
    })

    for (let index = 0; index < 10; index += 1) {
      const progress = index / 9
      const sideWave = Math.sin(progress * Math.PI * 2.5) * cellSize * 0.24
      const verticalWave = Math.cos(progress * Math.PI * 3) * cellSize * 0.12
      const particle = new THREE.Mesh(
        particleGeometry,
        index % 3 === 0 ? glowMaterial : windMaterial,
      )

      particle.position.set(
        this.direction.x * this.length * progress +
          this.getSideVector().x * sideWave,
        this.baseHeight + verticalWave,
        this.direction.z * this.length * progress +
          this.getSideVector().z * sideWave,
      )

      const scale = 0.55 + (1 - progress) * 0.45
      particle.scale.setScalar(scale)
      this.particles.push(particle)
      this.object.add(particle)
    }

    this.materials.push(windMaterial, glowMaterial)
  }

  public update(lifeProgress: number): void {
    const progress = THREE.MathUtils.clamp(lifeProgress, 0, 1)
    const fade = 1 - progress
    const pulse = 1 + Math.sin(progress * Math.PI * 8) * 0.08

    this.object.position.y = THREE.MathUtils.lerp(0, 0.18, progress)
    this.object.scale.setScalar(
      THREE.MathUtils.lerp(0.82, 1.08, progress) * pulse,
    )

    this.ribbons.forEach((ribbon, index) => {
      ribbon.rotation.y += 0.025 + index * 0.006
      ribbon.scale.x = THREE.MathUtils.lerp(0.85, 1.25, progress)
      ribbon.scale.y = THREE.MathUtils.lerp(0.85, 1.15, progress)
    })

    this.particles.forEach((particle, index) => {
      const drift = progress * this.length * 0.16
      particle.position.addScaledVector(this.direction, drift * 0.002)
      particle.rotation.y += 0.04 + index * 0.003
      const pulseScale =
        (0.55 + (1 - progress) * 0.45) *
        (1 + Math.sin(progress * Math.PI * 6 + index) * 0.12)
      particle.scale.setScalar(pulseScale)
    })

    this.materials.forEach((material) => {
      material.opacity = fade * (material === this.materials[1] ? 0.9 : 0.68)
    })
  }

  public dispose(): void {
    const geometries = new Set<THREE.BufferGeometry>()

    this.ribbons.forEach((mesh) => geometries.add(mesh.geometry))
    this.particles.forEach((mesh) => geometries.add(mesh.geometry))

    geometries.forEach((geometry) => geometry.dispose())
    this.materials.forEach((material) => material.dispose())
  }

  private getDirectionVector(direction: MovementDirection): THREE.Vector3 {
    switch (direction) {
      case 'up':
        return new THREE.Vector3(0, 0, -1)
      case 'down':
        return new THREE.Vector3(0, 0, 1)
      case 'left':
        return new THREE.Vector3(-1, 0, 0)
      case 'right':
        return new THREE.Vector3(1, 0, 0)
    }
  }

  private getSideVector(): THREE.Vector3 {
    return new THREE.Vector3(-this.direction.z, 0, this.direction.x)
  }

  private orientAlongDirection(mesh: THREE.Mesh): void {
    const axis = new THREE.Vector3(0, 0, 1)
    const quaternion = new THREE.Quaternion()
    quaternion.setFromUnitVectors(axis, this.direction.clone().normalize())
    mesh.quaternion.copy(quaternion)
  }
}
