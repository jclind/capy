import g from './globals.mjs'
import { randArrayItem } from './utils.mjs'

export default class Enemy {
  constructor ({ x, y, sprites, platform }) {
    this.x = x
    this.y = y
    this.sprites = sprites
    this.platform = platform

    this.width = g.tileWidth
    this.height = g.tileHeight

    this.direction = randArrayItem(['right', 'left'])
    this.distanceSinceLastAnimation = 0
    this.spriteFrame = 0
    this.speed = 1
  }

  update () {
    if (this.direction === 'right') {
      if (this.platform.width > g.tileWidth) {
        // Platform is wider than one tile
        this.x += this.speed
      }

      // Off the right platform edge?
      if (this.x + this.width > this.platform.x + this.platform.width) {
        this.x -= this.speed
        this.direction = 'left'
      }
    }
    else if (this.direction === 'left') {
      if (this.platform.width > g.tileWidth) {
        // Platform is wider than one tile
        this.x -= this.speed
      }

      // Off the left platform edge?
      if (this.x < this.platform.x) {
        this.x += this.speed
        this.direction = 'right'
      }
    }
    this.distanceSinceLastAnimation += 3
  }

  // There was a collision between the platform and this tile
  collide ({ direction, location }) {
    if (direction === 'up') {
      this.y = location
    }
    if (direction === 'right') {
      this.x = location - this.width
    }
    if (direction === 'down') {
      this.y = location - this.height
    }
    if (direction === 'left') {
      this.x = location
    }
  }

  draw () {
    const sprite = this.sprites[this.direction]

    // Advance to the next frame in the sprite animation
    if (this.distanceSinceLastAnimation >= 30) {
      this.distanceSinceLastAnimation = 0
      this.spriteFrame = (this.spriteFrame + 1) % (sprite.frames)
    }

    g.ctx.drawImage(
      sprite.image,
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
