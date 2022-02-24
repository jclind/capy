import g from './globals.mjs'
import PlatformClass from './platform.mjs'
import PlayerClass from './player.mjs'
import EnemyClass from './enemy.mjs'
import ScoreClass from './score.mjs'
import LifeTrackerClass from './lifeTracker.mjs'
import BoundaryClass from './boundary.mjs'
import { generatePlatformRow } from './platforms.mjs'
import { randArrayItem, randIntBetween, roundedRectangle } from './utils.mjs'
import { playSound, playMusic, pauseMusic } from './audio.mjs'

// How many frames should the game run for? (for development)
let frameLimit = null

const enableMusic = true

const keyMap = {
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  KeyW: 'up',
  ArrowUp: 'up',
  Space: 'up',
  KeyS: 'down',
}
const pressedKeys = {
  left: false,
  right: false,
  up: false,
  down: false,
}

let player, boots, score, lifeTracker, floor, ceiling
let platforms = []
let enemies = []
let walls = []
let timeSinceLastPlatform = 0
let gameLoaded = false
let gameStarted = false
const startingLives = 3
const startButtonHeight = 75

const sprites = {
  capybaraRight: {
    path: './sprites/capybara-right.png',
    frames: 2,
  },
  capybaraLeft: {
    path: './sprites/capybara-left.png',
    frames: 2,
  },
  capybaraRightDamaged: {
    path: './sprites/capybara-right-damaged.png',
    frames: 2,
  },
  capybaraLeftDamaged: {
    path: './sprites/capybara-left-damaged.png',
    frames: 2,
  },
  platformMiddle: {
    path: './sprites/platform.png',
  },
  platformLeft: {
    path: './sprites/platform-left.png',
  },
  platformRight: {
    path: './sprites/platform-right.png',
  },
  platformBoth: {
    path: './sprites/platform-both.png',
  },
  bootsSolo: {
    path: './sprites/boots-solo.png',
  },
  bootsWornLeft: {
    path: './sprites/boots-worn-left.png',
  },
  bootsWornRight: {
    path: './sprites/boots-worn-right.png',
  },
  snekLeft: {
    path: './sprites/snek-left.png',
    frames: 2,
  },
  snekRight: {
    path: './sprites/snek-right.png',
    frames: 2,
  },
  heartFull: {
    path: './sprites/heart-full.png',
  },
  heartEmpty: {
    path: './sprites/heart-empty.png',
  },
}

main()

// Initialize the game before starting the render loop
async function main() {
  await loadSpriteImages()

  player = initPlayer()

  // Start with a 4-tile platform under the player in the middle of the screen
  platforms.push(
    new PlatformClass({
      x:
        Math.floor((canvas.width / 2 - g.tileWidth * 2) / g.tileWidth) *
        g.tileWidth,
      y: canvas.height + g.tileHeight,
      width: g.tileWidth * 4,
      sprites: {
        left: sprites.platformLeft,
        middle: sprites.platformMiddle,
        right: sprites.platformRight,
        both: sprites.platformBoth,
      },
      scroll: true,
    })
  )

  walls = generateWalls()
  floor = generateFloor()
  ceiling = generateCeiling()

  score = initScore()

  lifeTracker = initLifeTracker()

  requestAnimationFrame(startScreen)
}

function startScreen() {
  drawGame()

  const text = 'Start Game'
  const textWidth = g.ctx.measureText(text).width

  const xPadding = 20
  const buttonWidth = textWidth + xPadding * 2
  const buttonX = g.canvasWidth / 2 - textWidth / 2 - xPadding
  const buttonY = g.canvasHeight / 2 - startButtonHeight / 2
  g.ctx.fillStyle = 'white'
  roundedRectangle(
    g.ctx,
    buttonX + 5,
    buttonY + 5,
    buttonWidth,
    startButtonHeight,
    8,
    true,
    false
  )
  g.ctx.fillStyle = '#00a206'
  roundedRectangle(
    g.ctx,
    buttonX,
    buttonY,
    buttonWidth,
    startButtonHeight,
    8,
    true,
    false
  )

  g.ctx.font = '32px monospace'
  g.ctx.textAlign = 'center'
  g.ctx.textBaseline = 'middle'
  g.ctx.fillStyle = 'white'
  g.ctx.fillText(text, g.canvasWidth / 2, g.canvasHeight / 2)

  const instructionText = 'Press W, A, D or\n← ↑ → to move'
  const instructionTextX = g.canvasWidth / 2
  const instructionTextY = g.canvasHeight / 2 + startButtonHeight + 15
  const lineHeight = 40
  const instructionTextLines = instructionText.split('\n')

  // Add line wrapping to instructionText
  for (var i = 0; i < instructionTextLines.length; i++) {
    g.ctx.fillText(
      instructionTextLines[i],
      instructionTextX,
      instructionTextY + i * lineHeight
    )
  }

  gameLoaded = true
}

