export default class PlatformTile {
  constructor (c, x, y, width, height) {
    this.c = c
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  draw () {
    this.c.fillStyle = 'green'
    this.c.fillRect(this.x, this.y, this.width, this.height)
  }
}
