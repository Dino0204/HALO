# 프로젝트 규칙

## 빌드

- `bun run build`는 사용자가 명시적으로 요청하지 않는 한 실행하지 않는다.
- 코드 수정 후 검증이 필요하면 개발 서버(`bun run dev`)가 이미 실행 중인지 확인한다.

---

# 프로젝트 컨텍스트

## 컨셉

스크롤이 곧 카메라다. 페이지를 내릴수록 광주 상공에서 1980년 5월의 거리로 강하한다.  
3인칭 항공 시점 → 1인칭 현장 시점으로의 전환을 통해 역사적 사건에 몰입하게 한다.  
`<ScrollControls pages={14} damping={0.15}>`

## 기술 스택 및 역할 분리

| 패키지                      | 역할                                             |
| --------------------------- | ------------------------------------------------ |
| React 19 + Vite             | UI 프레임워크 + 번들러                           |
| @react-three/fiber          | Three.js React 렌더러                            |
| @react-three/drei           | ScrollControls, useScroll, Html 헬퍼             |
| @react-three/postprocessing | 필름 셰이더 후처리                               |
| three                       | 3D 렌더링                                        |
| gsap + split-type           | 텍스트 오버레이 애니메이션 (씬 외부 HTML 레이어) |
| osmtogeojson                | OSM Overpass API → GeoJSON 변환                  |
| zustand                     | 씬 상태 관리 (현재 씬, 자동재생 등)              |

**역할 분리 원칙**

- 3D 씬 스크롤 제어 → `@react-three/drei`의 `ScrollControls` + `useScroll`
- 텍스트 UI 애니메이션 → GSAP (씬 외부)
- 이 둘을 혼용하면 스크롤 이벤트 충돌이 발생하므로 반드시 역할을 분리한다

## 디렉토리 구조

```
src/
├── main.jsx               # 진입점
├── App.jsx                # ScrollControls 최상위 래퍼
├── scene/
│   ├── Experience.jsx     # R3F 씬 루트
│   ├── CameraRig.jsx      # useScroll → 카메라 경로 이동 (useFrame)
│   ├── CityMesh.jsx       # OSM GeoJSON → InstancedMesh
│   ├── GwangjuCity.jsx    # 광주 도심 렌더링
│   ├── GwangjuRoads.jsx   # 도로 렌더링
│   ├── GwangjuLandmarks.jsx / landmarkPositions.js
│   ├── KoreaMap.jsx       # Scene 00·01·02·03·09 한국 지도
│   ├── MapMarkers.jsx     # 지도 마커
│   ├── GwangjuBlockade.jsx # Scene 09 봉쇄 빗금
│   ├── Particles.jsx      # 강하 파티클
│   ├── TearGasParticles.jsx # Scene 04 최루탄
│   ├── VehicleConvoy.jsx  # Scene 05 차량 행렬
│   ├── FlashScene.jsx     # Scene 07 발포 플래시
│   ├── CnuMainBuilding.jsx   # Scene 03·04 전남대
│   ├── GwangjuMBCBuilding.jsx # Scene 06 GLB
│   ├── JeonilBuilding.jsx    # Scene 08 GLB
│   ├── DemocracySquare.jsx   # Scene 10 GLB
│   ├── ProvincialOffice.jsx  # Scene 11·12
│   ├── May18Cemetery.jsx     # Scene 13 GLB
│   └── ScrollSync.jsx
├── shaders/
│   ├── FilmEffect.jsx     # postprocessing Effect 래퍼
│   ├── film.frag.glsl     # 흑백 + grain + vignette
│   └── film.vert.glsl
├── ui/
│   ├── TextOverlay.jsx    # HTML 오버레이 (GSAP)
│   ├── HUDTimeline.jsx    # 우측 타임라인 HUD
│   ├── HUDLocation.jsx    # 현재 위치 HUD
│   ├── AutoPlayButton.jsx # 자동재생 / 배속 / 처음·끝 버튼
│   └── CustomScrollbar.jsx
├── store/                 # zustand 상태
└── utils/
    ├── osmLoader.js       # Overpass API fetch
    ├── geoToThree.js      # 위경도 → Three.js 좌표
    └── cameraPath.js      # CatmullRomCurve3 경로
data/
└── timeline.json          # 큐레이션된 역사 데이터
public/
└── models/
    ├── LICENSE.txt        # GLB 모델 저작자·URL·라이선스
    ├── gwangju-mbc.glb
    ├── jeonil-building.glb
    ├── gwangju-fountain.glb
    └── may18-cemetery.glb
```

## 씬별 상세 (14개)

