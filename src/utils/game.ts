export interface StarObj {
  id: number
  x: number
  y: number
  radius: number
  speed: number
  points: number
  isGold: boolean
  rotation: number
  rotationSpeed: number
}

export interface FloatingText {
  id: number
  x: number
  y: number
  text: string
  alpha: number
}

export const GAME_DURATION = 60

export function createStar(canvasWidth: number, elapsedMs: number, nextId: number): StarObj {
  const isGold = Math.random() < 0.07
  const rand = Math.random()

  let radius: number
  let points: number
  if (rand < 0.2) {
    radius = 13
    points = 50
  } else if (rand < 0.65) {
    radius = 23
    points = 25
  } else {
    radius = 36
    points = 10
  }

  if (isGold) points *= 3

  const speedBonus = Math.min(elapsedMs / 12000, 3)
  const speed = 1.4 + Math.random() * 1.3 + speedBonus

  return {
    id: nextId,
    x: radius + Math.random() * (canvasWidth - radius * 2),
    y: -radius - Math.random() * 40,
    radius,
    speed,
    points,
    isGold,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.04,
  }
}

export function getMultiplier(streak: number): number {
  if (streak >= 15) return 3
  if (streak >= 7) return 2
  if (streak >= 3) return 1.5
  return 1
}

export function getSpawnInterval(elapsedMs: number): number {
  return Math.max(550, 1500 - elapsedMs / 55)
}