// Runs for every frame
function gameLoop() {
  let nextLoop = gameLoop

  generateTiles()

  player.update(pressedKeys)

  let newEnemies = []
  for (const enemy of enemies) {
    enemy.update()

    // Player enemy collision
    let collision = getCollision(player, enemy)
    if (collision) {
      if (collision.direction === 'down') {
        // The player jumped on top of the enemy, so delete the enemy
        playSound('enemyKilled')
        score.value += 10000
        continue
      } else {
        damagePlayer()
        player.enemyCollision(collision)
      }
    }

    if (enemy.y + g.tileHeight >= 0) {
      // The enemy hasn't yet fallen off the top of the screen, so keep it
      newEnemies.push(enemy)
    }
  }
  enemies = newEnemies

  // Check for ceiling/floor collisions
  const collision = getCollision(player, ceiling) || getCollision(player, floor)
  if (collision) {
    damagePlayer()
    player.outOfBoundsCollision(collision)
  }

  // Copy the platforms to a new array, excluding any that have risen out of the
  // top of the screen
  let newPlatforms = []
  for (const platform of platforms) {
    platform.update()
    if (platform.y + g.tileHeight >= 0) {
      // The platform hasn't yet fallen off the top of the screen, so keep it
      newPlatforms.push(platform)
    }

    let collision = getCollision(player, platform)
    if (collision) {
      player.hardCollision(collision)
    }

    for (const enemy of enemies) {
      // Platform collision
      collision = getCollision(enemy, platform)
      if (collision) {
        enemy.collide(collision)
      }
    }
  }
  platforms = newPlatforms

  for (const wall of walls) {
    let collision = getCollision(player, wall)
    if (collision) {
      player.hardCollision(collision)
    }
  }

  score.incrementTimePoints()

  if (boots && getCollision(player, boots)) {
    player.wearing.boots = true
    boots = null
  }

  drawGame()

  if (lifeTracker.lives <= 0) {
    nextLoop = gameOver
  }

  if (frameLimit === null || frameLimit-- > 0) {
    requestAnimationFrame(nextLoop)
  }
}

function gameOver() {
  pauseMusic()
  playSound('gameOver')

  g.ctx.font = '48px monospace'
  g.ctx.textAlign = 'center'
  g.ctx.textBaseline = 'middle'

  // Draw the text shadow
  g.ctx.fillStyle = 'black'
  g.ctx.fillText('Game over', g.canvasWidth / 2, g.canvasHeight / 2 + 3)

  // Draw the text
  g.ctx.fillStyle = 'yellow'
  g.ctx.fillText('Game over', g.canvasWidth / 2, g.canvasHeight / 2)
}

function startGame() {
  gameStarted = true

  if (enableMusic) {
    playMusic()
  }

  requestAnimationFrame(gameLoop)
}

function generateEnemy(platforms) {
  if (!platforms || !platforms.length) {
    return
  }
  const platform = randArrayItem(platforms)
  const platformXTiles = platform.width / g.tileWidth
  const enemyTile = randIntBetween(0, platformXTiles)

  return new EnemyClass({
    x: platform.x + enemyTile * g.tileWidth,
    y: platform.y - g.tileHeight,
    sprites: {
      left: sprites.snekLeft,
      right: sprites.snekRight,
    },
    platform,
  })
}

function drawGame() {
  drawBackground()

  if (boots) {
    boots.draw()
  }

  for (const platform of platforms) {
    platform.draw()
  }

  for (const enemy of enemies) {
    enemy.draw()
  }

  for (const wall of walls) {
    wall.draw()
  }
  ceiling.draw()
  floor.draw()

  player.draw()

  score.draw()

  lifeTracker.draw()
}

function drawBackground() {
  var gradient = g.ctx.createLinearGradient(0, 0, 0, g.tileHeight * g.yTiles)
  gradient.addColorStop(0, '#3A555C')
  gradient.addColorStop(1, '#4B8094')
  g.ctx.fillStyle = gradient
  g.ctx.fillRect(0, 0, canvas.width, canvas.height)
}

// Generate platforms, enemies, etc.
function generateTiles() {
  if (timeSinceLastPlatform++ > 50) {
    timeSinceLastPlatform = 0
    const newPlatforms = generatePlatformRow({
      platformMiddle: sprites.platformMiddle,
      platformLeft: sprites.platformLeft,
      platformRight: sprites.platformRight,
      platformBoth: sprites.platformBoth,
    })
    platforms.push(...newPlatforms)

    if (Math.random() < 1 / 3) {
      // Generate an enemy on one of the platforms we just generated
      const newEnemy = generateEnemy(newPlatforms)
      if (newEnemy) {
        enemies.push(newEnemy)
      }
    }
  }
}

function generateWalls() {
  return [
    // Left wall
    new BoundaryClass({
      x: -g.tileWidth,
      y: 0,
      width: g.tileWidth,
      height: g.canvasHeight,
    }),
    // Right wall
    new BoundaryClass({
      x: g.canvasWidth,
      y: 0,
      width: g.tileWidth,
      height: g.canvasHeight,
    }),
  ]
}

function generateFloor() {
  return new BoundaryClass({
    x: 0,
    y: g.canvasHeight - g.tileHeight / 2,
    width: g.canvasWidth,
    height: g.tileHeight,
  })
}

