import PlayerClass from './player.mjs'
import { generatePlatforms } from './platforms.mjs'

(function () {
  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame
})()

const canvas = document.getElementById("canvas")
const c = canvas.getContext("2d")
const tileWidth = 32
const tileHeight = 32
const xTiles = 20
const yTiles = 15

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

// We draw extra platforms outside the bounds of the screen on the left, top,
// and right so the player can't go out of bounds.
let map = `
======================
=                    =
=                    =
=                    =
=                    =
=               =    =
=                    =
=                    =
=   b                =
=  ====              =
=                    =
=      ======        =
=                    =
=              ===== =
=         =          =
======================
`

let player, platformTiles

const sprites = {
  capybaraRight: {
    path: './sprites/capybara-right.png',
    frames: 2,
  },
  capybaraLeft: {
    path: './sprites/capybara-left.png',
    frames: 2,
  },
  platform: {
    path: './sprites/platform.png',
  },
  boots: {
    path: './sprites/boots.png',
  },
}

async function main() {
  // Load the sprites into images
  await Promise.all(Object.keys(sprites).map(spriteName => new Promise((resolve, reject) => {
    const image = new Image()
    image.src = sprites[spriteName].path
    image.onload = () => {
      // Make sure sprites are pixelated and not blurry
      c.mozImageSmoothingEnabled = false
      c.webkitImageSmoothingEnabled = false
      c.msImageSmoothingEnabled = false
      c.imageSmoothingEnabled = false
      sprites[spriteName].image = image
      resolve()
    }
  })))

  // Initial player position
  player = new PlayerClass(c, 1 * tileWidth, 13 * tileHeight, tileWidth, tileHeight, {
    right: sprites.capybaraRight,
    left: sprites.capybaraLeft,
  })
  platformTiles = generatePlatforms(c, tileWidth, tileHeight, map, {
    '=': sprites.platform,
    'b': sprites.boots,
  })

  requestAnimationFrame(animate)
}

main()

let frameLimit = 1000

function animate () {
  // Draw the background
  var gradient = c.createLinearGradient(0, 0, 0, tileHeight * yTiles);
  gradient.addColorStop(0, '#51c1ff');
  gradient.addColorStop(1, 'white');
  c.fillStyle = gradient;
  c.fillRect(0, 0, tileWidth * xTiles, tileHeight * yTiles);

  player.update(pressedKeys)

  for (const platformTile of platformTiles) {
    const collisionDetails = collision(player, platformTile)
    if (collisionDetails) {
      player.collide(collisionDetails)
    }
  }

  player.draw()

  for (const platformTile of platformTiles) {
    platformTile.draw()
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
