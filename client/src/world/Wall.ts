import * as THREE from 'three'

export class Wall {
  public readonly object: THREE.Group

  public constructor(cellSize: number, height = 1.25) {
    this.object = new THREE.Group()

    const inset = cellSize * 0.08
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(cellSize - inset, height, cellSize - inset),
      new THREE.MeshStandardMaterial({ color: 0x566677, roughness: 0.75 }),
    )
    wall.position.y = height / 2
    this.object.add(wall)
  }
}
