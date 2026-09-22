import * as THREE from 'three'

export class Nature {
  public readonly object: THREE.Group

  private readonly cellSize: number

  private readonly stem: THREE.Mesh
  private readonly leftLeaf: THREE.Mesh
  private readonly rightLeaf: THREE.Mesh
  private readonly centerLeaf: THREE.Mesh

  private readonly stemMaterial: THREE.MeshStandardMaterial
  private readonly leafMaterial: THREE.MeshStandardMaterial
  private readonly brightLeafMaterial: THREE.MeshStandardMaterial

  private readonly originalStemColor: THREE.Color
  private readonly originalLeafColor: THREE.Color
  private readonly originalBrightLeafColor: THREE.Color

  private readonly burnColor =
    new THREE.Color(
      0.08,
      0.025,
      0.005,
    )

  public constructor(
    cellSize: number,
  ) {
    this.cellSize = cellSize

    this.object = new THREE.Group()

    this.stemMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x4f8f3a,
        roughness: 0.8,
      })

    this.leafMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x78b84f,
        roughness: 0.75,
      })

    this.brightLeafMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xa8d85b,
        roughness: 0.7,
      })

    this.originalStemColor =
      this.stemMaterial.color.clone()

    this.originalLeafColor =
      this.leafMaterial.color.clone()

    this.originalBrightLeafColor =
      this.brightLeafMaterial.color.clone()

    this.stem =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          this.cellSize * 0.035,
          this.cellSize * 0.055,
          this.cellSize * 0.42,
          8,
        ),
        this.stemMaterial,
      )

    this.stem.position.y =
      this.cellSize * 0.21

    this.object.add(
      this.stem,
    )

    this.leftLeaf =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          this.cellSize * 0.13,
          8,
          6,
        ),
        this.leafMaterial,
      )

    this.leftLeaf.scale.set(
      1.35,
      0.55,
      0.8,
    )

    this.leftLeaf.position.set(
      -this.cellSize * 0.11,
      this.cellSize * 0.34,
      0,
    )

    this.leftLeaf.rotation.z =
      -0.35

    this.object.add(
      this.leftLeaf,
    )

    this.rightLeaf =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          this.cellSize * 0.13,
          8,
          6,
        ),
        this.leafMaterial,
      )

    this.rightLeaf.scale.set(
      1.35,
      0.55,
      0.8,
    )

    this.rightLeaf.position.set(
      this.cellSize * 0.11,
      this.cellSize * 0.42,
      0,
    )

    this.rightLeaf.rotation.z =
      0.35

    this.object.add(
      this.rightLeaf,
    )

    this.centerLeaf =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          this.cellSize * 0.14,
          8,
          6,
        ),
        this.brightLeafMaterial,
      )

    this.centerLeaf.scale.set(
      0.75,
      1.4,
      0.8,
    )

    this.centerLeaf.position.y =
      this.cellSize * 0.48

    this.object.add(
      this.centerLeaf,
    )

    this.object.scale.setScalar(
      0.05,
    )
  }

  public update(
    growthProgress: number,
  ): void {
    const clampedProgress =
      THREE.MathUtils.clamp(
        growthProgress,
        0,
        1,
      )

    const easedProgress =
      1 -
      Math.pow(
        1 - clampedProgress,
        3,
      )

    this.object.scale.setScalar(
      Math.max(
        easedProgress,
        0.05,
      ),
    )

    const sway =
      Math.sin(
        growthProgress *
          Math.PI *
          2,
      ) *
      0.04

    this.leftLeaf.rotation.z =
      -0.35 + sway

    this.rightLeaf.rotation.z =
      0.35 - sway

    this.object.rotation.z = 0
  }

  public burn(
    burnProgress: number,
  ): void {
    const progress =
      THREE.MathUtils.clamp(
        burnProgress,
        0,
        1,
      )

    /*
     * Keep the color calculation based on
     * the original colors instead of repeatedly
     * interpolating an already-darkened material.
     */
    this.stemMaterial.color
      .copy(this.originalStemColor)
      .lerp(
        this.burnColor,
        progress,
      )

    this.leafMaterial.color
      .copy(this.originalLeafColor)
      .lerp(
        this.burnColor,
        progress,
      )

    this.brightLeafMaterial.color
      .copy(
        this.originalBrightLeafColor,
      )
      .lerp(
        this.burnColor,
        progress,
      )

    /*
     * The vegetation collapses as it burns.
     */
    const remainingScale =
      Math.max(
        0.12,
        1 -
          progress * 0.88,
      )

    this.object.scale.setScalar(
      remainingScale,
    )

    /*
     * The plant shakes more strongly near
     * the beginning of the burn.
     */
    const shake =
      Math.sin(
        progress * Math.PI * 12,
      ) *
      0.07 *
      (1 - progress)

    this.object.rotation.z =
      shake

    /*
     * Slight vertical collapse.
     */
    this.object.position.y =
      -this.cellSize *
      0.02 *
      progress
  }

  public resetAfterBurn(): void {
    this.stemMaterial.color.copy(
      this.originalStemColor,
    )

    this.leafMaterial.color.copy(
      this.originalLeafColor,
    )

    this.brightLeafMaterial.color.copy(
      this.originalBrightLeafColor,
    )

    this.object.scale.setScalar(
      1,
    )

    this.object.rotation.z = 0
    this.object.position.y = 0
  }
}
