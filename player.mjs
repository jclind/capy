import g from './globals.mjs'

export default class Player {
  constructor (c, x, y, width, height, sprites) {
    this.c = c
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.sprites = sprites

    this.jumping = false
    this.direction = 'right'
    this.verticalVelocity = 0
    this.distanceSinceLastAnimation = 0
    this.spriteFrame = 0
    this.wearing = {}
  }

  update (pressedKeys) {
    if (pressedKeys.right) {
      this.direction = 'right'
      this.x += 3.5
      this.distanceSinceLastAnimation += 3.5
    }
    if (pressedKeys.left) {
      this.direction = 'left'
      this.x -= 3.5
      this.distanceSinceLastAnimation += 3.5
    }
    if (pressedKeys.up) {
      if (!this.jumping) {
        this.jumping = true
        this.verticalVelocity = this.wearing.boots ? -20 : -13
      }
    }

    // Update vertical position based on velocity
    const gravity = .5
    const maxVelocity = 25
    this.y += this.verticalVelocity
    this.verticalVelocity = this.verticalVelocity + gravity
    if (this.verticalVelocity > maxVelocity) {
      this.verticalVelocity = maxVelocity
    }
    if (this.verticalVelocity < -maxVelocity) {
      this.verticalVelocity = -maxVelocity
    }
  }

  // There was a collision between the player and this tile
  collide ({ direction, location }) {
    if (direction === 'up') {
      this.y = location
      this.verticalVelocity = 0
    }
    if (direction === 'right') {
      this.x = location - this.width
    }
    if (direction === 'down') {
      this.y = location - this.height
      this.jumping = false
      this.verticalVelocity = 0
    }
    if (direction === 'left') {
      this.x = location
    }
  }

  draw () {
    const playerSprite = this.sprites[this.direction]

    // Advance to the next frame in the sprite animation
    if (this.distanceSinceLastAnimation >= 15) {
      this.distanceSinceLastAnimation = 0
      this.spriteFrame = (this.spriteFrame + 1) % (playerSprite.frames)
    }

    this.c.drawImage(
      playerSprite.image,
      0, // source x
      this.spriteFrame * g.tileHeight / g.spriteRatio, // source y
      g.tileWidth / g.spriteRatio, // source width
      g.tileHeight / g.spriteRatio, // source height
      this.x, // destination x
      this.y, // destination y
      this.width, // destination width
      this.height, // destination height
    )

    if (this.wearing.boots) {
      const bootsSprite = this.sprites.bootsWorn[this.direction]
      this.c.drawImage(
        bootsSprite.image,
        0, // source x
        this.spriteFrame * g.tileHeight / g.spriteRatio, // source y
        g.tileWidth / g.spriteRatio, // source width
        g.tileHeight / g.spriteRatio, // source height
        this.x, // destination x
        this.y, // destination y
        this.width, // destination width
        this.height, // destination height
      )
    }
  }
}
