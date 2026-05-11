import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useSceneStore } from '../store/sceneStore'

const SCENE_CONTENT = [
  // Scene 00
  {
    topCenter: '대한민국, 1979년',
    center: '18년간의 독재가 끝났다.',
    centerSmall: '1979년 10월 26일, 박정희 대통령 피격 사망',
  },
  // Scene 01
  {
    topLeft: '1979.12.12',
    topLeftColor: '#ff6666',
    center: '전두환, 군사 반란을 일으키다.',
    bottom: '군부가 서울을 장악했다.\n국회는 봉쇄되고, 민주주의는 멈췄다.',
  },
  // Scene 02
  {
    topLeft: '1980년 봄',
    center: '전국 대학가에서\n민주화의 목소리가 터져 나왔다.',
    bottom: '서울 · 부산 · 대구 · 광주 · 대전 · 인천',
  },
  // Scene 03
  {
    center: '그 중심에 광주가 있었다.',
    bottom: '5월 18일 오전\n전남대학교 정문 앞',
  },
  // Scene 04
  {
    topLeft: '1980.05.18',
    topLeftColor: '#ff6666',
    bottom: '계엄군이 학생들을 향해 진압봉을 휘둘렀다.\n지나가던 시민도 예외가 아니었다.',
    bottomSmall: '전남대학교 정문 앞 — 오전 10시',
  },
  // Scene 05
  {
    topLeft: '1980.05.20 밤',
    center: '수백 대의 택시와 버스가\n금남로를 가득 메웠다.',
    bottom: '운전기사들이 자발적으로 나섰다.\n전조등이 밤을 밝혔다.',
  },
  // Scene 06
  {
    topLeft: '1980.05.21 오후 1시',
    topLeftColor: '#ff4444',
    center: '계엄군이 시민을 향해 총을 쐈다.',
    bottom: '그날 금남로에서\n수십 명이 쓰러졌다.',
    bottomRight: '— 5·18기념재단 공식 기록',
  },
  // Scene 07
  {
    topLeft: '1980.05.21 이후',
    center: '계엄군이 광주를 완전히 차단했다.',
    bottom: '전화가 끊겼다.\n도로가 막혔다.\n언론은 침묵했다.',
    bottomRight: '외부 세계는 광주에서 무슨 일이 일어나는지 알지 못했다.',
  },
  // Scene 08
  {
    topLeft: '1980.05.27 새벽 4시',
    topLeftColor: '#ff4444',
    centerQuote: '지금 계엄군이 쳐들어오고 있습니다.\n시민 여러분, 우리를 잊지 말아 주십시오.',
    bottom: '도청에 남은 시민군은 끝까지 싸웠다.',
  },
  // Scene 09
  {
    topCenter: '9일간의 기록',
    stats: true,
    bottom: '이것은 공식적으로 인정된 숫자다.\n실제 피해는 여전히 밝혀지지 않고 있다.',
    bottomSmall: '출처: 5·18기념재단 공식 집계',
  },
  // Scene 10
  {
    finalMessage: '우리가 기억합니다',
    finalSub: '5·18민주화운동',
    bottomLeft: '1980년 5월 18일 — 5월 27일, 광주',
  },
]

