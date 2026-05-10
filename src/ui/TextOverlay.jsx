import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import SplitType from 'split-type'
import timeline from '../../data/timeline.json'
import { scrollStore } from '../store/scrollStore'

// 각 타임라인 항목이 등장하는 scroll offset 구간
const SCENE3_START = 0.55
const SCENE3_END = 0.80
const SCENE3_RANGE = SCENE3_END - SCENE3_START

export default function TextOverlay() {
  const titleRef = useRef()
  const subtitleRef = useRef()
  const dateRefs = useRef([])
  const testimonyRefs = useRef([])
  const finalRef = useRef()
  const final2Ref = useRef()
  const rafRef = useRef()
  const prevIndexRef = useRef(-1)
  const prevPhaseRef = useRef('')

  // Scene 1 오프닝 애니메이션
  useEffect(() => {
    if (!titleRef.current || !subtitleRef.current) return

    const splitTitle = new SplitType(titleRef.current, { types: 'chars' })
    gsap.from(splitTitle.chars, {
      opacity: 0,
      y: 20,
      stagger: 0.05,
      duration: 0.8,
      ease: 'power2.out',
      delay: 0.3,
    })
    gsap.from(subtitleRef.current, {
      opacity: 0,
      duration: 0.8,
      delay: 1.0,
    })

    return () => splitTitle.revert()
  }, [])

  // 스크롤 기반 텍스트 업데이트 (RAF 루프)
  useEffect(() => {
    function tick() {
      const t = scrollStore.offset

      // Scene 1 타이틀 페이드아웃
      if (titleRef.current) {
        const fadeOut = 1 - gsap.utils.clamp(0, 1, (t - 0.15) / 0.1)
        titleRef.current.style.opacity = fadeOut
        subtitleRef.current.style.opacity = fadeOut
      }

      // Scene 3: 타임라인 항목 순서대로 등장
      if (t >= SCENE3_START && t <= SCENE3_END) {
        const progress = (t - SCENE3_START) / SCENE3_RANGE
        const index = Math.min(
          Math.floor(progress * timeline.length),
          timeline.length - 1
        )

        if (index !== prevIndexRef.current) {
          prevIndexRef.current = index
          // 이전 항목 숨기기
          dateRefs.current.forEach((el, i) => {
            if (el) el.style.opacity = i === index ? '' : '0'
          })
          testimonyRefs.current.forEach((el, i) => {
            if (el) el.style.opacity = i === index ? '' : '0'
          })
          // 새 항목 등장 애니메이션
          if (dateRefs.current[index]) {
            gsap.fromTo(dateRefs.current[index],
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
            )
          }
          if (testimonyRefs.current[index]) {
            gsap.fromTo(testimonyRefs.current[index],
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.6, delay: 0.15, ease: 'power2.out' }
            )
          }
        }
      } else {
        // Scene 3 구간 밖이면 숨기기
        if (prevIndexRef.current !== -1) {
          prevIndexRef.current = -1
          dateRefs.current.forEach(el => { if (el) el.style.opacity = '0' })
          testimonyRefs.current.forEach(el => { if (el) el.style.opacity = '0' })
        }
      }

      // Scene 4: 최종 텍스트
      const phase = t >= 0.85 ? 'final' : 'other'
      if (phase !== prevPhaseRef.current) {
        prevPhaseRef.current = phase
        if (phase === 'final' && finalRef.current) {
          gsap.fromTo(finalRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 2.0, ease: 'power2.out' }
          )
          gsap.fromTo(final2Ref.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.8, delay: 0.8, ease: 'power2.out' }
          )
        } else if (finalRef.current) {
          gsap.to(finalRef.current, { opacity: 0, duration: 0.3 })
          gsap.to(final2Ref.current, { opacity: 0, duration: 0.3 })
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Scene 3 마우스 인터랙션
  useEffect(() => {
    function onMouseMove(e) {
      if (!window._518mouseRef) return
      window._518mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 0.1
      window._518mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 0.05
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 10,
    fontFamily: "'Noto Serif KR', serif",
    color: '#e8e0d0',
  }

  return (
    <div style={overlayStyle}>
      {/* Scene 1: 오프닝 */}
      <div ref={titleRef} style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
        textAlign: 'center', letterSpacing: '0.1em',
      }}>
        1980년 5월 18일
      </div>
      <div ref={subtitleRef} style={{
        position: 'absolute', top: 'calc(50% + 3.5rem)', left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 'clamp(1rem, 2vw, 1.4rem)',
        opacity: 0, letterSpacing: '0.3em',
      }}>
        광주
      </div>

      {/* Scene 3: 타임라인 항목 */}
      {timeline.map((item, i) => (
        <div key={i}>
          <div
            ref={el => dateRefs.current[i] = el}
            style={{
              position: 'absolute', top: '2rem', left: '2rem',
              fontSize: '0.85rem', fontFamily: 'monospace',
              letterSpacing: '0.15em', opacity: 0,
            }}
          >
            {item.date} · {item.location.name}
          </div>
          <div
            ref={el => testimonyRefs.current[i] = el}
            style={{
              position: 'absolute', bottom: '3rem', left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 'clamp(0.9rem, 1.8vw, 1.15rem)',
              maxWidth: '680px', textAlign: 'center',
              lineHeight: '1.8', opacity: 0,
              textShadow: '0 1px 8px rgba(0,0,0,0.8)',
            }}
          >
            {item.testimony}
          </div>
        </div>
      ))}

      {/* Scene 4: 최종 메시지 */}
      <div ref={finalRef} style={{
        position: 'absolute', top: '45%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)',
        textAlign: 'center', letterSpacing: '0.15em', opacity: 0,
      }}>
        우리가 기억합니다
      </div>
      <div ref={final2Ref} style={{
        position: 'absolute', top: 'calc(45% + 4rem)', left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 'clamp(0.9rem, 1.8vw, 1.2rem)',
        letterSpacing: '0.25em', opacity: 0,
        color: '#b0a090',
      }}>
        5·18 민주화운동
      </div>

      {/* 출처 표기 */}
      <div style={{
        position: 'absolute', bottom: '1rem', right: '1.5rem',
        fontSize: '0.65rem', color: '#554', lineHeight: '1.6',
        textAlign: 'right',
      }}>
        지리 데이터: © OpenStreetMap contributors (ODbL)<br />
        역사 자료: 5·18기념재단, 5·18민주화운동기록관, 민주화운동기념사업회
      </div>
    </div>
  )
}
