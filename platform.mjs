import g from './globals.mjs'

export default class Platform {
  constructor ({x, y, width, sprites}) {
    this.x = x
    this.y = y
    this.width = width
    this.height = g.tileHeight
    this.sprites = sprites
  }

  update () {
    this.y -= 2
  }

  draw () {
    const totalTiles = this.width / g.tileWidth
    for (let i = 0; i < totalTiles; i++) {
      let sprite
      if (this.width === g.tileWidth) {
        sprite = this.sprites.both
      }
      else if (i === 0) {
        sprite = this.sprites.left
      }
      else if (i === totalTiles - 1) {
        sprite = this.sprites.right
      }
      else {
        sprite = this.sprites.middle
      }

      g.ctx.drawImage(
        sprite.image,
        0, // source x
        0, // source y
        g.tileWidth / g.spriteRatio, // source width
        g.tileHeight / g.spriteRatio, // source height
        this.x + i * g.tileWidth, // destination x
        this.y, // destination y
        g.tileWidth, // destination width
        this.height, // destination height
      )
    }
  }
}
