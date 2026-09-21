import * as THREE from 'three'
import { Block } from './Block'
import { Wall } from './Wall'

export const CellType = {
  Wall: 'WALL',
  Floor: 'FLOOR',
  Destructible: 'DESTRUCTIBLE',
} as const

export type CellType = (typeof CellType)[keyof typeof CellType]

interface GridCell {
  type: CellType
  block?: Block
  objects: Set<THREE.Object3D>
}

export class Arena {
  public readonly object: THREE.Group
  public readonly size: number
  public readonly cellSize: number
  private readonly grid: GridCell[][]
  private readonly destructiblePositions = new Set<string>([
    '3,1', '5,1', '7,1', '9,1',
    '3,3', '5,3', '9,3',
    '1,5', '3,5', '7,5', '9,5', '11,5',
    '3,7', '5,7', '9,7',
    '1,9', '3,9', '7,9', '9,9', '11,9',
    '3,11', '5,11', '7,11', '9,11',
  ])

  public constructor(size = 13, cellSize = 1) {
    this.object = new THREE.Group()
    this.size = size
    this.cellSize = cellSize
    this.grid = this.createGrid()

    this.createFloorAndGrid()
    this.createLayout()
  }

  public getCellType(column: number, row: number): CellType | null {
    return this.getCell(column, row)?.type ?? null
  }

  public isWalkable(column: number, row: number): boolean {
    const cell = this.getCell(column, row)
    return cell?.type === CellType.Floor && cell.objects.size === 0
  }

  public gridToWorld(column: number, row: number): THREE.Vector3 {
    const arenaSize = this.size * this.cellSize
    return new THREE.Vector3(
      -arenaSize / 2 + this.cellSize / 2 + column * this.cellSize,
      0,
      -arenaSize / 2 + this.cellSize / 2 + row * this.cellSize,
    )
  }

  public destroyDestructibleBlock(column: number, row: number): boolean {
    const cell = this.getCell(column, row)

    if (cell?.type !== CellType.Destructible || cell.block === undefined) {
      return false
    }

    cell.block.object.removeFromParent()
    cell.block = undefined
    cell.type = CellType.Floor
    return true
  }

  public addObjectToCell(column: number, row: number, object: THREE.Object3D): boolean {
    const cell = this.getCell(column, row)

    if (cell?.type !== CellType.Floor) {
      return false
    }

    object.position.copy(this.gridToWorld(column, row))
    this.object.add(object)
    cell.objects.add(object)
    return true
  }

  public removeObjectFromCell(column: number, row: number, object: THREE.Object3D): boolean {
    const cell = this.getCell(column, row)

    if (cell === undefined || !cell.objects.delete(object)) {
      return false
    }

    object.removeFromParent()
    return true
  }

  private createGrid(): GridCell[][] {
    return Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => ({
        type: CellType.Floor,
        objects: new Set<THREE.Object3D>(),
      })),
    )
  }

  private createFloorAndGrid(): void {
    const arenaSize = this.size * this.cellSize
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(arenaSize, arenaSize),
      new THREE.MeshStandardMaterial({ color: 0x28323d, roughness: 0.9 }),
    )
    floor.rotation.x = -Math.PI / 2
    this.object.add(floor)

    const grid = new THREE.GridHelper(arenaSize, this.size, 0x8fa3b5, 0x50606e)
    grid.position.y = 0.01
    this.object.add(grid)
  }

  private createLayout(): void {
    for (let row = 0; row < this.size; row += 1) {
      for (let column = 0; column < this.size; column += 1) {
        if (this.isWallPosition(column, row)) {
          this.grid[row][column].type = CellType.Wall
          this.addWall(column, row)
        } else if (this.destructiblePositions.has(this.positionKey(column, row))) {
          this.grid[row][column].type = CellType.Destructible
          this.addBlock(column, row)
        }
      }
    }
  }

  private isWallPosition(column: number, row: number): boolean {
    const isPerimeter = row === 0 || row === this.size - 1 || column === 0 || column === this.size - 1
    const isInteriorPillar = row % 2 === 0 && column % 2 === 0
    return isPerimeter || isInteriorPillar
  }

  private addWall(column: number, row: number): void {
    const wall = new Wall(this.cellSize)
    wall.object.position.copy(this.gridToWorld(column, row))
    this.object.add(wall.object)
  }

  private addBlock(column: number, row: number): void {
    const block = new Block(this.cellSize)
    block.object.position.copy(this.gridToWorld(column, row))
    this.grid[row][column].block = block
    this.object.add(block.object)
  }

  private getCell(column: number, row: number): GridCell | undefined {
    if (column < 0 || column >= this.size || row < 0 || row >= this.size) {
      return undefined
    }

    return this.grid[row][column]
  }

  private positionKey(column: number, row: number): string {
    return `${column},${row}`
  }
}
