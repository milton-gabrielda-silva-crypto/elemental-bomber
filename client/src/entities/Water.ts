import * as THREE from 'three'

export class Water {
  public readonly object: THREE.Group
  public readonly gridX: number
  public readonly gridY: number

  private elapsedTime = 0

  public constructor(
    gridX: number,
    gridY: number,
    cellSize: number,
  ) {
    this.gridX = gridX
    this.gridY = gridY
    this.object = this.createObject(
      cellSize,
    )
  }

  public update(
    deltaTime: number,
  ): void {
    this.elapsedTime += deltaTime

    const wave =
      Math.sin(
        this.elapsedTime * 4,
      ) * 0.025

    this.object.position.y =
      0.025 + wave

    this.object.rotation.y =
      Math.sin(
        this.elapsedTime * 1.5,
      ) * 0.04

    const scale =
      1 +
      Math.sin(
        this.elapsedTime * 5,
      ) *
        0.025

    this.object.scale.set(
      scale,
      1,
      scale,
    )
  }

  private createObject(
    cellSize: number,
  ): THREE.Group {
    const water =
      new THREE.Group()

    const waterMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x159fe8,
        emissive: 0x0066aa,
        emissiveIntensity: 1.8,
        roughness: 0.12,
        metalness: 0.08,
        transparent: true,
        opacity: 0.82,
      })

    const highlightMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x9eeeff,
        emissive: 0x28cfff,
        emissiveIntensity: 2.5,
        roughness: 0.08,
        transparent: true,
        opacity: 0.9,
      })

    const padding =
      cellSize * 0.08

    const size =
      cellSize - padding * 2

    const surface =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          size,
          0.08,
          size,
        ),
        waterMaterial,
      )

    surface.position.y = 0.05

    const waveA =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          size * 0.25,
          0.018,
          6,
          24,
        ),
        highlightMaterial,
      )

    waveA.rotation.x =
      Math.PI / 2

    waveA.position.y = 0.1

    const waveB =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          size * 0.15,
          0.012,
          6,
          20,
        ),
        highlightMaterial,
      )

    waveB.rotation.x =
      Math.PI / 2

    waveB.position.y = 0.105

    water.add(
      surface,
      waveA,
      waveB,
    )

    return water
  }
}