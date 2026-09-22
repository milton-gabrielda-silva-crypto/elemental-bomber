import * as THREE from 'three'

export const BombType = {
  Fire: 'FIRE',
  Water: 'WATER',
  Ice: 'ICE',
  Electricity: 'ELECTRICITY',
} as const

export type BombType =
  (typeof BombType)[keyof typeof BombType]

export class Bomb {
  public readonly object: THREE.Group
  public gridX: number
  public gridY: number
  public readonly type: BombType

  private elapsedTime = 0

  public constructor(
    gridX: number,
    gridY: number,
    type: BombType = BombType.Fire,
  ) {
    this.gridX = gridX
    this.gridY = gridY
    this.type = type
    this.object = this.createObject()
  }

  public moveTo(
    gridX: number,
    gridY: number,
    worldPosition: THREE.Vector3,
  ): void {
    this.gridX = gridX
    this.gridY = gridY
    this.object.position.copy(
      worldPosition,
    )
  }

  public update(
    deltaTime: number,
  ): void {
    this.elapsedTime +=
      deltaTime

    const pulse =
      1 +
      Math.sin(
        this.elapsedTime * 3,
      ) *
        0.06

    this.object.scale.setScalar(
      pulse,
    )

    this.object.rotation.y +=
      deltaTime * 0.6
  }

  private createObject(): THREE.Group {
    const bomb =
      new THREE.Group()

    if (
      this.type ===
      BombType.Water
    ) {
      return this.createWaterBomb(
        bomb,
      )
    }

    if (
      this.type ===
      BombType.Ice
    ) {
      return this.createIceBomb(
        bomb,
      )
    }

    if (
      this.type ===
      BombType.Electricity
    ) {
      return this.createElectricityBomb(
        bomb,
      )
    }

    return this.createFireBomb(
      bomb,
    )
  }