| 씬  | 컴포넌트 중심                      | 날짜       | 설명                            |
| --- | ---------------------------------- | ---------- | ------------------------------- |
| 00  | KoreaMap                           | 1979.10.26 | 한국 지도, 박정희 사망 배경     |
| 01  | KoreaMap                           | 1979.12.12 | 12·12 군사 쿠데타               |
| 02  | KoreaMap                           | 1980년 봄  | 전국 민주화 시위                |
| 03  | KoreaMap → CnuMainBuilding         | 5.18 오전  | 지도 확대 → 전남대 정문         |
| 04  | CnuMainBuilding + TearGasParticles | 5.18 오전  | 공수부대 진압                   |
| 05  | VehicleConvoy                      | 5.20 밤    | 금남로 차량 시위                |
| 06  | GwangjuMBCBuilding ★               | 5.20 21:50 | 광주MBC 방화                    |
| 07  | FlashScene                         | 5.21 13:00 | 도청 앞 집단 발포               |
| 08  | JeonilBuilding ★                   | 5.21 오후  | 전일빌딩 헬기 사격 (탄흔 245개) |
| 09  | KoreaMap + GwangjuBlockade         | 5.21~5.22  | 광주 봉쇄 빨간 빗금             |
| 10  | DemocracySquare ★                  | 5.23 13:00 | 5.18민주광장 시민궐기대회       |
| 11  | ProvincialOffice                   | 5.27 04:00 | 장갑차 도청 진입                |
| 12  | ProvincialOffice                   | 항쟁 후    | 사망 165 · 행불 65 통계         |
| 13  | May18Cemetery ★                    | 현재       | 국립5.18민주묘지, 기억          |

★ = GLB 모델 사용 (CC BY-SA 4.0)

## 고정 HUD 요소

### HUD-A: 우측 타임라인 (HUDTimeline.jsx)

화면 우측 고정. 5.18 ~ 5.27 수직선, 현재 씬 날짜 강조.  
씬 00~02는 HUD 비표시 (항쟁 이전), 씬 03부터 fade in.  
씬 11은 5.27 → 붉은색 강조, 씬 13은 HUD 페이드 아웃.

### HUD-B: 위치명 (HUDLocation.jsx)

현재 씬 장소명 표시 (예: "전남대학교 정문", "금남로", "전남도청").

## 카메라 경로 개요

```
Scene 00~02  한국 지도 (정면 탑뷰)
Scene 03     지도 → 광주 → 전남대 확대
Scene 04~08  광주 거리 (저고도)
Scene 09     한국 지도 (봉쇄 시각화)
Scene 10~12  광주 도심 (1인칭)
Scene 13     천천히 상승 → 묘지 전경
```

카메라 경로: `CatmullRomCurve3` (`utils/cameraPath.js`)  
마우스 인터랙션 (Scene 03 이후): yaw ±8°, pitch ±4° (GSAP quickTo)

## 필름 셰이더 (film.frag.glsl)

`uProgress` (= `scroll.offset`) 기반 자동 전환:

- 0.0~0.5: 흑백 (grain 0.12)
- 0.5~0.75: 세피아 전환
- 0.75~1.0: 컬러 완전 복원 (grain 0.04)
- 비네팅: `mix(0.5, 0.2, uProgress)`

## 성능 주의사항

- `<Canvas gl={{ antialias: false }}>` — grain 셰이더가 AA 대체
- OSM 건물은 `InstancedMesh` (draw call 최소화)
- `ScrollControls damping={0.15}` — 과도한 업데이트 방지
- 한글 폰트: `font-display: swap`

## 3D 모델 라이선스 (CC BY-SA 4.0)

출처: 한국학중앙연구원 광주문화예술인문스토리플랫폼 (`dh.aks.ac.kr/~gwangju`)

| 파일                   | 씬  |
| ---------------------- | --- |
| `gwangju-mbc.glb`      | 06  |
| `jeonil-building.glb`  | 08  |
| `gwangju-fountain.glb` | 10  |
| `may18-cemetery.glb`   | 13  |

의무: 저작자 표시 + 동일 조건 변경 허락 → 프로젝트도 CC BY-SA 4.0으로 공개.  
다운로드 시 `Referer: https://dh.aks.ac.kr/~gwangju/` 헤더 필요 (404 우회).

## 사실 검증 출처

| 사건                         | 출처                                   |
| ---------------------------- | -------------------------------------- |
| 일별 사건 시각 (5.18~5.27)   | 5·18민주화운동기록관 + 한국어 위키백과 |
| 광주MBC 방화 21:50           | 위키백과                               |
| 도청 앞 집단발포 13:00       | 5·18민주화운동기록관                   |
| 제1차 시민궐기대회 5.23 13시 | 위키백과                               |
| 도청 진압 5.27 04시          | 5·18민주화운동기록관                   |
| 전일빌딩 245 탄흔 (2017)     | 국립과학수사연구원 공식 감정           |
| 사망 165 · 행불 65           | 5·18 유공자 유족회 등 4개 단체 발표    |

> 사상자 통계는 발표 기관별 수치 차이가 있다 (광주광역시 2009: 사망 163명, 부상 3,139명 등).  
> 본 프로젝트는 4개 단체 합의 수치를 기준으로 하되 통계가 단일하지 않음을 명시한다.
