import { playSound } from './audio.mjs'
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
    this.yVelocity = 0
    this.xVelocity = 0
    this.distanceSinceLastAnimation = 0
    this.distanceSinceLastAudio = 0
    this.spriteFrame = 0
    this.wearing = {}
    this.damageStartTime = 0
  }

  update (pressedKeys) {
    if (pressedKeys.right) {
      this.direction = 'right'
      this.x += 3.5
      this.distanceSinceLastAnimation += 3.5
      this.distanceSinceLastAudio += 3.5
    }
    if (pressedKeys.left) {
      this.direction = 'left'
      this.x -= 3.5
      this.distanceSinceLastAnimation += 3.5
      this.distanceSinceLastAudio += 3.5
    }
    if (pressedKeys.up) {
      if (!this.jumping) {
        this.jumping = true
        this.yVelocity = this.wearing.boots ? -20 : -13
        playSound('jump')
      }
    }

    // Update vertical position based on velocity
    const gravity = .5
    const maxVelocity = 25
    this.y += this.yVelocity
    this.yVelocity = this.yVelocity + gravity
    if (this.yVelocity > maxVelocity) {
      this.yVelocity = maxVelocity
    }
    if (this.yVelocity < -maxVelocity) {
      this.yVelocity = -maxVelocity
    }

    const xFriction = 1
    this.x += this.xVelocity
    if (this.xVelocity > 0) {
      this.xVelocity = Math.max(this.xVelocity - xFriction, 0)
    }
    else if (this.xVelocity < 0) {
      this.xVelocity = Math.min(this.xVelocity + xFriction, 0)
    }
  }

  // The player collided with a hard tile
  hardCollision ({ direction, location }) {
    if (direction === 'up') {
      this.y = location
      this.yVelocity = 0
    }
    if (direction === 'right') {
      this.x = location - this.width
    }
    if (direction === 'down') {
      this.y = location - this.height
      this.jumping = false
      this.yVelocity = 0
    }
    if (direction === 'left') {
      this.x = location
    }
  }

  enemyCollision (collision) {
    const { direction, location } = collision

    // First reset the player's position as if they hit a hard obstacle
    this.hardCollision(collision)

    if (direction === 'right') {
      this.xVelocity = -15
    }
    else {
      this.xVelocity = 15
    }

    // Make the player jump. We have to subtract from y directly in addition to
    // adding a velocity because otherwise the platform collision that happens
    // after this enemy collision check will reset the velocity to 0.
    this.yVelocity = -5
    this.y -= 5

    this.startDamage()
  }

  // If the player hits the ceiling or floor, launch them away
  outOfBoundsCollision (collision) {
    const { direction, location } = collision

    // First reset the player's position as if they hit a hard obstacle
    this.hardCollision(collision)

    if (direction === 'up') {
      this.yVelocity = 5
      this.y -= 5
    }
    else {
      this.yVelocity = -10
      this.y += 5
    }

    this.startDamage()
  }

  startDamage () {
    this.damageStartTime = new Date().getTime()
  }

  draw () {
    let playerSprite = this.sprites[this.direction]

    const timeSinceDamage = new Date().getTime() - this.damageStartTime
    if (timeSinceDamage < 250) {
      // The player hit an enemy recently
      if (Math.floor(timeSinceDamage / 10) % 2 === 1) {
        g.ctx.globalAlpha = 0.1
      }
      playerSprite = this.sprites[`${this.direction}Damaged`]
    }

    // Advance to the next frame in the sprite animation
    if (this.distanceSinceLastAnimation >= 15) {
      this.distanceSinceLastAnimation = 0
      this.spriteFrame = (this.spriteFrame + 1) % (playerSprite.frames)
    }

    if (this.distanceSinceLastAudio >= 40 && !this.jumping) {
      playSound('walk')
      this.distanceSinceLastAudio = 0
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

    g.ctx.globalAlpha = 1
  }
}
