import g from './globals.mjs'
import PlayerClass from './player.mjs'
import EnemyClass from './enemy.mjs'
import ScoreClass from './score.mjs'
import { generatePlatformRow } from './platforms.mjs'
import utils from './utils.mjs'

window.requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame

const keyMap = {
  a: 'left',
  d: 'right',
  w: 'up',
  s: 'down',
}
const pressedKeys = {
  left: false,
  right: false,
  up: false,
  down: false,
}

let player, boots, score
let platforms = []
let enemies = []
let timeSinceLastPlatform = 0
let startTime = (new Date()).getTime()

const sprites = {
  capybaraRight: {
    path: './sprites/capybara-right.png',
    frames: 2,
  },
  capybaraLeft: {
    path: './sprites/capybara-left.png',
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
}

main()

// Initialize the game before starting the render loop
async function main() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  await loadSpriteImages()

  player = initPlayer()

  platforms.push(...generatePlatformRow({
    platformMiddle: sprites.platformMiddle,
    platformLeft: sprites.platformLeft,
    platformRight: sprites.platformRight,
    platformBoth: sprites.platformBoth,
  }))

  score = initScore()

  // Kick off the game loop
  requestAnimationFrame(gameLoop)
}

// Runs for every frame
function gameLoop () {
  drawBackground()

  generateTiles()

  player.update(pressedKeys)

  let newEnemies = []
  for (const enemy of enemies) {
    enemy.update()
    if (enemy.y + g.tileHeight >= 0) {
      // The enemy hasn't yet fallen off the top of the screen, so keep it
      newEnemies.push(enemy)
    }
  }
  enemies = newEnemies

  // Copy the platforms to a new array, excluding any that have risen out of the
  // top of the screen
  let newPlatforms = []
  for (const platform of platforms) {
    platform.update()
    if (platform.y + g.tileHeight >= 0) {
      // The platform hasn't yet fallen off the top of the screen, so keep it
      newPlatforms.push(platform)
    }

    let collisionDetails = collision(player, platform)
    if (collisionDetails) {
      player.collide(collisionDetails)
    }

    for (const enemy of enemies) {
      collisionDetails = collision(enemy, platform)
      if (collisionDetails) {
        enemy.collide(collisionDetails)
      }
    }
  }
  platforms = newPlatforms

  const curTime = (new Date()).getTime()
  score.value = Math.floor((curTime - startTime) / 1000 * 5) + 1

  if (boots && collision(player, boots)) {
    player.wearing.boots = true
    boots = null
  }

  draw()

  if (frameLimit-- > 0) {
    requestAnimationFrame(gameLoop)
  }
}

let frameLimit = 1000

function generateEnemy (platforms) {
  if (!platforms || !platforms.length) {
    return
  }
  const platform = utils.randArrayItem(platforms)
  const platformXTiles = platform.width / g.tileWidth
  const enemyTile = utils.randIntBetween(0, platformXTiles)

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

function drawBackground () {
  // Draw the background
  var gradient = g.ctx.createLinearGradient(0, 0, 0, g.tileHeight * g.yTiles);
  gradient.addColorStop(0, '#3A555C');
  gradient.addColorStop(1, '#4B8094');
  g.ctx.fillStyle = gradient;
  g.ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw () {
  if (boots) {
    boots.draw()
  }

  for (const platform of platforms) {
    platform.draw()
  }

  for (const enemy of enemies) {
    enemy.draw()
  }

  player.draw()

  score.draw()
}

// Generate platforms, enemies, etc.
function generateTiles () {
  if (timeSinceLastPlatform++ > 50) {
    timeSinceLastPlatform = 0
    const newPlatforms = generatePlatformRow({
      platformMiddle: sprites.platformMiddle,
      platformLeft: sprites.platformLeft,
      platformRight: sprites.platformRight,
      platformBoth: sprites.platformBoth,
    })
    platforms.push(...newPlatforms)

    if (Math.random() < 1/3) {
      // Generate an enemy on one of the platforms we just generated
      const newEnemy = generateEnemy(newPlatforms)
      if (newEnemy) {
        enemies.push(newEnemy)
      }
    }
  }
}

// Load the sprites into images
async function loadSpriteImages () {
  await Promise.all(Object.keys(sprites).map(spriteName => new Promise((resolve) => {
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
  })))
}

// Initialize the player and their position
function initPlayer () {
  return new PlayerClass(g.ctx, 5 * g.tileWidth, 5 * g.tileHeight, g.tileWidth, g.tileHeight, {
    right: sprites.capybaraRight,
    left: sprites.capybaraLeft,
    bootsWorn: {
      left: sprites.bootsWornLeft,
      right: sprites.bootsWornRight,
    },
  })
}

// Initialize score tracker
function initScore () {
  return new ScoreClass({
    x: g.tileWidth,
    y: g.tileHeight,
    value: 0,
  })
}

window.addEventListener('keydown', function (event) {
  let key = keyMap[event.key]
  pressedKeys[key] = true
}, false)
window.addEventListener('keyup', function (event) {
  let key = keyMap[event.key]
  pressedKeys[key] = false
}, false)

// Checks for a collision between object1 and object2. If there is a collision
// it returns an object with the direction of the collision from object1's
// perspective and the location of the collision (x pos or y pos depending on
// the direction).
function collision (object1, object2) {
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

  const yCollision = bottomEdgeCollision || topEdgeCollision
  const xCollision = rightEdgeCollision || leftEdgeCollision

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
