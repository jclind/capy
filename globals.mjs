const canvas = document.getElementById('canvas')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const tileWidth = 32
const tileHeight = 32

export default {
  ctx: canvas.getContext('2d'),
  tileWidth,
  tileHeight,
  xTiles: Math.floor(canvas.width / tileWidth),
  yTiles: Math.floor(canvas.height / tileHeight),
  canvasWidth: canvas.width,
  canvasHeight: canvas.height,
  spriteRatio: 2, // how big should each sprite pixel be rendered
}
