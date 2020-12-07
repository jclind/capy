export default class Player {
  constructor (c, x, y, width, height) {
    this.c = c
    this.x = x
    this.y = y
    this.width = width
    this.height = height

    this.jumping = false
    this.verticalVelocity = 0
  }

  update (pressedKeys) {
    if (pressedKeys.right) {
      this.x += 2.5
    }
    if (pressedKeys.left) {
      this.x -= 2.5
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
    this.c.fillStyle = 'brown'
    this.c.beginPath()
    const radius = this.width / 2
    this.c.arc(this.x + radius, this.y + radius, radius, 0, 2 * Math.PI)
    this.c.fill()
  }
}
