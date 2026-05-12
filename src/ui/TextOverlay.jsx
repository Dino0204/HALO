import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useSceneStore } from '../store/sceneStore'
import { scrollStore } from '../store/scrollStore'

const FINAL_MESSAGE_START = 0.999
const FINAL_MAP_TITLE_START = 0.9286
const FINAL_MAP_TITLE_END = 0.9857

const SCENE_CONTENT = [
  // Scene 00
  {
    topCenter: '대한민국, 1979년',
    center: '18년 독재의 종식.',
    centerSmall: '1979년 10월 26일, 박정희 대통령 피살',
  },
  // Scene 01
  {
    topLeft: '1979.12.12',
    topLeftColor: '#ff6666',
    center: '전두환, 군사 반란을 감행하다.',
    bottom: '군부가 서울을 장악했다.\n국회는 봉쇄되고, 민주주의는 중단됐다.',
  },
  // Scene 02
  {
    topLeft: '1980년 봄',
    center: '전국 대학가에서\n민주화의 목소리가가 터져 나왔다.',
    bottom: '서울 · 부산 · 대구 · 광주 · 대전 · 인천 등',
  },
  // Scene 03
  {
    center: '그 중심에 광주가 있었다.',
  },
  // Scene 04
  {
    center: '5월 18일 오전\n전남대학교 정문 앞',
    topLeft: '1980.05.18',
    topLeftColor: '#ff6666',
    bottom: '계엄군이 학생들을 진압봉으로 가격했다.\n지나가던 시민도 진압 대상이 됐다.',
    bottomSmall: '전남대학교 정문 앞 — 오전 10시',
  },
  // Scene 05
  {
    topLeft: '1980.05.20 밤',
    center: '수백 대의 택시와 버스가\n금남로를 가득 매웠다.',
    bottom: '운전기사들이 자발적으로 나섰다.\n전조등이 밤을 밝혔다.',
  },
  // Scene 06 — 광주MBC 방화 (NEW)
  {
    topLeft: '1980.05.20 밤 9시 50분',
    topLeftColor: '#ff6666',
    center: '광주MBC가 불길에 휩싸였다.',
    bottom: '방송은 시민이 죽어가는 도시를 보도하지 않았다.\n분노한 시민들이 방송국을 방화했다.',
    bottomSmall: '광주MBC 사옥 — 5월 20일 21:50',
  },
  // Scene 07 — 집단 발포 (was Scene 06)
  {
    topLeft: '1980.05.21 오후 1시',
    topLeftColor: '#ff4444',
    center: '계엄군이 시민을 향해 총을 발포했다.',
    bottom: '그날 금남로에서\n수십 명이 희생됐다.',
    bottomRight: '— 도청 앞 집단발포 (5·18민주화운동기록관)',
  },
  // Scene 08 — 전일빌딩 헬기 사격 (NEW)
  {
    topLeft: '1980.05.21 오후',
    topLeftColor: '#ff6666',
    center: '하늘에서도 총탄이 쏟아졌다.',
    bottom: '전일빌딩 외벽에서\n245개의 헬기 사격 탄흔이 발견됐다.',
    bottomRight: '— 국립과학수사연구원 공식 감정 (2017)',
  },
  // Scene 09 — 광주 봉쇄 (was Scene 07)
  {
    topLeft: '1980.05.21 이후',
    center: '계엄군이 광주를 완전히 봉쇄했다.',
    bottom: '전화가 끊겼다.\n도로가 막혔다.\n언론은 침묵했다.',
    bottomRight: '외부 세계는 광주에서 무슨 일이 일어나는지 알지 못했다.',
  },
  // Scene 10 — 5.18민주광장 제1차 시민궐기대회 (NEW)
  {
    topLeft: '1980.05.23 오후 1시',
    center: '수십만 명이 도청 앞 광장에 집결했다.',
    bottom: '봉쇄된 광주는 스스로의 질서를 형성하고 있었다.\n시민궐기대회는 5월 26일까지 매일 이어졌다.',
    bottomRight: '— 제1차 민주수호 범시민궐기대회',
  },
  // Scene 11 — 장갑차 도청 진입 (was Scene 08)
  {
    topLeft: '1980.05.27 새벽 4시',
    topLeftColor: '#ff4444',
    centerQuote: '지금 계엄군이 쳐들어오고 있습니다.\n시민 여러분, 우리를 잊지 말아 주십시오.',
    bottom: '도청에 남은 시민군은 끝까지 항전했다.',
  },
  // Scene 12 — 병원/통계 (was Scene 09)
  {
    topCenter: '9일간의 기록',
    stats: true,
    bottomSmall: '출처: 5·18 유공자 유족회 등 4개 단체 발표',
  },
  // Scene 13 — 기억 / 국립5.18민주묘지 (was Scene 10)
  {
    finalMessage: '기억하겠습니다',
    finalSub: '5·18민주화운동',
    bottomLeft: '1980년 5월 18일 — 5월 27일, 광주',
  },
]

