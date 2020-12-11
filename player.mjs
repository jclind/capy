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
  }

  update (pressedKeys) {
    if (pressedKeys.right) {
      this.direction = 'right'
      this.x += 2.5
      this.distanceSinceLastAnimation += 2.5
    }
    if (pressedKeys.left) {
      this.direction = 'left'
      this.x -= 2.5
      this.distanceSinceLastAnimation += 2.5
    }
    if (pressedKeys.up) {
      if (!this.jumping) {
        this.jumping = true
        this.verticalVelocity = -8
      }
    }

    // Update vertical position based on velocity
    const gravity = .5
    this.y += this.verticalVelocity
    this.verticalVelocity = this.verticalVelocity + gravity
    if (this.verticalVelocity > 10) {
      this.verticalVelocity = 10
    }
    if (this.verticalVelocity < -10) {
      this.verticalVelocity = -10
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
    const sprite = this.sprites[this.direction]

    // Advance to the next frame in the sprite animation
    if (this.distanceSinceLastAnimation >= 15) {
      this.distanceSinceLastAnimation = 0
      this.spriteFrame = (this.spriteFrame + 1) % (sprite.frames)
    }

    this.c.drawImage(
      sprite.image,
      0, // source x
      this.spriteFrame * 32, // source y
      32, // source width
      32, // source height
      this.x, // destination x
      this.y, // destination y
      this.width, // destination width
      this.height, // destination height
    )
  }
}
