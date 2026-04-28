import { useEffect, useRef, useState } from 'react'
import { drawStar } from '../utils/drawStar'
import {
  createStar,
  getMultiplier,
  getSpawnInterval,
  GAME_DURATION,
  type StarObj,
  type FloatingText,
} from '../utils/game'
import './GameScreen.css'

interface Props {
  onGameEnd: (score: number) => void
}

interface BgStar { x: number; y: number; r: number; phase: number; speed: number }

const VIOLET_FILL   = '#9b5de5'
const VIOLET_STROKE = '#5b21b6'
const GOLD_FILL     = '#f0c040'
const GOLD_STROKE   = '#b8860b'

function initBgStars(w: number, h: number): BgStar[] {
  return Array.from({ length: 90 }, () => ({
    x:     Math.random() * w,
    y:     Math.random() * h,
    r:     0.4 + Math.random() * 1.4,
    phase: Math.random() * Math.PI * 2,
    speed: 0.008 + Math.random() * 0.018,
  }))
}

export default function GameScreen({ onGameEnd }: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const rafRef       = useRef<number>(0)
  const startRef     = useRef<number>(0)
  const lastSpawnRef = useRef<number>(0)
  const activeRef    = useRef(true)
  const bgStarsRef   = useRef<BgStar[]>([])

  const starsRef     = useRef<StarObj[]>([])
  const floatsRef    = useRef<FloatingText[]>([])
  const scoreRef     = useRef(0)
  const streakRef    = useRef(0)
  const nextIdRef    = useRef(0)
  const endCalledRef = useRef(false)

  const [displayScore,  setDisplayScore]  = useState(0)
  const [displayStreak, setDisplayStreak] = useState(0)
  const [displayTime,   setDisplayTime]   = useState(GAME_DURATION)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function resize() {
      if (!canvas) return
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      bgStarsRef.current = initBgStars(canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    startRef.current     = performance.now()
    lastSpawnRef.current = performance.now()
    activeRef.current    = true

    function loop(now: number) {
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const elapsedMs = now - startRef.current
      const timeLeft  = Math.max(0, GAME_DURATION - Math.floor(elapsedMs / 1000))

      setDisplayTime(t => (t !== timeLeft ? timeLeft : t))

      if (timeLeft === 0 && !endCalledRef.current) {
        endCalledRef.current = true
        activeRef.current    = false
        cancelAnimationFrame(rafRef.current)
        onGameEnd(scoreRef.current)
        return
      }

      // Spawn
      if (now - lastSpawnRef.current >= getSpawnInterval(elapsedMs)) {
        starsRef.current.push(createStar(canvas.width, elapsedMs, nextIdRef.current++))
        lastSpawnRef.current = now
      }

      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height)
      bg.addColorStop(0, '#03020a')
      bg.addColorStop(0.5, '#110620')
      bg.addColorStop(1, '#1c0c34')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Twinkling background stars
      for (const s of bgStarsRef.current) {
        s.phase += s.speed
        const alpha = 0.15 + Math.abs(Math.sin(s.phase)) * 0.65
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220, 210, 255, ${alpha})`
        ctx.fill()
      }

      // Falling stars
      const missed: number[] = []
      for (const star of starsRef.current) {
        star.y        += star.speed
        star.rotation += star.rotationSpeed

        if (star.y > canvas.height + star.radius) {
          missed.push(star.id)
        } else {
          drawStar(
            ctx,
            star.x, star.y,
            star.radius, star.radius * 0.42,
            star.rotation,
            star.isGold ? GOLD_FILL   : VIOLET_FILL,
            star.isGold ? GOLD_STROKE : VIOLET_STROKE,
            0.95,
            star.radius * 0.8
          )
        }
      }

      if (missed.length) {
        starsRef.current = starsRef.current.filter(s => !missed.includes(s.id))
        if (streakRef.current > 0) {
          streakRef.current = 0
          setDisplayStreak(0)
        }
      }

      // Floating score texts
      floatsRef.current = floatsRef.current.filter(f => f.alpha > 0)
      for (const f of floatsRef.current) {
        f.y     -= 1.6
        f.alpha -= 0.016
        ctx.save()
        ctx.globalAlpha = f.alpha
        ctx.font        = "600 18px 'Outfit', sans-serif"
        ctx.fillStyle   = '#f0c040'
        ctx.shadowColor = '#f0c040'
        ctx.shadowBlur  = 10
        ctx.textAlign   = 'center'
        ctx.fillText(f.text, f.x, f.y)
        ctx.restore()
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      activeRef.current = false
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [onGameEnd])

  function catchAt(cssX: number, cssY: number) {
    const canvas = canvasRef.current
    if (!canvas || !activeRef.current) return

    const rect   = canvas.getBoundingClientRect()
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    const cx = (cssX - rect.left) * scaleX
    const cy = (cssY - rect.top)  * scaleY

    let caught: StarObj | null = null
    let minDist = Infinity

    for (const star of starsRef.current) {
      const dx   = cx - star.x
      const dy   = cy - star.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist <= star.radius + 14 && dist < minDist) {
        caught  = star
        minDist = dist
      }
    }

    if (!caught) return

    starsRef.current = starsRef.current.filter(s => s.id !== caught!.id)
    streakRef.current++

    const mult   = getMultiplier(streakRef.current)
    const points = Math.round(caught.points * mult)
    scoreRef.current += points

    floatsRef.current.push({
      id:    nextIdRef.current++,
      x:     caught.x,
      y:     caught.y - caught.radius,
      text:  mult > 1 ? `+${points}  ×${mult}` : `+${points}`,
      alpha: 1,
    })

    setDisplayScore(scoreRef.current)
    setDisplayStreak(streakRef.current)
  }

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    catchAt(e.clientX, e.clientY)
  }

  function handleTouch(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault()
    const t = e.changedTouches[0]
    catchAt(t.clientX, t.clientY)
  }

  const mult = getMultiplier(displayStreak)

  return (
    <div className="game-screen">
      <div className="game-hud">
        <div className="hud-score">
          <span className="hud-score__icon">✦</span>
          <span className="hud-score__val">{displayScore.toLocaleString()}</span>
        </div>

        <div className="hud-timer" data-urgent={displayTime <= 10 || undefined}>
          <span className="hud-timer__val">{String(displayTime).padStart(2, '0')}</span>
          <span className="hud-timer__unit">s</span>
        </div>

        <div className={`hud-streak${displayStreak >= 3 ? ' hud-streak--on' : ''}`}>
          {displayStreak >= 3
            ? <><span className="hud-streak__fire">🔥</span><span>×{mult}</span></>
            : <span>×{mult}</span>
          }
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="game-canvas"
        onClick={handleClick}
        onTouchStart={handleTouch}
      />
    </div>
  )
}