function generateCeiling() {
  return new BoundaryClass({
    x: 0,
    y: -g.tileHeight,
    width: g.canvasWidth,
    height: g.tileHeight,
  })
}

// Load the sprites into images
async function loadSpriteImages() {
  await Promise.all(
    Object.keys(sprites).map(
      spriteName =>
        new Promise(resolve => {
          const image = new Image()
          image.src = sprites[spriteName].path
          image.onload = () => {
            // Make sure sprites are pixelated and not blurry
            g.ctx.mozImageSmoothingEnabled = false
            g.ctx.webkitImageSmoothingEnabled = false
            g.ctx.msImageSmoothingEnabled = false
            g.ctx.imageSmoothingEnabled = false
            sprites[spriteName].image = image
            resolve()
          }
        })
    )
  )
}

function damagePlayer() {
  playSound('damage')
  lifeTracker.lives--
}

// Initialize the player and their position. They start on top of the start
// button, which is in the center of the screen.
function initPlayer() {
  return new PlayerClass(
    g.ctx,
    g.canvasWidth / 2 - g.tileWidth / 2,
    g.canvasHeight / 2 - startButtonHeight / 2 - g.tileHeight,
    g.tileWidth,
    g.tileHeight,
    {
      right: sprites.capybaraRight,
      left: sprites.capybaraLeft,
      rightDamaged: sprites.capybaraRightDamaged,
      leftDamaged: sprites.capybaraLeftDamaged,
      bootsWorn: {
        left: sprites.bootsWornLeft,
        right: sprites.bootsWornRight,
      },
    }
  )
}

// Initialize score tracker
function initScore() {
  return new ScoreClass({
    x: g.tileWidth,
    y: g.tileHeight,
  })
}

// Initialize life tracker
function initLifeTracker() {
  return new LifeTrackerClass({
    x: g.canvasWidth - startingLives * g.tileWidth - g.tileWidth,
    y: g.tileHeight,
    sprites: {
      heartFull: sprites.heartFull,
      heartEmpty: sprites.heartEmpty,
    },
    lifeCapacity: startingLives,
    lives: startingLives,
  })
}

window.addEventListener(
  'keydown',
  function (event) {
    if (gameLoaded && !gameStarted && event.key === 'Enter') {
      startGame()
    }

    let key = keyMap[event.key]
    pressedKeys[key] = true
  },
  false
)
window.addEventListener(
  'keyup',
  function (event) {
    let key = keyMap[event.key]
    pressedKeys[key] = false
  },
  false
)

canvas.addEventListener(
  'click',
  function () {
    if (gameLoaded && !gameStarted) {
      startGame()
    }
  },
  false
)

// Checks for a collision between object1 and object2. If there is a collision
// it returns an object with the direction of the collision from object1's
// perspective and the location of the collision (x pos or y pos depending on
// the direction).
function getCollision(object1, object2) {
  const o1Right = object1.x + object1.width
  const o1Left = object1.x
  const o1Bottom = object1.y + object1.height
  const o1Top = object1.y

  const o2Right = object2.x + object2.width
  const o2Left = object2.x
  const o2Bottom = object2.y + object2.height
  const o2Top = object2.y

  const rightEdgeCollision = o1Right > o2Left && o1Right <= o2Right
  const bottomEdgeCollision = o1Bottom > o2Top && o1Bottom <= o2Bottom
  const leftEdgeCollision = o1Left < o2Right && o1Left >= o2Left
  const topEdgeCollision = o1Top < o2Bottom && o1Top >= o2Top

  if (bottomEdgeCollision) {
    const bottomCollisionAmount = o1Bottom - o2Top
    if (rightEdgeCollision) {
      const rightCollisionAmount = o1Right - o2Left
      if (bottomCollisionAmount < rightCollisionAmount) {
        return { direction: 'down', location: o2Top }
      }
      if (bottomCollisionAmount > rightCollisionAmount) {
        return { direction: 'right', location: o2Left }
      }
    }
    if (leftEdgeCollision) {
      const leftCollisionAmount = o2Right - o1Left
      if (bottomCollisionAmount < leftCollisionAmount) {
        return { direction: 'down', location: o2Top }
      }
      if (bottomCollisionAmount > leftCollisionAmount) {
        return { direction: 'left', location: o2Right }
      }
    }
  }
  if (topEdgeCollision) {
    const topCollisionAmount = o2Bottom - o1Top
    if (rightEdgeCollision) {
      const rightCollisionAmount = o1Right - o2Left
      if (topCollisionAmount < rightCollisionAmount) {
        return { direction: 'up', location: o2Bottom }
      }
      if (topCollisionAmount > rightCollisionAmount) {
        return { direction: 'right', location: o2Left }
      }
    }
    if (leftEdgeCollision) {
      const leftCollisionAmount = o2Right - o1Left
      if (topCollisionAmount < leftCollisionAmount) {
        return { direction: 'up', location: o2Bottom }
      }
      if (topCollisionAmount > leftCollisionAmount) {
        return { direction: 'left', location: o2Right }
      }
    }
  }
  return false
}
