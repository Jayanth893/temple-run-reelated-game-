export function getRandomPosition(range = 5) {
  return (Math.random() - 0.5) * range
}

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default { getRandomPosition, getRandomInt }
