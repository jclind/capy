import g from './globals.mjs'

export default class Platform {
  constructor ({x, y, width, sprites}) {
    this.x = x
    this.y = y
    this.width = width
    this.height = g.tileHeight
    this.sprites = sprites
  }

  draw () {
    g.ctx.fillStyle = 'white'
    g.ctx.fillRect(this.x, this.y, this.width, this.height)
    // this.c.drawImage(
    //   this.sprite.image,
    //   0, // source x
    //   0, // source y
    //   g.tileWidth / g.spriteRatio, // source width
    //   g.tileHeight / g.spriteRatio, // source height
    //   this.x, // destination x
    //   this.y, // destination y
    //   this.width, // destination width
    //   this.height, // destination height
    // )
  }
}
