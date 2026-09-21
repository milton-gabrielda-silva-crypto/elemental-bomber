import * as THREE from 'three'

export class Block {
  public readonly object: THREE.Group

  public constructor(cellSize: number, height = 1.1) {
    this.object = new THREE.Group()

    const inset = cellSize * 0.14
    const block = new THREE.Mesh(
      new THREE.BoxGeometry(cellSize - inset, height, cellSize - inset),
      new THREE.MeshStandardMaterial({ color: 0x9b6a3a, roughness: 0.9 }),
    )
    block.position.y = height / 2
    this.object.add(block)
  }
}
