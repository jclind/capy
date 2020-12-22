import g from './globals.mjs'
import PlayerClass from './player.mjs'
import ItemClass from './item.mjs'
import PlatformClass from './platform.mjs'
import { generatePlatforms } from './platforms.mjs'

(function () {
  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame
})()

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

let player, platformTiles, boots
let platforms = []
let timeSinceLastPlatform = 0

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
}

async function main() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // Load the sprites into images
  await Promise.all(Object.keys(sprites).map(spriteName => new Promise((resolve, reject) => {
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

  // Initial player position
  player = new PlayerClass(g.ctx, 5 * g.tileWidth, 5 * g.tileHeight, g.tileWidth, g.tileHeight, {
    right: sprites.capybaraRight,
    left: sprites.capybaraLeft,
    bootsWorn: {
      left: sprites.bootsWornLeft,
      right: sprites.bootsWornRight,
    },
  })
  platforms.push(...generateRow())
  // boots = new ItemClass(g.ctx, 3 * g.tileWidth, 7 * g.tileHeight, {
  //   solo: sprites.bootsSolo,
  //   worn: sprites.bootsWorn,
  // })
  // platformTiles = generatePlatforms(g.ctx, g.tileWidth, g.tileHeight, map, {
  //   '=': sprites.platform,
  //   '[': sprites.platformLeft,
  //   ']': sprites.platformRight,
  //   'H': sprites.platformBoth,
  // })

  requestAnimationFrame(animate)
}

main()

let frameLimit = 1000

function generateRow () {
  // How many tiles wide is the canvas?
  const canvasXTiles = Math.floor(canvas.width / g.tileWidth)

  // Set initial probabilities of starting/continuing platforms
  const probOfStartingPlatform = 0.1
  const probOfContinuingPlatform = 0.975

  // Set the amounts by which the above probabilities should change for every
  // additional start/continuation
  const startingProbSteps = 0.05
  const continuingProbSteps = 0.05

  // Initialize the current probabilities which will be modified as tiles are
  // generated
  let curStartingProb = probOfStartingPlatform
  let curContinuingProb = probOfContinuingPlatform

  let curPlatform = null
  let platforms = []
  for (let i = 0; i < canvasXTiles; i++) {
    if (curPlatform) {
      // There is a existing platform
      if (Math.random() <= curContinuingProb) {
        // Add to the existing platform
        curPlatform.width += g.tileWidth
        curContinuingProb -= continuingProbSteps
      }
      else {
        // Finish the platform
        platforms.push(curPlatform)
        curPlatform = null
        curContinuingProb = probOfContinuingPlatform
      }
    }
    else {
      // There is NOT an existing platform
      let rand = Math.random()
      if (rand <= curStartingProb) {
        // Start a new platform
        curPlatform = new PlatformClass({
          x: i * g.tileWidth,
          y: canvas.height,
          width: g.tileWidth,
          sprites: {
            left: sprites.platformLeft,
            middle: sprites.platformMiddle,
            right: sprites.platformRight,
            both: sprites.platformBoth,
          }
        })
        curStartingProb = probOfStartingPlatform
      }
      else {
        // Don't start a platform
        curStartingProb += startingProbSteps
      }
    }
  }

  // If we still have an open platform, end it
  if (curPlatform) {
    platforms.push(curPlatform)
  }

  return platforms
}

function animate () {
  // Draw the background
  var gradient = g.ctx.createLinearGradient(0, 0, 0, g.tileHeight * g.yTiles);
  gradient.addColorStop(0, '#3A555C');
  gradient.addColorStop(1, '#4B8094');
  g.ctx.fillStyle = gradient;
  g.ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (timeSinceLastPlatform++ > 50) {
    platforms.push(...generateRow())
    timeSinceLastPlatform = 0
  }

  player.update(pressedKeys)

  // Copy the platforms to a new array, excluding any that have risen out of the
  // top of the screen
  let newPlatforms = []
  for (const platform of platforms) {
    platform.update()
    if (platform.y + g.tileHeight >= 0) {
      // The platform hasn't yet fallen off the top of the screen, so keep it
      newPlatforms.push(platform)
    }

    const collisionDetails = collision(player, platform)
    if (collisionDetails) {
      player.collide(collisionDetails)
    }
  }
  platforms = newPlatforms

  if (boots) {
    if (collision(player, boots)) {
      player.wearing.boots = true
      boots = null
    }
    else {
      boots.draw()
    }
  }

  player.draw()

  for (const platform of platforms) {
    platform.draw()
  }

  if (frameLimit-- > 0) {
    requestAnimationFrame(animate)
  }
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
