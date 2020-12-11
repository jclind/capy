export default class PlatformTile {
  constructor (c, x, y, width, height, sprite) {
    this.c = c
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.sprite = sprite
  }

  draw () {
    this.c.drawImage(
      this.sprite.image,
      0, // source x
      0, // source y
      32, // source width
      32, // source height
      this.x, // destination x
      this.y, // destination y
      this.width, // destination width
      this.height, // destination height
    )
  }
}
