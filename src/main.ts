import Phaser from 'phaser'
import { Boot } from './scenes/Boot'
import { Home } from './scenes/Home'
import { Game } from './scenes/Game'
import { Pause } from './scenes/Pause'
import { GameOver } from './scenes/GameOver'
import { Win } from './scenes/Win'
import { WORLD } from './config/physics'

new Phaser.Game({
  type: Phaser.AUTO,
  width:  WORLD.WIDTH,
  height: WORLD.HEIGHT,
  backgroundColor: '#5c94fc',   // sky blue — Rural biome

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },  // all gravity applied per-body in Hero.ts
      debug: import.meta.env.DEV,
    },
  },

  scale: {
    mode:       Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  scene: [Boot, Home, Game, Pause, GameOver, Win],
})
