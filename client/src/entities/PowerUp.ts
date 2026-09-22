import * as THREE from 'three'

export const PowerUpType = {
  Fire: 'FIRE',
  Bomb: 'BOMB',
  Speed: 'SPEED',
  Water: 'WATER',
  Wind: 'WIND',
  Ice: 'ICE',
} as const

export type PowerUpType =
  (typeof PowerUpType)[keyof typeof PowerUpType]

export class PowerUp {
  public readonly object: THREE.Group

  public readonly gridX: number

  public readonly gridY: number

  public readonly type: PowerUpType

  private elapsedTime = 0

  public constructor(
    gridX: number,
    gridY: number,
    type: PowerUpType,
  ) {
    this.gridX = gridX
    this.gridY = gridY
    this.type = type
    this.object =
      this.createObject()
  }

  public update(
    deltaTime: number,
  ): void {
    this.elapsedTime +=
      deltaTime

    this.object.position.y =
      Math.sin(
        this.elapsedTime * 3,
      ) * 0.06

    this.object.rotation.y +=
      deltaTime * 0.8

    const pulse =
      1 +
      Math.sin(
        this.elapsedTime * 4,
      ) *
        0.08

    this.object.scale.setScalar(
      pulse,
    )
  }

  private createObject():
    THREE.Group {
    const powerUp =
      new THREE.Group()

    if (
      this.type ===
      PowerUpType.Bomb
    ) {
      return this.createBombObject(
        powerUp,
      )
    }

    if (
      this.type ===
      PowerUpType.Speed
    ) {
      return this.createSpeedObject(
        powerUp,
      )
    }

    if (
      this.type ===
      PowerUpType.Water
    ) {
      return this.createWaterObject(
        powerUp,
      )
    }

    if (
      this.type ===
      PowerUpType.Wind
    ) {
      return this.createWindObject(
        powerUp,
      )
    }

    if (
      this.type ===
      PowerUpType.Ice
    ) {
      return this.createIceObject(
        powerUp,
      )
    }

    return this.createFireObject(
      powerUp,
    )
  }

