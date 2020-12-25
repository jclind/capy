import PlatformClass from './platform.mjs'
import g from './globals.mjs'

export function generatePlatformRow (platformSprites) {
  // How many tiles wide is the canvas?
  const canvasXTiles = Math.floor(canvas.width / g.tileWidth)

  // Set initial probabilities of starting/continuing platforms
  const probOfStartingPlatform = 0.1
  const probOfContinuingPlatform = 0.975

  // Set the amounts by which the above probabilities should change for every
  // additional start/continuation
  const startingProbSteps = 0.05
  const continuingProbSteps = 0.05

  // Initialize the current probabilities which will be modified as tiles are
  // generated
  let curStartingProb = probOfStartingPlatform
  let curContinuingProb = probOfContinuingPlatform

  let curPlatform = null
  let platforms = []
  for (let i = 0; i < canvasXTiles; i++) {
    if (curPlatform) {
      // There is a existing platform
      if (Math.random() <= curContinuingProb) {
        // Add to the existing platform
        curPlatform.width += g.tileWidth
        curContinuingProb -= continuingProbSteps
      }
      else {
        // Finish the platform
        platforms.push(curPlatform)
        curPlatform = null
        curContinuingProb = probOfContinuingPlatform
      }
    }
    else {
      // There is NOT an existing platform
      let rand = Math.random()
      if (rand <= curStartingProb) {
        // Start a new platform
        curPlatform = new PlatformClass({
          x: i * g.tileWidth,
          // Start the platform two tiles below the bottom of the screen to
          // allow room for enemies on top
          y: canvas.height + g.tileHeight,
          width: g.tileWidth,
          sprites: {
            left: platformSprites.platformLeft,
            middle: platformSprites.platformMiddle,
            right: platformSprites.platformRight,
            both: platformSprites.platformBoth,
          }
        })
        curStartingProb = probOfStartingPlatform
      }
      else {
        // Don't start a platform
        curStartingProb += startingProbSteps
      }
    }
  }

  // If we still have an open platform, end it
  if (curPlatform) {
    platforms.push(curPlatform)
  }

  return platforms
}
