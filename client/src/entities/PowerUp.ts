import * as THREE from 'three'

export const PowerUpType = {
  Fire: 'FIRE',
  Bomb: 'BOMB',
  Speed: 'SPEED',
  Water: 'WATER',
  Wind: 'WIND',
  Ice: 'ICE',
  Electricity: 'ELECTRICITY',
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
    this.object = this.createObject()
  }

  public update(
    deltaTime: number,
  ): void {
    this.elapsedTime += deltaTime

    const bob =
      Math.sin(
        this.elapsedTime * 3,
      ) * 0.08

    const pulse =
      1 +
      Math.sin(
        this.elapsedTime * 4,
      ) * 0.08

    this.object.position.y =
      0.18 + bob

    this.object.scale.setScalar(
      pulse,
    )

    this.object.rotation.y +=
      deltaTime * 0.8
  }

  private createObject(): THREE.Group {
    const powerUp =
      new THREE.Group()

    switch (this.type) {
      case PowerUpType.Fire:
        return this.createFire(
          powerUp,
        )

      case PowerUpType.Bomb:
        return this.createBomb(
          powerUp,
        )

      case PowerUpType.Speed:
        return this.createSpeed(
          powerUp,
        )

      case PowerUpType.Water:
        return this.createWater(
          powerUp,
        )

      case PowerUpType.Wind:
        return this.createWind(
          powerUp,
        )

      case PowerUpType.Ice:
        return this.createIce(
          powerUp,
        )

      case PowerUpType.Electricity:
        return this.createElectricity(
          powerUp,
        )
    }
  }

  private createFire(
    powerUp: THREE.Group,
  ): THREE.Group {
    const material =
      new THREE.MeshStandardMaterial({
        color: 0xff5a00,
        emissive: 0xff2200,
        emissiveIntensity: 3,
        roughness: 0.3,
      })

    const innerMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xffd84a,
        emissive: 0xff7a00,
        emissiveIntensity: 4,
        roughness: 0.2,
      })

    const body =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.18,
          16,
          12,
        ),
        material,
      )

    const flame =
      new THREE.Mesh(
        new THREE.ConeGeometry(
          0.12,
          0.3,
          8,
        ),
        innerMaterial,
      )

    body.position.y = 0.18
    flame.position.y = 0.42

    powerUp.add(
      body,
      flame,
    )

    return powerUp
  }

  private createBomb(
    powerUp: THREE.Group,
  ): THREE.Group {
    const bodyMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x222831,
        roughness: 0.35,
      })

    const fuseMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xff9a2e,
        emissive: 0xff4500,
        emissiveIntensity: 3,
      })

    const body =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.22,
          20,
          14,
        ),
        bodyMaterial,
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

    body.position.y = 0.22
    fuse.position.y = 0.52

    powerUp.add(
      body,
      fuse,
    )

    return powerUp
  }

  private createSpeed(
    powerUp: THREE.Group,
  ): THREE.Group {
    const material =
      new THREE.MeshStandardMaterial({
        color: 0x55ff77,
        emissive: 0x11aa44,
        emissiveIntensity: 3,
        roughness: 0.25,
      })

    const arrow =
      new THREE.Mesh(
        new THREE.ConeGeometry(
          0.16,
          0.42,
          4,
        ),
        material,
      )

    arrow.rotation.z =
      -Math.PI / 2

    arrow.position.y = 0.25

    powerUp.add(
      arrow,
    )

    return powerUp
  }

  private createWater(
    powerUp: THREE.Group,
  ): THREE.Group {
    const material =
      new THREE.MeshStandardMaterial({
        color: 0x25bfff,
        emissive: 0x008cff,
        emissiveIntensity: 4,
        roughness: 0.15,
        metalness: 0.1,
      })

    const ring =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.2,
          0.045,
          8,
          24,
        ),
        material,
      )

    const drop =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.12,
          16,
          10,
        ),
        material,
      )

    ring.rotation.x =
      Math.PI / 2

    ring.position.y = 0.2
    drop.position.y = 0.35

    powerUp.add(
      ring,
      drop,
    )

    return powerUp
  }

  private createWind(
    powerUp: THREE.Group,
  ): THREE.Group {
    const material =
      new THREE.MeshStandardMaterial({
        color: 0x8de8ff,
        emissive: 0x29c9ff,
        emissiveIntensity: 3,
        transparent: true,
        opacity: 0.8,
        roughness: 0.1,
      })

    const ring =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.22,
          0.035,
          8,
          24,
        ),
        material,
      )

    const ring2 =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.15,
          0.025,
          8,
          24,
        ),
        material,
      )

    ring.rotation.x =
      Math.PI / 2

    ring2.rotation.x =
      Math.PI / 2

    ring.position.y = 0.22
    ring2.position.y = 0.22

    powerUp.add(
      ring,
      ring2,
    )

    return powerUp
  }

  private createIce(
    powerUp: THREE.Group,
  ): THREE.Group {
    const iceMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x66d9ff,
        emissive: 0x168dcc,
        emissiveIntensity: 3,
        roughness: 0.1,
        metalness: 0.05,
        transparent: true,
        opacity: 0.9,
      })

    const crystal =
      new THREE.Mesh(
        new THREE.OctahedronGeometry(
          0.22,
          1,
        ),
        iceMaterial,
      )

    const ring =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.25,
          0.03,
          8,
          24,
        ),
        iceMaterial,
      )

    crystal.position.y = 0.28

    ring.position.y = 0.25
    ring.rotation.x =
      Math.PI / 2

    powerUp.add(
      crystal,
      ring,
    )

    return powerUp
  }

  private createElectricity(
    powerUp: THREE.Group,
  ): THREE.Group {
    const electricMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x9c7cff,
        emissive: 0x6a2cff,
        emissiveIntensity: 5,
        roughness: 0.12,
        metalness: 0.15,
      })

    const coreMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xbda8ff,
        emissiveIntensity: 8,
        roughness: 0.05,
      })

    const core =
      new THREE.Mesh(
        new THREE.OctahedronGeometry(
          0.16,
          1,
        ),
        coreMaterial,
      )

    const ring =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.27,
          0.035,
          8,
          24,
        ),
        electricMaterial,
      )

    const ring2 =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.18,
          0.025,
          8,
          20,
        ),
        electricMaterial,
      )

    const bolt =
      new THREE.Mesh(
        new THREE.ConeGeometry(
          0.08,
          0.3,
          4,
        ),
        coreMaterial,
      )

    core.position.y = 0.27

    ring.position.y = 0.27
    ring.rotation.x =
      Math.PI / 2

    ring2.position.y = 0.27
    ring2.rotation.x =
      Math.PI / 2

    bolt.position.set(
      0.16,
      0.42,
      0,
    )

    bolt.rotation.z =
      -0.45

    powerUp.add(
      core,
      ring,
      ring2,
      bolt,
    )

    return powerUp
  }
}
