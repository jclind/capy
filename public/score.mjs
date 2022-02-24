import g from './globals.mjs'

export default class Score {
  constructor ({ x, y }) {
    this.x = x
    this.y = y

    this.value = 100
    this.lastTime = new Date().getTime()
  }

  incrementTimePoints () {
    const curTime = new Date().getTime()
    this.value += curTime - this.lastTime
    this.lastTime = curTime
  }

  draw () {
    // Only show part of the value because it consists of milliseconds from the
    // time increments
    const normalizedValue = Math.floor(this.value / 100)

    g.ctx.font = '32px monospace'
    g.ctx.textAlign = 'start'
    g.ctx.textBaseline = 'top'

    // Draw the score's shadow
    g.ctx.fillStyle = 'black'
    g.ctx.fillText(normalizedValue, this.x + 3, this.y + 3)

    // Draw the score
    g.ctx.fillStyle = 'yellow'
    g.ctx.fillText(normalizedValue, this.x, this.y)
  }
}