export default function TextOverlay() {
  const currentScene = useSceneStore((s) => s.currentScene)
  const containerRef = useRef()
  const prevScene = useRef(-1)
  const [showHint, setShowHint] = useState(true)
  const [scrollOffset, setScrollOffset] = useState(0)

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

  useEffect(() => {
    let frameId

    const syncOffset = () => {
      setScrollOffset(scrollStore.offset)
      frameId = requestAnimationFrame(syncOffset)
    }

    frameId = requestAnimationFrame(syncOffset)
    return () => cancelAnimationFrame(frameId)
  }, [])

  const font = "'Noto Serif KR', serif"

  // Auto-scroll logic
  const scrollInterval = useRef(null)
  const isPressing = useRef(false)

  const startAutoScroll = () => {
    if (isPressing.current) return
    isPressing.current = true
    setShowHint(false)

    const el = window._518scrollEl || document.querySelector('.hide-scrollbar')
    if (!el) return

    const scrollSpeed = 6
    const step = () => {
      if (!isPressing.current) return
      el.scrollTop += scrollSpeed
      scrollInterval.current = requestAnimationFrame(step)
    }
    scrollInterval.current = requestAnimationFrame(step)
  }

  const stopAutoScroll = () => {
    isPressing.current = false
    setShowHint(true)
    if (scrollInterval.current) cancelAnimationFrame(scrollInterval.current)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        if (!e.repeat) startAutoScroll()
      }
    }
    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        stopAutoScroll()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      stopAutoScroll()
    }
  }, [])

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
      <style>
        {`
          @keyframes hintPulse {
            0% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.98); }
            50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.02); }
            100% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.98); }
          }
        `}
      </style>

      {/* Interaction Hint - Visible when not pressing space */}
      <div
        style={{
          position: 'absolute',
          top: '70%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.8rem',
          opacity: showHint ? 1 : 0,
          pointerEvents: 'none',
          transition: 'opacity 0.6s ease, visibility 0.6s',
          visibility: showHint ? 'visible' : 'hidden',
          animation: 'hintPulse 3s infinite ease-in-out',
        }}
      >
        <div
          style={{
            padding: '0.5rem 1.2rem',
            border: '1.5px solid rgba(232, 224, 208, 0.6)',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            letterSpacing: '0.3em',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 0 20px rgba(0,0,0,0.5), inset 0 0 10px rgba(232, 224, 208, 0.1)',
            color: '#ffffff',
            fontWeight: 'bold',
          }}
        >
          SPACE HOLD
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            letterSpacing: '0.15em',
            fontWeight: '500',
            color: '#e8e0d0',
            textShadow: '0 2px 10px rgba(0,0,0,0.9)',
          }}
        >
          꾹 눌러서 진행하기
        </span>
      </div>

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
          {sc.finalMessage && scrollOffset >= FINAL_MESSAGE_START && (
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
          {sc.finalSub && scrollOffset >= FINAL_MESSAGE_START && (
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

      {scrollOffset >= FINAL_MAP_TITLE_START && scrollOffset < FINAL_MAP_TITLE_END && (
        <div
          style={{
            position: 'absolute',
            top: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
            letterSpacing: '0.1em',
            textAlign: 'center',
            textShadow: '0 1px 8px rgba(0,0,0,0.85)',
          }}
        >
          9일간의 기록
        </div>
      )}

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
        <br />
        3D 모델: 한국학중앙연구원 광주문화예술인문스토리플랫폼 (CC BY-SA 4.0)
      </div>
    </div>
  )
}
