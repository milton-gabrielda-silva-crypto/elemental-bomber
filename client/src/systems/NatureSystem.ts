import * as THREE from 'three'
import { Nature } from '../entities/Nature'
import { Arena, CellType } from '../world/Arena'

interface NatureSeed {
  gridX: number
  gridY: number
  object: THREE.Group
}

interface ActiveNature {
  nature: Nature
  burning: boolean
  burnTimer: number
}

export class NatureSystem {
  private readonly seeds =
    new Map<string, NatureSeed>()

  private readonly vegetation =
    new Map<string, ActiveNature>()

  private readonly arena: Arena

  private readonly burnDuration = 0.45

  public constructor(
    arena: Arena,
    playerStartGridX: number,
    playerStartGridY: number,
  ) {
    this.arena = arena

    this.createSeeds(
      playerStartGridX,
      playerStartGridY,
    )
  }

  public isNatureAt(
    gridX: number,
    gridY: number,
  ): boolean {
    const key =
      this.getCellKey(
        gridX,
        gridY,
      )

    return (
      this.seeds.has(key) ||
      this.vegetation.has(key)
    )
  }

  public growAt(
    gridX: number,
    gridY: number,
  ): boolean {
    const key =
      this.getCellKey(
        gridX,
        gridY,
      )

    const seed =
      this.seeds.get(key)

    if (seed === undefined) {
      return false
    }

    if (
      this.vegetation.has(key)
    ) {
      return false
    }

    /*
     * Remove the small seed.
     */
    seed.object.removeFromParent()

    /*
     * Create the grown vegetation.
     */
    const nature =
      new Nature(
        this.arena.cellSize,
      )

    /*
     * Register the vegetation in the Arena.
     *
     * This makes the cell non-walkable.
     */
    const added =
      this.arena.addObjectToCell(
        gridX,
        gridY,
        nature.object,
      )

    if (!added) {
      /*
       * If the cell cannot accept the vegetation,
       * restore the seed.
       */
      seed.object.position.copy(
        this.arena.gridToWorld(
          gridX,
          gridY,
        ),
      )

      this.arena.object.add(
        seed.object,
      )

      return false
    }

    this.seeds.delete(key)

    this.vegetation.set(
      key,
      {
        nature,
        burning: false,
        burnTimer: 0,
      },
    )

    /*
     * Start the growth animation.
     */
    nature.update(0)

    console.info(
      `[NatureSystem] Water activated seed at (${gridX}, ${gridY}).`,
    )

    console.info(
      `[NatureSystem] Nature grew at (${gridX}, ${gridY}).`,
    )

    return true
  }

  public isVegetationAt(
    gridX: number,
    gridY: number,
  ): boolean {
    return this.vegetation.has(
      this.getCellKey(
        gridX,
        gridY,
      ),
    )
  }

  public removeNatureAt(
    gridX: number,
    gridY: number,
  ): boolean {
    const key =
      this.getCellKey(
        gridX,
        gridY,
      )

    const activeNature =
      this.vegetation.get(key)

    if (
      activeNature === undefined
    ) {
      return false
    }

    this.arena.removeObjectFromCell(
      gridX,
      gridY,
      activeNature.nature.object,
    )

    this.vegetation.delete(key)

    console.info(
      `[NatureSystem] Nature removed at (${gridX}, ${gridY}).`,
    )

    return true
  }

  public burnAt(
    gridX: number,
    gridY: number,
  ): boolean {
    const key =
      this.getCellKey(
        gridX,
        gridY,
      )

    const activeNature =
      this.vegetation.get(key)

    if (
      activeNature === undefined
    ) {
      return false
    }

    /*
     * Prevent the same vegetation from
     * starting multiple burn animations.
     */
    if (activeNature.burning) {
      return false
    }

    activeNature.burning = true
    activeNature.burnTimer = 0

    console.info(
      `[NatureSystem] Nature started burning at (${gridX}, ${gridY}).`,
    )

    return true
  }

  public update(
    deltaTime: number,
  ): void {
    /*
     * Small idle animation for the seeds.
     *
     * Seeds are visual only and do not block
     * player movement.
     */
    const time =
      performance.now() * 0.001

    for (
      const seed of
        this.seeds.values()
    ) {
      seed.object.rotation.y =
        Math.sin(
          time +
            seed.gridX * 0.7 +
            seed.gridY * 0.45,
        ) * 0.08
    }

    /*
     * Update grown vegetation.
     */
    for (
      const [
        key,
        activeNature,
      ] of this.vegetation
    ) {
      if (
        !activeNature.burning
      ) {
        /*
         * Permanent vegetation.
         *
         * The growth animation is already
         * complete, so keep it at full size.
         */
        activeNature.nature.update(1)

        continue
      }

      /*
       * Burning vegetation remains inside
       * the Arena during this entire animation.
       */
      activeNature.burnTimer +=
        deltaTime

      const burnProgress =
        THREE.MathUtils.clamp(
          activeNature.burnTimer /
            this.burnDuration,
          0,
          1,
        )

      activeNature.nature.burn(
        burnProgress,
      )

      /*
       * Once the burn animation is finished,
       * remove the vegetation and free the cell.
       */
      if (
        activeNature.burnTimer >=
        this.burnDuration
      ) {
        const position =
          this.parseCellKey(key)

        this.removeNatureAt(
          position.gridX,
          position.gridY,
        )
      }
    }
  }