  private createFireBomb(
    bomb: THREE.Group,
  ): THREE.Group {
    const bodyMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x1c232d,
        roughness: 0.45,
      })

    const fuseMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x6b4327,
        roughness: 0.8,
      })

    const sparkMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xff9a2e,
        emissive: 0x7a2600,
        emissiveIntensity: 2,
      })

    const body =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.28,
          24,
          16,
        ),
        bodyMaterial,
      )

    const fuse =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.025,
          0.025,
          0.18,
          8,
        ),
        fuseMaterial,
      )

    const spark =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.06,
          12,
          8,
        ),
        sparkMaterial,
      )

    body.position.y = 0.28

    fuse.position.y = 0.63
    fuse.rotation.z = -0.25

    spark.position.set(
      0.02,
      0.72,
      0,
    )

    bomb.add(
      body,
      fuse,
      spark,
    )

    return bomb
  }

  private createWaterBomb(
    bomb: THREE.Group,
  ): THREE.Group {
    const bodyMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x0879c9,
        emissive: 0x004d99,
        emissiveIntensity: 2,
        roughness: 0.2,
        metalness: 0.05,
      })

    const waterMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x35bfff,
        emissive: 0x0077cc,
        emissiveIntensity: 2.5,
        roughness: 0.15,
        metalness: 0.05,
      })

    const glowMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xb8f3ff,
        emissive: 0x18cfff,
        emissiveIntensity: 4,
        roughness: 0.1,
      })

    const body =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.28,
          24,
          16,
        ),
        bodyMaterial,
      )

    const waterRing =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.3,
          0.035,
          8,
          24,
        ),
        waterMaterial,
      )

    const fuse =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.025,
          0.025,
          0.18,
          8,
        ),
        waterMaterial,
      )

    const spark =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.065,
          12,
          8,
        ),
        glowMaterial,
      )

    const droplet =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.07,
          12,
          8,
        ),
        glowMaterial,
      )

    body.position.y = 0.28

    waterRing.position.y = 0.28
    waterRing.rotation.x =
      Math.PI / 2

    fuse.position.y = 0.63
    fuse.rotation.z = -0.25

    spark.position.set(
      0.02,
      0.72,
      0,
    )

    droplet.position.set(
      -0.22,
      0.48,
      0,
    )

    bomb.add(
      body,
      waterRing,
      fuse,
      spark,
      droplet,
    )

    return bomb
  }

  private createIceBomb(
    bomb: THREE.Group,
  ): THREE.Group {
    const iceMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x66d9ff,
        emissive: 0x168dcc,
        emissiveIntensity: 2.5,
        roughness: 0.12,
        metalness: 0.08,
        transparent: true,
        opacity: 0.94,
      })

    const crystalMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xdffaff,
        emissive: 0x72ddff,
        emissiveIntensity: 4,
        roughness: 0.08,
        metalness: 0.05,
        transparent: true,
        opacity: 0.9,
      })

    const body =
      new THREE.Mesh(
        new THREE.IcosahedronGeometry(
          0.29,
          1,
        ),
        iceMaterial,
      )

    const innerCrystal =
      new THREE.Mesh(
        new THREE.OctahedronGeometry(
          0.16,
          1,
        ),
        crystalMaterial,
      )

    const ring =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.32,
          0.035,
          8,
          24,
        ),
        crystalMaterial,
      )

    const fuse =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.025,
          0.025,
          0.18,
          8,
        ),
        iceMaterial,
      )

    const glow =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.07,
          12,
          8,
        ),
        crystalMaterial,
      )

    const shardLeft =
      new THREE.Mesh(
        new THREE.ConeGeometry(
          0.055,
          0.2,
          6,
        ),
        iceMaterial,
      )

    const shardRight =
      new THREE.Mesh(
        new THREE.ConeGeometry(
          0.05,
          0.18,
          6,
        ),
        crystalMaterial,
      )

    body.position.y = 0.3

    innerCrystal.position.y =
      0.3

    ring.position.y = 0.3
    ring.rotation.x =
      Math.PI / 2

    fuse.position.y = 0.65
    fuse.rotation.z = -0.25

    glow.position.set(
      0.02,
      0.74,
      0,
    )

    shardLeft.position.set(
      -0.22,
      0.36,
      0,
    )

    shardLeft.rotation.z =
      -0.35

    shardRight.position.set(
      0.2,
      0.48,
      0,
    )

    shardRight.rotation.z =
      0.4

    bomb.add(
      body,
      innerCrystal,
      ring,
      fuse,
      glow,
      shardLeft,
      shardRight,
    )

    return bomb
  }

  private createElectricityBomb(
    bomb: THREE.Group,
  ): THREE.Group {
    const bodyMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x17152b,
        emissive: 0x27135c,
        emissiveIntensity: 2,
        roughness: 0.28,
        metalness: 0.2,
      })

    const electricMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x9b6cff,
        emissive: 0x6a2cff,
        emissiveIntensity: 6,
        roughness: 0.12,
        metalness: 0.15,
      })

    const glowMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xbda8ff,
        emissiveIntensity: 10,
        roughness: 0.05,
      })

    const body =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.28,
          24,
          16,
        ),
        bodyMaterial,
      )

    const electricRing =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.31,
          0.035,
          8,
          24,
        ),
        electricMaterial,
      )

    const electricRing2 =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.22,
          0.025,
          8,
          20,
        ),
        electricMaterial,
      )

    const fuse =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.025,
          0.025,
          0.18,
          8,
        ),
        electricMaterial,
      )

    const spark =
      new THREE.Mesh(
        new THREE.OctahedronGeometry(
          0.07,
          1,
        ),
        glowMaterial,
      )

    const bolt =
      new THREE.Mesh(
        new THREE.ConeGeometry(
          0.075,
          0.28,
          4,
        ),
        glowMaterial,
      )

    body.position.y = 0.28

    electricRing.position.y =
      0.28
    electricRing.rotation.x =
      Math.PI / 2

    electricRing2.position.y =
      0.28
    electricRing2.rotation.x =
      Math.PI / 2

    fuse.position.y = 0.63
    fuse.rotation.z = -0.25

    spark.position.set(
      0.02,
      0.72,
      0,
    )

    bolt.position.set(
      -0.14,
      0.42,
      0.02,
    )

    bolt.rotation.z =
      -0.5

    bomb.add(
      body,
      electricRing,
      electricRing2,
      fuse,
      spark,
      bolt,
    )

    return bomb
  }
}
