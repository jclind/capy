export function randArrayItem (array) {
  return array[Math.floor(Math.random() * array.length)]
}

// Includes min but not max
export function randIntBetween (min, max) {
  return min + Math.floor(Math.random() * (max - min))
}

export default {
  randArrayItem,
  randIntBetween,
}
