import './style.css'
import { Game } from './core/Game'

const app = document.querySelector<HTMLDivElement>('#app')

if (app === null) {
  throw new Error('Game root element was not found.')
}

const game = new Game(app)
game.start()
