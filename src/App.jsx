import { useState, useRef, useEffect } from 'react'
import './App.css'
import {
  PRIZES,
  IDLE,
  SPIN_MS,
  SPIN_TICK_MS,
  MAX_LENGTH,
  FALLBACK_NICKNAME,
  BUBBLE,
  CONFETTI,
  pickPrize,
} from './config'

// 별명을 지어 달라고 서버에 물어본다. 실패하면 기본 별명으로 넘어간다.
async function askNickname(log) {
  try {
    const res = await fetch('/api/nickname', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ log }),
    })

    if (!res.ok) return FALLBACK_NICKNAME

    const data = await res.json()
    if (!data.nickname) return FALLBACK_NICKNAME

    return { nickname: data.nickname, line: data.line || '' }
  } catch {
    return FALLBACK_NICKNAME
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default function App() {
  const [phase, setPhase] = useState('input') // input | drawing | result
  const [log, setLog] = useState('')
  const [title, setTitle] = useState(null) // { nickname, line }
  const [prize, setPrize] = useState(IDLE)

  const spinner = useRef(null)
  const inputBox = useRef(null)

  // 뽑기가 끝나면 화면을 정리한다
  useEffect(() => () => clearInterval(spinner.current), [])

  async function draw(event) {
    event.preventDefault()

    if (phase === 'drawing') return
    if (!log.trim()) return

    setPhase('drawing')

    // 당첨
    const picked = pickPrize()

    spinner.current = setInterval(() => {
      setPrize(PRIZES[Math.floor(Math.random() * PRIZES.length)])
    }, SPIN_TICK_MS)

    // 별명을 기다리는 동안 룰렛이 돈다.
    // 응답이 빨리 와도 SPIN_MS 만큼은 돌려야 뽑는 맛이 난다.
    const [named] = await Promise.all([askNickname(log.trim()), wait(SPIN_MS)])

    clearInterval(spinner.current)
    setTitle(named)
    setPrize(picked)
    setPhase('result')
  }

  function reset() {
    setPhase('input')
    setLog('')
    setTitle(null)
    setPrize(IDLE)
    inputBox.current?.focus()
  }

  return (
    <div className="page">
      <header className="header">
        <img className="logo" src="/healply_logo.svg" alt="healply" />
        <span className="brand">healply</span>
        <span className="brand-sub">LUCKY DRAW</span>
      </header>

      <main className="stage-wrap">
        <div className={`stage stage-${phase}`} style={{ background: prize.color }}>
          {phase === 'result' && (
            <div className="confetti">
              {CONFETTI.map((color, i) => (
                <span
                  key={i}
                  className="confetti-piece"
                  style={{
                    background: color,
                    left: `${8 + i * 15}%`,
                    animationDelay: `${i * 0.12}s`,
                  }}
                />
              ))}
            </div>
          )}

          <div className="glow" />

          {phase === 'result' && title && (
            <div className="title-box">
              <p className="nickname">{title.nickname}</p>
              {title.line && <p className="nickname-line">{title.line}</p>}
            </div>
          )}

          <img className={`prize-image prize-${phase}`} src={prize.image} alt="" />

          <p className="prize-name">{prize.name}</p>
          <p className="prize-desc">{phase === 'drawing' ? ' ' : prize.desc}</p>
        </div>

        <div className={`character character-${phase}`}>
          <div className="bubble">{BUBBLE[phase]}</div>
          <img className="character-image" src="/character/cat.png" alt="헬플리 캐릭터" />
        </div>
      </main>

      {phase === 'result' ? (
        <button className="enter-button" onClick={reset}>
          한 번 더 뽑기
        </button>
      ) : (
        <form className="log-form" onSubmit={draw}>
          <label className="log-label" htmlFor="log">
            이번 주 PLUS Log 에 적을 만한, 나를 챙긴 일이 무엇인가요?<br/> 
            건강에 도움이 된 작은 일이어도 좋아요.
          </label>

          <div className="log-row">
            <input
              id="log"
              ref={inputBox}
              className="log-input"
              value={log}
              onChange={(e) => setLog(e.target.value)}
              placeholder="예) 어제 10km 뛰었어요"
              maxLength={MAX_LENGTH}
              disabled={phase === 'drawing'}
              autoFocus
            />

            <button
              className={`enter-button enter-${phase}`}
              disabled={phase === 'drawing' || !log.trim()}
            >
              <kbd className="key">Enter</kbd>
              <span>{phase === 'drawing' ? '뽑는 중' : '뽑기'}</span>
            </button>
          </div>

          <span className="log-count">
            {log.length}/{MAX_LENGTH}
          </span>
        </form>
      )}

      <ul className="lineup">
        {PRIZES.map((item) => (
          <li
            key={item.id}
            className={`lineup-item ${phase === 'result' && item.id === prize.id ? 'lineup-win' : ''}`}
            style={{ background: item.color }}
          >
            <img src={item.image} alt="" />
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
