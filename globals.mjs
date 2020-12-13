const canvas = document.getElementById("canvas")

export default {
  ctx: canvas.getContext("2d"),
  tileWidth: 32,
  tileHeight: 32,
  xTiles: 20,
  yTiles: 15,
  spriteRatio: 2, // how big should each sprite pixel be rendered
}
