import g from './globals.mjs'

export default class Boundary {
  constructor ({ x, y, width, height }) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  draw () {
    const gradient = g.ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height)

    // Use the color of the background to make it look like blocks are fading in
    // from the bottom of the canvas
    gradient.addColorStop(0, 'rgba(75, 128, 148, 0)')
    gradient.addColorStop(1, 'rgba(75, 128, 148, 1)')

    g.ctx.fillStyle = gradient
    g.ctx.fillRect(this.x, this.y, this.width, this.height)
  }
}
