const canvas = document.getElementById('canvas')

const tileWidth = 32
const tileHeight = 32

canvas.width = tileWidth * 16
canvas.height = window.innerHeight

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
