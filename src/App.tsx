import { useRef, useState } from 'react'
import HomeScreen from './components/HomeScreen'
import GameScreen from './components/GameScreen'
import EndScreen  from './components/EndScreen'
import MuteButton from './components/MuteButton'

type Screen = 'home' | 'playing' | 'end'

const MUSIC_SRC = '/Where%20Do%20We%20Go%20(Peggy%20Gou%20Remix).mp3'

export default function App() {
  const [screen,       setScreen]       = useState<Screen>('home')
  const [lastScore,    setLastScore]    = useState(0)
  const [isMuted,      setIsMuted]      = useState(false)
  const [musicStarted, setMusicStarted] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  function getAudio(): HTMLAudioElement {
    if (!audioRef.current) {
      const audio = new Audio(MUSIC_SRC)
      audio.loop   = true
      audio.volume = 0.45
      audioRef.current = audio
    }
    return audioRef.current
  }

  function handlePlay() {
    setLastScore(0)
    setScreen('playing')

    const audio = getAudio()
    if (!musicStarted) {
      audio.play().catch(() => {})
      setMusicStarted(true)
    } else if (!isMuted) {
      audio.play().catch(() => {})
    }
  }

  function handleGameEnd(score: number) {
    setLastScore(score)
    setScreen('end')
  }

  function handlePlayAgain() {
    setScreen('home')
  }

  function toggleMute() {
    const audio = getAudio()
    const next  = !isMuted
    audio.muted = next
    setIsMuted(next)
  }

  return (
    <>
      {screen === 'home'    && <HomeScreen onPlay={handlePlay} />}
      {screen === 'playing' && <GameScreen onGameEnd={handleGameEnd} />}
      {screen === 'end'     && <EndScreen  score={lastScore} onPlayAgain={handlePlayAgain} />}
      {musicStarted && <MuteButton muted={isMuted} onToggle={toggleMute} />}
    </>
  )
}