  private createSeeds(
    playerStartGridX: number,
    playerStartGridY: number,
  ): void {
    const candidates: Array<{
      gridX: number
      gridY: number
    }> = []

    for (
      let row = 1;
      row <
      this.arena.size - 1;
      row += 1
    ) {
      for (
        let column = 1;
        column <
        this.arena.size - 1;
        column += 1
      ) {
        /*
         * Never place a seed on the
         * player's starting position.
         */
        if (
          column ===
            playerStartGridX &&
          row ===
            playerStartGridY
        ) {
          continue
        }

        /*
         * Only normal floor cells can
         * contain nature seeds.
         */
        if (
          this.arena.getCellType(
            column,
            row,
          ) !== CellType.Floor
        ) {
          continue
        }

        candidates.push({
          gridX: column,
          gridY: row,
        })
      }
    }

    /*
     * Randomize the available floor cells.
     */
    const shuffled =
      [...candidates].sort(
        () =>
          Math.random() -
          0.5,
      )

    /*
     * Exactly six seeds whenever the
     * level contains at least six
     * available floor cells.
     */
    const seedCount =
      Math.min(
        6,
        shuffled.length,
      )

    for (
      let index = 0;
      index < seedCount;
      index += 1
    ) {
      const position =
        shuffled[index]

      const seedObject =
        this.createSeedObject()

      seedObject.position.copy(
        this.arena.gridToWorld(
          position.gridX,
          position.gridY,
        ),
      )

      /*
       * Seeds are added directly to the
       * arena instead of Arena.addObjectToCell().
       *
       * Therefore they do NOT block movement.
       */
      this.arena.object.add(
        seedObject,
      )

      const key =
        this.getCellKey(
          position.gridX,
          position.gridY,
        )

      this.seeds.set(
        key,
        {
          gridX:
            position.gridX,
          gridY:
            position.gridY,
          object:
            seedObject,
        },
      )

      console.info(
        `[NatureSystem] Seed created at (${position.gridX}, ${position.gridY}).`,
      )
    }

    console.info(
      `[NatureSystem] Created ${seedCount} nature seeds.`,
    )
  }

  private createSeedObject(): THREE.Group {
    const group =
      new THREE.Group()

    /*
     * Small patch of soil.
     */
    const soil =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          this.arena.cellSize * 0.16,
          this.arena.cellSize * 0.18,
          this.arena.cellSize * 0.025,
          12,
        ),
        new THREE.MeshStandardMaterial({
          color: 0x4b3525,
          roughness: 1,
        }),
      )

    soil.position.y =
      this.arena.cellSize * 0.015

    group.add(
      soil,
    )

    /*
     * Small stem.
     */
    const stem =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          this.arena.cellSize * 0.018,
          this.arena.cellSize * 0.024,
          this.arena.cellSize * 0.18,
          7,
        ),
        new THREE.MeshStandardMaterial({
          color: 0x568f3f,
          roughness: 0.8,
        }),
      )

    stem.position.y =
      this.arena.cellSize * 0.11

    group.add(
      stem,
    )

    /*
     * Left leaf.
     */
    const leafGeometry =
      new THREE.SphereGeometry(
        this.arena.cellSize * 0.065,
        8,
        6,
      )

    const leafMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x88c95a,
        roughness: 0.7,
      })

    const leftLeaf =
      new THREE.Mesh(
        leafGeometry,
        leafMaterial,
      )

    leftLeaf.scale.set(
      1.35,
      0.45,
      0.7,
    )

    leftLeaf.position.set(
      -this.arena.cellSize * 0.055,
      this.arena.cellSize * 0.16,
      0,
    )

    leftLeaf.rotation.z =
      -0.45

    group.add(
      leftLeaf,
    )

    /*
     * Right leaf.
     */
    const rightLeaf =
      new THREE.Mesh(
        leafGeometry,
        leafMaterial,
      )

    rightLeaf.scale.set(
      1.35,
      0.45,
      0.7,
    )

    rightLeaf.position.set(
      this.arena.cellSize * 0.055,
      this.arena.cellSize * 0.19,
      0,
    )

    rightLeaf.rotation.z =
      0.45

    group.add(
      rightLeaf,
    )

    /*
     * Small bright center.
     */
    const core =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          this.arena.cellSize * 0.028,
          8,
          6,
        ),
        new THREE.MeshStandardMaterial({
          color: 0xb9ee69,
          emissive: 0x4c7d24,
          emissiveIntensity: 0.65,
          roughness: 0.5,
        }),
      )

    core.position.y =
      this.arena.cellSize * 0.105

    group.add(
      core,
    )

    return group
  }

  private getCellKey(
    gridX: number,
    gridY: number,
  ): string {
    return `${gridX}:${gridY}`
  }

  private parseCellKey(
    key: string,
  ): {
    gridX: number
    gridY: number
  } {
    const [
      gridX,
      gridY,
    ] = key.split(':').map(
      Number,
    )

    return {
      gridX,
      gridY,
    }
  }
}
