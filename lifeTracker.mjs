import g from './globals.mjs'
import { roundedRectangle } from './utils.mjs'

export default class LifeTracker {
  constructor ({ x, y, sprites, lifeCapacity, lives }) {
    this.x = x
    this.y = y
    this.sprites = sprites
    this.lifeCapacity = lifeCapacity
    this.lives = lives
  }

  draw () {
    // Draw the rounded background
    const rectPadding = g.tileWidth / 4
    g.ctx.fillStyle = "rgba(0, 0, 0, .25)"
    roundedRectangle(
      g.ctx,
      this.x - rectPadding,
      this.y - rectPadding,
      this.lifeCapacity * g.tileWidth + rectPadding * 2,
      g.tileHeight + rectPadding * 2,
      5,
      true,
      false,
    );

    // Draw the hearts
    for (let i = 0; i < this.lifeCapacity; i++) {
      const sprite = i < this.lives
        ? this.sprites.heartFull
        : this.sprites.heartEmpty

      g.ctx.drawImage(
        sprite.image,
        0, // source x
        0, // source y
        g.tileWidth / g.spriteRatio, // source width
        g.tileHeight / g.spriteRatio, // source height
        this.x + g.tileWidth * i, // destination x
        this.y, // destination y
        g.tileWidth, // destination width
        g.tileHeight, // destination height
      )
    }
  }
}
