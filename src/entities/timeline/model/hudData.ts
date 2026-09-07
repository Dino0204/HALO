export interface SceneHudEntry {
  visible: boolean
  date: string | null
  location: {
    region: string | null
    place: string | null
  }
}

export const SCENE_HUD_DATA: Record<number, SceneHudEntry> = {
  0: { visible: false, date: null, location: { region: '대한민국', place: null } },
  1: { visible: false, date: '1979.12.12', location: { region: '대한민국', place: '서울' } },
  2: {
    visible: false,
    date: '1980년 봄',
    location: { region: '대한민국', place: '전국 주요 도시' },
  },
  3: { visible: true, date: '5.18', location: { region: '광주', place: '전남대학교' } },
  4: { visible: true, date: '5.18', location: { region: '광주', place: '전남대학교 정문' } },
  5: { visible: true, date: '5.20', location: { region: '광주', place: '금남로' } },
  6: { visible: true, date: '5.20', location: { region: '광주', place: '광주MBC' } },
  7: { visible: true, date: '5.21', location: { region: '광주', place: '금남로' } },
  8: { visible: true, date: '5.21', location: { region: '광주', place: '전일빌딩' } },
  9: { visible: true, date: '5.21', location: { region: '광주', place: null } },
  10: { visible: true, date: '5.23', location: { region: '광주', place: '도청 앞 광장' } },
  11: { visible: true, date: '5.27', location: { region: '광주', place: '전남도청' } },
  12: { visible: true, date: '5.27', location: { region: '광주', place: null } },
  13: { visible: false, date: null, location: { region: null, place: null } },
}

export const DATE_PROGRESS: Record<string, number> = {
  '5.18': 0 / 9,
  '5.19': 1 / 9,
  '5.20': 2 / 9,
  '5.21': 3 / 9,
  '5.22': 4 / 9,
  '5.23': 5 / 9,
  '5.24': 6 / 9,
  '5.25': 7 / 9,
  '5.26': 8 / 9,
  '5.27': 9 / 9,
}
