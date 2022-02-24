const canvas = document.getElementById('canvas')

canvas.width = Math.min(window.innerWidth, 512)
canvas.height = Math.max(window.innerHeight, 512)

const tileWidth = 32
const tileHeight = 32

export default {
  canvas,
  ctx: canvas.getContext('2d'),
  tileWidth,
  tileHeight,
  xTiles: Math.floor(canvas.width / tileWidth),
  yTiles: Math.floor(canvas.height / tileHeight),
  canvasWidth: canvas.width,
  canvasHeight: canvas.height,
  spriteRatio: 2, // how big should each sprite pixel be rendered
}
