import type { ScoreEntry } from '../lib/supabase'
import './Leaderboard.css'

interface Props {
  scores: ScoreEntry[]
  highlightId?: string
  loading?: boolean
}

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard({ scores, highlightId, loading }: Props) {
  if (loading) {
    return <div className="lb-loading">Loading scores…</div>
  }

  if (scores.length === 0) {
    return <div className="lb-empty">No scores yet — be the first!</div>
  }

  return (
    <ol className="lb-list">
      {scores.map((entry, i) => (
        <li
          key={entry.id}
          className={`lb-row${entry.id === highlightId ? ' lb-row--highlight' : ''}`}
        >
          <span className="lb-rank">
            {i < 3 ? MEDALS[i] : `#${i + 1}`}
          </span>
          <span className="lb-name">{entry.name}</span>
          <span className="lb-score">{entry.score.toLocaleString()}</span>
        </li>
      ))}
    </ol>
  )
}
