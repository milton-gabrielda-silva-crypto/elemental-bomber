export interface LevelConfig {
  id: string
  name: string

  size: number
  cellSize: number

  playerStart: {
    gridX: number
    gridY: number
  }

  exit: {
    gridX: number
    gridY: number
  }

  destructiblePositions: string[]

  enemyCount: number
}

export const STAGE_1_1: LevelConfig = {
  id: '1-1',
  name: 'Stage 1-1',

  size: 13,
  cellSize: 1,

  playerStart: {
    gridX: 1,
    gridY: 1,
  },

  exit: {
    gridX: 9,
    gridY: 11,
  },

  destructiblePositions: [
    '3,1',
    '5,1',
    '7,1',
    '9,1',

    '3,3',
    '5,3',
    '9,3',

    '1,5',
    '3,5',
    '7,5',
    '9,5',
    '11,5',

    '3,7',
    '5,7',
    '9,7',

    '1,9',
    '3,9',
    '7,9',
    '9,9',
    '11,9',

    '3,11',
    '5,11',
    '7,11',
    '9,11',
  ],

  enemyCount: 1,
}

export const STAGE_1_2: LevelConfig = {
  id: '1-2',
  name: 'Stage 1-2',

  size: 13,
  cellSize: 1,

  playerStart: {
    gridX: 1,
    gridY: 1,
  },

  exit: {
    gridX: 11,
    gridY: 9,
  },

  destructiblePositions: [
    '3,1',
    '5,1',
    '9,1',
    '11,1',

    '1,3',
    '3,3',
    '7,3',
    '9,3',

    '5,5',
    '7,5',
    '11,5',

    '1,7',
    '3,7',
    '5,7',
    '9,7',

    '3,9',
    '7,9',
    '9,9',
    '11,9',

    '1,11',
    '5,11',
    '7,11',
    '9,11',
  ],

  enemyCount: 2,
}