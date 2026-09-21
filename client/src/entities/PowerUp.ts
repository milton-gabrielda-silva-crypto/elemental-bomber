import * as THREE from 'three'

export const PowerUpType = {
  Fire: 'FIRE',
} as const

export type PowerUpType = (typeof PowerUpType)[keyof typeof PowerUpType]

export class PowerUp {
  public readonly object: THREE.Group
  public readonly gridX: number
  public readonly gridY: number
  public readonly type: PowerUpType = PowerUpType.Fire

  private elapsedTime = 0

  public constructor(gridX: number, gridY: number) {
    this.gridX = gridX
    this.gridY = gridY
    this.object = this.createObject()
  }

  public update(deltaTime: number): void {
    this.elapsedTime += deltaTime
    this.object.position.y = Math.sin(this.elapsedTime * 3) * 0.06
    this.object.rotation.y += deltaTime * 0.8

    const pulse = 1 + Math.sin(this.elapsedTime * 4) * 0.08
    this.object.scale.setScalar(pulse)
  }

  private createObject(): THREE.Group {
    const powerUp = new THREE.Group()
    const fireMaterial = new THREE.MeshStandardMaterial({
      color: 0xff8a1f,
      emissive: 0xb83200,
      emissiveIntensity: 2,
      roughness: 0.35,
    })
    const glowMaterial = new THREE.MeshStandardMaterial({
      color: 0xffe066,
      emissive: 0xff7a00,
      emissiveIntensity: 2.5,
      roughness: 0.25,
    })

    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.4, 8), fireMaterial)
    const ember = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), glowMaterial)
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.035, 8, 24), glowMaterial)

    flame.position.y = 0.42
    ember.position.y = 0.62
    halo.position.y = 0.28
    halo.rotation.x = Math.PI / 2
    powerUp.add(flame, ember, halo)

    return powerUp
  }
}
