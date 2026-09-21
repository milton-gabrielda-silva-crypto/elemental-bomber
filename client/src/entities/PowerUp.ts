import * as THREE from 'three'

export const PowerUpType = {
  Fire: 'FIRE',
  Bomb: 'BOMB',
  Speed: 'SPEED',
} as const

export type PowerUpType = (typeof PowerUpType)[keyof typeof PowerUpType]

export class PowerUp {
  public readonly object: THREE.Group
  public readonly gridX: number
  public readonly gridY: number
  public readonly type: PowerUpType

  private elapsedTime = 0

  public constructor(gridX: number, gridY: number, type: PowerUpType) {
    this.gridX = gridX
    this.gridY = gridY
    this.type = type
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
    if (this.type === PowerUpType.Bomb) {
      return this.createBombObject(powerUp)
    }
    if (this.type === PowerUpType.Speed) {
      return this.createSpeedObject(powerUp)
    }

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

  private createBombObject(powerUp: THREE.Group): THREE.Group {
    const bombMaterial = new THREE.MeshStandardMaterial({
      color: 0x26313c,
      emissive: 0x163b55,
      emissiveIntensity: 1.8,
      roughness: 0.3,
    })
    const fuseMaterial = new THREE.MeshStandardMaterial({
      color: 0xffa32b,
      emissive: 0xff5a00,
      emissiveIntensity: 2.5,
      roughness: 0.25,
    })

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 14), bombMaterial)
    const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 8), fuseMaterial)
    const spark = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), fuseMaterial)
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.03, 8, 24), fuseMaterial)

    body.position.y = 0.3
    fuse.position.y = 0.58
    fuse.rotation.z = -0.25
    spark.position.set(0.02, 0.68, 0)
    halo.position.y = 0.3
    halo.rotation.x = Math.PI / 2
    powerUp.add(body, fuse, spark, halo)

    return powerUp
  }

  private createSpeedObject(powerUp: THREE.Group): THREE.Group {
    const speedMaterial = new THREE.MeshStandardMaterial({
      color: 0x45e6c3,
      emissive: 0x00a88a,
      emissiveIntensity: 2.5,
      roughness: 0.25,
    })
    const glowMaterial = new THREE.MeshStandardMaterial({
      color: 0xd2fff4,
      emissive: 0x32e6bf,
      emissiveIntensity: 3,
      roughness: 0.2,
    })

    const leftArrow = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.34, 4), speedMaterial)
    const rightArrow = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.34, 4), speedMaterial)
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.03, 8, 24), glowMaterial)

    leftArrow.position.set(-0.12, 0.3, 0)
    rightArrow.position.set(0.12, 0.3, 0)
    leftArrow.rotation.x = Math.PI / 2
    rightArrow.rotation.x = Math.PI / 2
    halo.position.y = 0.28
    halo.rotation.x = Math.PI / 2
    powerUp.add(leftArrow, rightArrow, halo)

    return powerUp
  }
}
