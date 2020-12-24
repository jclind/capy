import g from './globals.mjs'

export default class Score {
  constructor ({ x, y, value }) {
    this.x = x
    this.y = y
    this.value = value
  }

  draw () {
    g.ctx.font = '32px monospace'
    g.ctx.textBaseline = 'top'

    // Draw the score's shadow
    g.ctx.fillStyle = 'black'
    g.ctx.fillText(this.value, this.x + 3, this.y + 3)

    // Draw the score
    g.ctx.fillStyle = 'yellow'
    g.ctx.fillText(this.value, this.x, this.y)
  }
}