  private createFireObject(
    powerUp: THREE.Group,
  ): THREE.Group {
    const fireMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xff8a1f,
        emissive: 0xb83200,
        emissiveIntensity: 2,
        roughness: 0.35,
      })

    const glowMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xffe066,
        emissive: 0xff7a00,
        emissiveIntensity: 2.5,
        roughness: 0.25,
      })

    const flame =
      new THREE.Mesh(
        new THREE.ConeGeometry(
          0.17,
          0.4,
          8,
        ),
        fireMaterial,
      )

    const ember =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.11,
          16,
          12,
        ),
        glowMaterial,
      )

    const halo =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.25,
          0.035,
          8,
          24,
        ),
        glowMaterial,
      )

    flame.position.y =
      0.42

    ember.position.y =
      0.62

    halo.position.y =
      0.28

    halo.rotation.x =
      Math.PI / 2

    powerUp.add(
      flame,
      ember,
      halo,
    )

    return powerUp
  }

  private createBombObject(
    powerUp: THREE.Group,
  ): THREE.Group {
    const bombMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x26313c,
        emissive: 0x163b55,
        emissiveIntensity: 1.8,
        roughness: 0.3,
      })

    const fuseMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xffa32b,
        emissive: 0xff5a00,
        emissiveIntensity: 2.5,
        roughness: 0.25,
      })

    const body =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.22,
          20,
          14,
        ),
        bombMaterial,
      )

    const fuse =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.025,
          0.025,
          0.16,
          8,
        ),
        fuseMaterial,
      )

    const spark =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.055,
          12,
          8,
        ),
        fuseMaterial,
      )

    const halo =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.29,
          0.03,
          8,
          24,
        ),
        fuseMaterial,
      )

    body.position.y =
      0.3

    fuse.position.y =
      0.58

    fuse.rotation.z =
      -0.25

    spark.position.set(
      0.02,
      0.68,
      0,
    )

    halo.position.y =
      0.3

    halo.rotation.x =
      Math.PI / 2

    powerUp.add(
      body,
      fuse,
      spark,
      halo,
    )

    return powerUp
  }

  private createSpeedObject(
    powerUp: THREE.Group,
  ): THREE.Group {
    const speedMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x45e6c3,
        emissive: 0x00a88a,
        emissiveIntensity: 2.5,
        roughness: 0.25,
      })

    const glowMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xd2fff4,
        emissive: 0x32e6bf,
        emissiveIntensity: 3,
        roughness: 0.2,
      })

    const leftArrow =
      new THREE.Mesh(
        new THREE.ConeGeometry(
          0.1,
          0.34,
          4,
        ),
        speedMaterial,
      )

    const rightArrow =
      new THREE.Mesh(
        new THREE.ConeGeometry(
          0.1,
          0.34,
          4,
        ),
        speedMaterial,
      )

    const halo =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.29,
          0.03,
          8,
          24,
        ),
        glowMaterial,
      )

    leftArrow.position.set(
      -0.12,
      0.3,
      0,
    )

    rightArrow.position.set(
      0.12,
      0.3,
      0,
    )

    leftArrow.rotation.x =
      Math.PI / 2

    rightArrow.rotation.x =
      Math.PI / 2

    halo.position.y =
      0.28

    halo.rotation.x =
      Math.PI / 2

    powerUp.add(
      leftArrow,
      rightArrow,
      halo,
    )

    return powerUp
  }

  private createWaterObject(
    powerUp: THREE.Group,
  ): THREE.Group {
    const waterMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x35bfff,
        emissive: 0x0077cc,
        emissiveIntensity: 2.5,
        roughness: 0.18,
        metalness: 0.05,
      })

    const glowMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xb8f3ff,
        emissive: 0x18cfff,
        emissiveIntensity: 3.5,
        roughness: 0.12,
      })

    const darkWaterMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x0879c9,
        emissive: 0x004d99,
        emissiveIntensity: 2,
        roughness: 0.2,
      })

    const drop =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.2,
          20,
          16,
        ),
        waterMaterial,
      )

    drop.scale.set(
      0.82,
      1.25,
      0.82,
    )

    drop.position.y =
      0.38

    const tip =
      new THREE.Mesh(
        new THREE.ConeGeometry(
          0.13,
          0.28,
          12,
        ),
        waterMaterial,
      )

    tip.position.y =
      0.68

    const core =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.085,
          16,
          12,
        ),
        glowMaterial,
      )

    core.position.y =
      0.42

    const halo =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.29,
          0.03,
          8,
          24,
        ),
        glowMaterial,
      )

    halo.position.y =
      0.27

    halo.rotation.x =
      Math.PI / 2

    const leftDrop =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.055,
          12,
          8,
        ),
        darkWaterMaterial,
      )

    const rightDrop =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.045,
          12,
          8,
        ),
        glowMaterial,
      )

    leftDrop.position.set(
      -0.22,
      0.38,
      0,
    )

    rightDrop.position.set(
      0.22,
      0.5,
      0,
    )

    powerUp.add(
      drop,
      tip,
      core,
      halo,
      leftDrop,
      rightDrop,
    )

    return powerUp
  }

  private createWindObject(
    powerUp: THREE.Group,
  ): THREE.Group {
    const windMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x9fe8ff,
        emissive: 0x38bfff,
        emissiveIntensity: 3,
        roughness: 0.18,
        transparent: true,
        opacity: 0.9,
      })

    const glowMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xeaffff,
        emissive: 0x8cecff,
        emissiveIntensity: 4,
        roughness: 0.12,
        transparent: true,
        opacity: 0.85,
      })

    const ring =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.29,
          0.035,
          8,
          24,
        ),
        glowMaterial,
      )

    ring.position.y =
      0.28

    ring.rotation.x =
      Math.PI / 2

    const gust =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.17,
          0.045,
          8,
          20,
          Math.PI * 1.45,
        ),
        windMaterial,
      )

    gust.position.y =
      0.43

    gust.rotation.x =
      Math.PI / 2

    gust.rotation.z =
      -0.35

    const gustTop =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.11,
          0.035,
          8,
          20,
          Math.PI * 1.3,
        ),
        glowMaterial,
      )

    gustTop.position.set(
      0.08,
      0.62,
      0,
    )

    gustTop.rotation.x =
      Math.PI / 2

    gustTop.rotation.z =
      0.25

    const core =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.08,
          16,
          12,
        ),
        glowMaterial,
      )

    core.position.y =
      0.4

    powerUp.add(
      ring,
      gust,
      gustTop,
      core,
    )

    return powerUp
  }

  private createIceObject(
    powerUp: THREE.Group,
  ): THREE.Group {
    const iceMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x7ddfff,
        emissive: 0x159bd0,
        emissiveIntensity: 2.8,
        roughness: 0.12,
        metalness: 0.08,
        transparent: true,
        opacity: 0.92,
      })

    const glowMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xe8fbff,
        emissive: 0x7ddfff,
        emissiveIntensity: 4,
        roughness: 0.08,
        metalness: 0,
        transparent: true,
        opacity: 0.88,
      })

    const crystal =
      new THREE.Mesh(
        new THREE.OctahedronGeometry(
          0.25,
          1,
        ),
        iceMaterial,
      )

    crystal.position.y =
      0.43

    crystal.scale.set(
      0.78,
      1.25,
      0.78,
    )

    const crystalCore =
      new THREE.Mesh(
        new THREE.OctahedronGeometry(
          0.11,
          1,
        ),
        glowMaterial,
      )

    crystalCore.position.set(
      0,
      0.43,
      0,
    )

    const halo =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.29,
          0.03,
          8,
          24,
        ),
        glowMaterial,
      )

    halo.position.y =
      0.28

    halo.rotation.x =
      Math.PI / 2

    const shardLeft =
      new THREE.Mesh(
        new THREE.ConeGeometry(
          0.055,
          0.22,
          6,
        ),
        iceMaterial,
      )

    shardLeft.position.set(
      -0.21,
      0.42,
      0,
    )

    shardLeft.rotation.z =
      -0.35

    const shardRight =
      new THREE.Mesh(
        new THREE.ConeGeometry(
          0.05,
          0.18,
          6,
        ),
        glowMaterial,
      )

    shardRight.position.set(
      0.2,
      0.52,
      0,
    )

    shardRight.rotation.z =
      0.4

    powerUp.add(
      crystal,
      crystalCore,
      halo,
      shardLeft,
      shardRight,
    )

    return powerUp
  }
}
