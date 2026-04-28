import { useEffect, useState } from 'react'
import { getTopScores, type ScoreEntry } from '../lib/supabase'
import Leaderboard from './Leaderboard'
import './HomeScreen.css'

interface Props {
  onPlay: () => void
}

const BG_STARS = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  top:  `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: 1 + Math.random() * 2.5,
  delay: Math.random() * 6,
  dur:   4 + Math.random() * 5,
}))

export default function HomeScreen({ onPlay }: Props) {
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTopScores(10)
      .then(setScores)
      .catch(() => setScores([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="home">
      {/* Atmospheric background */}
      <div className="home-bg" aria-hidden="true">
        <div className="home-bg__leak home-bg__leak--left" />
        <div className="home-bg__leak home-bg__leak--right" />
        {BG_STARS.map(s => (
          <span
            key={s.id}
            className="home-bg__star"
            style={{
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.dur}s`,
            }}
          />
        ))}
      </div>

      <main className="home-content">
        <div className="home-hero">
          <p className="home-eyebrow">✦ Ayra Starr</p>
          <h1 className="home-title" aria-label="Starr Girl">
            <span className="home-title__line1">Starr</span>
            <span className="home-title__line2">Girl</span>
          </h1>
          <p className="home-tagline">Catch the stars. Claim your crown.</p>

          <button className="home-play-btn" onClick={onPlay} type="button">
            <span className="home-play-btn__text">Play Now</span>
            <span className="home-play-btn__shimmer" aria-hidden="true" />
          </button>

          <p className="home-hint">60 seconds &mdash; click the stars before they fall</p>
        </div>

        <div className="home-board">
          <header className="home-board__header">
            <span className="home-board__rule" />
            <span className="home-board__label">Top Players</span>
            <span className="home-board__rule" />
          </header>
          <Leaderboard scores={scores} loading={loading} />
        </div>
      </main>
    </div>
  )
}
