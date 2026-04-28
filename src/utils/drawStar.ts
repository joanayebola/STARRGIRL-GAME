export function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  rotation: number,
  fillColor: string,
  strokeColor: string,
  opacity: number,
  glowBlur: number = 20
): void {
  const points = 5
  const step = Math.PI / points

  ctx.save()
  ctx.shadowColor = fillColor
  ctx.shadowBlur = glowBlur
  ctx.globalAlpha = opacity
  ctx.beginPath()

  for (let i = 0; i < points * 2; i++) {
    const angle = i * step + rotation - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }

  ctx.closePath()
  ctx.fillStyle = fillColor
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = Math.max(1.5, outerR * 0.05)
  ctx.stroke()
  ctx.restore()
}
