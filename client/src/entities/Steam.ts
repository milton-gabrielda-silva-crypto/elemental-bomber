import * as THREE from 'three'

export class Steam {
  public readonly object: THREE.Group

  private readonly puffs: THREE.Mesh[] = []
  private readonly materials: THREE.MeshStandardMaterial[] = []

  private readonly baseY = 0.08

  public constructor(
    gridX: number,
    gridY: number,
    cellSize: number,
  ) {
    this.object = new THREE.Group()

    this.object.name =
      `Steam_${gridX}_${gridY}`

    const puffGeometry =
      new THREE.SphereGeometry(
        cellSize * 0.20,
        12,
        10,
      )

    const puffData = [
      {
        x: -0.20,
        y: 0.05,
        z: 0.02,
        scale: 0.9,
      },
      {
        x: 0.18,
        y: 0.08,
        z: 0.02,
        scale: 0.8,
      },
      {
        x: 0.00,
        y: 0.20,
        z: 0.02,
        scale: 1.0,
      },
      {
        x: -0.08,
        y: 0.34,
        z: 0.02,
        scale: 0.75,
      },
      {
        x: 0.10,
        y: 0.46,
        z: 0.02,
        scale: 0.55,
      },
    ]

    puffData.forEach(
      ({
        x,
        y,
        z,
        scale,
      }) => {
        const material =
          new THREE.MeshStandardMaterial({
            color: 0xeaf9ff,
            emissive: 0x8fdcff,
            emissiveIntensity: 1.4,
            roughness: 0.25,
            metalness: 0,
            transparent: true,
            opacity: 0.72,
            depthWrite: false,
          })

        const puff =
          new THREE.Mesh(
            puffGeometry,
            material,
          )

        puff.position.set(
          x * cellSize,
          this.baseY +
            y * cellSize,
          z * cellSize,
        )

        puff.scale.setScalar(scale)

        this.puffs.push(puff)
        this.materials.push(material)

        this.object.add(puff)
      },
    )

    this.object.scale.setScalar(0.65)
  }

  public update(
    lifeProgress: number,
  ): void {
    const progress =
      THREE.MathUtils.clamp(
        lifeProgress,
        0,
        1,
      )

    const growth =
      THREE.MathUtils.lerp(
        0.65,
        1.15,
        progress,
      )

    this.object.scale.setScalar(
      growth,
    )

    this.object.position.y =
      THREE.MathUtils.lerp(
        0,
        0.25,
        progress,
      )

    this.object.rotation.y +=
      0.008

    this.puffs.forEach(
      (puff, index) => {
        const offset =
          index * 0.12

        const wave =
          Math.sin(
            progress * Math.PI * 2 +
              offset,
          ) * 0.04

        puff.position.x +=
          wave * 0.01

        puff.position.y +=
          0.0025

        const puffScale =
          THREE.MathUtils.lerp(
            0.85,
            1.15,
            progress,
          )

        puff.scale.setScalar(
          puffScale,
        )
      },
    )

    const opacity =
      THREE.MathUtils.lerp(
        0.72,
        0,
        progress,
      )

    this.materials.forEach(
      (material) => {
        material.opacity =
          opacity
      },
    )
  }

  public dispose(): void {
    this.puffs.forEach(
      (puff) => {
        puff.geometry.dispose()
      },
    )

    this.materials.forEach(
      (material) => {
        material.dispose()
      },
    )
  }
}