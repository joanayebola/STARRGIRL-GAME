import { useState } from 'react'
import HomeScreen from './components/HomeScreen'
import GameScreen from './components/GameScreen'
import EndScreen  from './components/EndScreen'

type Screen = 'home' | 'playing' | 'end'

export default function App() {
  const [screen,    setScreen]    = useState<Screen>('home')
  const [lastScore, setLastScore] = useState(0)

  function handlePlay() {
    setLastScore(0)
    setScreen('playing')
  }

  function handleGameEnd(score: number) {
    setLastScore(score)
    setScreen('end')
  }

  function handlePlayAgain() {
    setScreen('home')
  }

  return (
    <>
      {screen === 'home'    && <HomeScreen onPlay={handlePlay} />}
      {screen === 'playing' && <GameScreen onGameEnd={handleGameEnd} />}
      {screen === 'end'     && <EndScreen  score={lastScore} onPlayAgain={handlePlayAgain} />}
    </>
  )
}
