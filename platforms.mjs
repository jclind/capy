import PlatformTile from './platformTile.mjs'

export function generatePlatforms (c, tileWidth, tileHeight, platformTiles) {
  let platformLayers = platformTiles.split('\n').filter(v=>v!='')
  let platformTilesList = []
  let tileXPos, tileYPos
  for (let i = 0; i < platformLayers.length; i++) {
    for (let j = 0; j < platformLayers[i].length; j++) {

      if (platformLayers[i].charAt(j) == 'x') {
        tileXPos = tileWidth * (j)
        tileYPos = tileHeight * (i)

        let currTile = new PlatformTile(c, tileXPos, tileYPos, tileWidth, tileHeight)
        platformTilesList.push(currTile)

      }
    }
  }
  return platformTilesList
}
