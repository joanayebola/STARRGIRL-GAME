import { useEffect, useRef, useState } from 'react'
import {
  submitScore,
  getTopScores,
  getPlayerRank,
  type ScoreEntry,
} from '../lib/supabase'
import Leaderboard from './Leaderboard'
import './EndScreen.css'

interface Props {
  score: number
  onPlayAgain: () => void
}

type Phase = 'entry' | 'submitting' | 'done'

export default function EndScreen({ score, onPlayAgain }: Props) {
  const [name,      setName]      = useState('')
  const [phase,     setPhase]     = useState<Phase>('entry')
  const [rank,      setRank]      = useState<number | null>(null)
  const [scores,    setScores]    = useState<ScoreEntry[]>([])
  const [myId,      setMyId]      = useState<string | undefined>()
  const [error,     setError]     = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim().slice(0, 24)
    if (!trimmed) return

    setPhase('submitting')
    setError(null)

    try {
      const entry = await submitScore(trimmed, score)
      const [playerRank, topScores] = await Promise.all([
        getPlayerRank(score),
        getTopScores(10),
      ])
      setMyId(entry.id)
      setRank(playerRank)
      setScores(topScores)
      setPhase('done')
    } catch {
      setError('Could not save score. Check your connection and try again.')
      setPhase('entry')
    }
  }

  const rankLabel =
    rank === 1 ? '🏆 You\'re #1!' :
    rank === 2 ? '🥈 2nd place!' :
    rank === 3 ? '🥉 3rd place!' :
    rank !== null ? `You ranked #${rank}` : null

  return (
    <div className="end-screen">
      <div className="end-card">
        <div className="end-score-label">Your Score</div>
        <div className="end-score">{score.toLocaleString()}</div>

        {phase !== 'done' ? (
          <form className="end-form" onSubmit={handleSubmit}>
            <label className="end-name-label" htmlFor="player-name">
              Enter your name for the leaderboard
            </label>
            <input
              ref={inputRef}
              id="player-name"
              className="end-name-input"
              type="text"
              placeholder="Your name…"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={24}
              disabled={phase === 'submitting'}
            />
            {error && <p className="end-error">{error}</p>}
            <button
              className="end-submit-btn"
              type="submit"
              disabled={phase === 'submitting' || !name.trim()}
            >
              {phase === 'submitting' ? 'Saving…' : 'Post Score ★'}
            </button>
          </form>
        ) : (
          <>
            {rankLabel && <div className="end-rank">{rankLabel}</div>}
            <div className="end-board-wrap">
              <h3 className="end-board-title">★ Leaderboard</h3>
              <Leaderboard scores={scores} highlightId={myId} />
            </div>
          </>
        )}

        <button className="end-again-btn" type="button" onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  )
}
