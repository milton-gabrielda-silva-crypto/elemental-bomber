import * as THREE from 'three'

export class Electricity {
  public readonly object: THREE.Group

  private elapsedTime = 0

  public constructor(
    gridX: number,
    gridY: number,
    worldPosition: THREE.Vector3,
  ) {
    this.object =
      this.createObject()

    this.object.position.copy(
      worldPosition,
    )

    this.object.userData.gridX =
      gridX

    this.object.userData.gridY =
      gridY
  }

  public update(
    deltaTime: number,
    lifeProgress: number,
  ): void {
    this.elapsedTime +=
      deltaTime

    const pulse =
      1 +
      Math.sin(
        this.elapsedTime * 14,
      ) *
        0.12

    this.object.scale.setScalar(
      pulse,
    )

    this.object.rotation.y +=
      deltaTime * 2

    const fadeStart = 0.75

    if (
      lifeProgress > fadeStart
    ) {
      const fade =
        1 -
        (
          lifeProgress -
          fadeStart
        ) /
          (1 - fadeStart)

      this.object.traverse(
        (child) => {
          const mesh =
            child as THREE.Mesh

          if (
            mesh.material ===
              undefined
          ) {
            return
          }

          const materials =
            Array.isArray(
              mesh.material,
            )
              ? mesh.material
              : [mesh.material]

          materials.forEach(
            (material) => {
              if (
                'opacity' in
                material
              ) {
                material.opacity =
                  fade
              }
            },
          )
        },
      )
    }
  }

  private createObject(): THREE.Group {
    const group =
      new THREE.Group()

    const electricMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x8b5cff,
        emissive: 0x5c20ff,
        emissiveIntensity: 8,
        roughness: 0.08,
        metalness: 0.1,
        transparent: true,
        opacity: 0.95,
      })

    const coreMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xbda8ff,
        emissiveIntensity: 12,
        roughness: 0.03,
        transparent: true,
        opacity: 1,
      })

    const ring =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.36,
          0.035,
          8,
          24,
        ),
        electricMaterial,
      )

    const ring2 =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.24,
          0.025,
          8,
          20,
        ),
        electricMaterial,
      )

    const core =
      new THREE.Mesh(
        new THREE.OctahedronGeometry(
          0.12,
          1,
        ),
        coreMaterial,
      )

    ring.rotation.x =
      Math.PI / 2

    ring2.rotation.x =
      Math.PI / 2

    ring.position.y =
      0.035

    ring2.position.y =
      0.05

    core.position.y =
      0.08

    group.add(
      ring,
      ring2,
      core,
    )

    const boltMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x7c42ff,
        emissiveIntensity: 12,
        roughness: 0.02,
        transparent: true,
        opacity: 0.95,
      })

    const boltGeometry =
      new THREE.BufferGeometry()

    const vertices = new Float32Array([
      -0.30, 0.08, 0.00,
      -0.08, 0.20, 0.02,
      -0.02, 0.06, 0.00,
      0.18, 0.16, 0.01,
      0.30, 0.05, 0.00,
    ])

    boltGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        vertices,
        3,
      ),
    )

    const bolt =
      new THREE.Line(
        boltGeometry,
        boltMaterial,
      )

    group.add(
      bolt,
    )

    return group
  }
}