export default function TextOverlay() {
  const currentScene = useSceneStore((s) => s.currentScene)
  const containerRef = useRef()
  const prevScene = useRef(-1)

  // Mouse interaction for Gwangju close-up (Scene 03–06)
  useEffect(() => {
    function onMouseMove(e) {
      if (!window._518mouseRef) return
      window._518mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 0.1
      window._518mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 0.05
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    if (prevScene.current === currentScene) return
    prevScene.current = currentScene

    // Fade in the current scene panel, hide others
    const panels = containerRef.current.querySelectorAll('[data-scene]')
    panels.forEach((panel) => {
      const idx = parseInt(panel.dataset.scene)
      if (idx === currentScene) {
        gsap.killTweensOf(panel)
        gsap.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' })
      } else {
        gsap.killTweensOf(panel)
        gsap.set(panel, { opacity: 0 })
      }
    })
  }, [currentScene])

  const font = "'Noto Serif KR', serif"

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10,
        fontFamily: font,
        color: '#e8e0d0',
      }}
    >
      {SCENE_CONTENT.map((sc, i) => (
        <div
          key={i}
          data-scene={i}
          style={{ position: 'absolute', inset: 0, opacity: i === 0 ? 1 : 0 }}
        >
          {/* Top left date/label — 5.5rem to stay below HUDLocation */}
          {sc.topLeft && (
            <div
              style={{
                position: 'absolute',
                top: '5.5rem',
                left: '2rem',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                letterSpacing: '0.15em',
                color: sc.topLeftColor || '#e8e0d0',
              }}
            >
              {sc.topLeft}
            </div>
          )}

          {/* Top center */}
          {sc.topCenter && (
            <div
              style={{
                position: 'absolute',
                top: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
                letterSpacing: '0.1em',
                textAlign: 'center',
              }}
            >
              {sc.topCenter}
            </div>
          )}

          {/* Center main text */}
          {sc.center && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 'clamp(1rem, 2vw, 1.4rem)',
                textAlign: 'center',
                lineHeight: '1.8',
                maxWidth: '680px',
                textShadow: '0 1px 8px rgba(0,0,0,0.8)',
                whiteSpace: 'pre-line',
              }}
            >
              {sc.center}
            </div>
          )}

          {/* Center small */}
          {sc.centerSmall && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(50% + 3rem)',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                opacity: 0.6,
                letterSpacing: '0.1em',
                textAlign: 'center',
              }}
            >
              {sc.centerSmall}
            </div>
          )}

          {/* Center quote (Scene 08 — italic) */}
          {sc.centerQuote && (
            <div
              style={{
                position: 'absolute',
                top: '38%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 'clamp(1.0rem, 2.2vw, 1.4rem)',
                textAlign: 'center',
                lineHeight: '1.9',
                maxWidth: '700px',
                fontStyle: 'italic',
                textShadow: '0 1px 8px rgba(0,0,0,0.9)',
                whiteSpace: 'pre-line',
              }}
            >
              {sc.centerQuote}
            </div>
          )}

          {/* Statistics (Scene 09) */}
          {sc.stats && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                width: 'min(500px, 90vw)',
              }}
            >
              {[
                { label: '사망 인정', value: '165명' },
                { label: '행방불명', value: '65명' },
                { label: '부상', value: '3,028명' },
                { label: '구속·구금', value: '1,589명' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    background: 'rgba(0,0,0,0.8)',
                    border: '1px solid #555',
                    padding: '1rem',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      opacity: 0.6,
                      marginBottom: '0.5rem',
                    }}
                  >
                    {label}
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom text */}
          {sc.bottom && (
            <div
              style={{
                position: 'absolute',
                bottom: '3rem',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 'clamp(0.85rem, 1.6vw, 1.1rem)',
                maxWidth: '680px',
                textAlign: 'center',
                lineHeight: '1.8',
                textShadow: '0 1px 8px rgba(0,0,0,0.8)',
                whiteSpace: 'pre-line',
              }}
            >
              {sc.bottom}
            </div>
          )}

          {/* Bottom small */}
          {sc.bottomSmall && (
            <div
              style={{
                position: 'absolute',
                bottom: '1.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '0.7rem',
                fontFamily: 'monospace',
                opacity: 0.5,
                letterSpacing: '0.12em',
                textAlign: 'center',
              }}
            >
              {sc.bottomSmall}
            </div>
          )}

          {/* Bottom right */}
          {sc.bottomRight && (
            <div
              style={{
                position: 'absolute',
                bottom: '3rem',
                right: '2rem',
                fontSize: '0.7rem',
                fontFamily: 'monospace',
                opacity: 0.4,
                maxWidth: '300px',
                textAlign: 'right',
                lineHeight: '1.5',
              }}
            >
              {sc.bottomRight}
            </div>
          )}

          {/* Bottom left */}
          {sc.bottomLeft && (
            <div
              style={{
                position: 'absolute',
                bottom: '2rem',
                left: '2rem',
                fontSize: '0.7rem',
                fontFamily: 'monospace',
                opacity: 0.5,
                letterSpacing: '0.1em',
              }}
            >
              {sc.bottomLeft}
            </div>
          )}

          {/* Final message (Scene 10) */}
          {sc.finalMessage && (
            <div
              style={{
                position: 'absolute',
                top: '45%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)',
                textAlign: 'center',
                letterSpacing: '0.15em',
              }}
            >
              {sc.finalMessage}
            </div>
          )}
          {sc.finalSub && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(45% + 4rem)',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 'clamp(0.9rem, 1.8vw, 1.2rem)',
                letterSpacing: '0.25em',
                color: '#b0a090',
              }}
            >
              {sc.finalSub}
            </div>
          )}
        </div>
      ))}

      {/* Attribution footer — always visible */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1.5rem',
          fontSize: '0.65rem',
          color: '#554',
          lineHeight: '1.6',
          textAlign: 'right',
          pointerEvents: 'none',
        }}
      >
        지리 데이터: © OpenStreetMap contributors (ODbL)
        <br />
        역사 자료: 5·18기념재단, 5·18민주화운동기록관, 민주화운동기념사업회
      </div>
    </div>
  )
}
