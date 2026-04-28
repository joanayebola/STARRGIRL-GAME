import './MuteButton.css'

interface Props {
  muted: boolean
  onToggle: () => void
}

export default function MuteButton({ muted, onToggle }: Props) {
  return (
    <button
      className="mute-btn"
      onClick={onToggle}
      type="button"
      aria-label={muted ? 'Unmute music' : 'Mute music'}
      title={muted ? 'Unmute music' : 'Mute music'}
    >
      {muted ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <line x1="23" y1="9" x2="17" y2="15"/>
          <line x1="17" y1="9" x2="23" y2="15"/>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>
      )}
    </button>
  )
}
