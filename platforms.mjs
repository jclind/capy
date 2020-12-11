import PlatformTile from './platformTile.mjs'

export function generatePlatforms (c, tileWidth, tileHeight, platformTiles, spriteMap) {
  let platformLayers = platformTiles.split('\n').filter(v=>v!='')
  let platformTilesList = []
  let tileXPos, tileYPos
  for (let i = 0; i < platformLayers.length; i++) {
    for (let j = 0; j < platformLayers[i].length; j++) {
      const char = platformLayers[i].charAt(j)
      if (char === ' ') {
        continue
      }

      // We subtract 1 from j and i because the map has a buffer of tiles on
      // the left, top, and right side of the screens. Those tiles aren't
      // displayed but prevent the player from walking/jumping off the screen.
      tileXPos = tileWidth * (j - 1)
      tileYPos = tileHeight * (i - 1)

      let currTile = new PlatformTile(c, tileXPos, tileYPos, tileWidth, tileHeight, spriteMap[char])
      platformTilesList.push(currTile)
    }
  }
  return platformTilesList
}
