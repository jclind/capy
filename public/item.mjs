import g from './globals.mjs'

export default class Item {
  constructor (c, x, y, sprites) {
    this.c = c
    this.x = x
    this.y = y
    this.width = g.tileWidth
    this.height = g.tileHeight
    this.sprites = sprites
  }

  draw () {
    this.c.drawImage(
      this.sprites.solo.image,
      0, // source x
      0, // source y
      g.tileWidth / g.spriteRatio, // source width
      g.tileHeight / g.spriteRatio, // source height
      this.x, // destination x
      this.y, // destination y
      this.width, // destination width
      this.height, // destination height
    )
  }
}
