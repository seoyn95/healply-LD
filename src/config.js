// 럭키드로우 설정

// weight 는 상대 비율
// 지금은 키캡 55 : 간식 40 : 꽝 5
export const PRIZES = [
  {
    id: 'keycap',
    name: '키캡',
    desc: '오늘의 한 타를 더 기분 좋게',
    image: '/prize/keycap.png',
    color: 'var(--chip-purple)',
    weight: 25,
  },
  {
    id: 'snack',
    name: '간식',
    desc: '잘한 만큼 달콤하게',
    image: '/prize/icecream.png',
    color: 'var(--chip-yellow)',
    weight: 70,
  },
  {
    id: 'miss',
    name: '꽝',
    desc: '별명은 챙겨 가세요!',
    image: '/prize/miss.png',
    color: 'var(--chip-blue)',
    weight: 5,
  },
]

// 뽑기 전에 카드에 띄워 둘 화면
export const IDLE = {
  id: 'idle',
  name: '오늘의 행운 뽑기',
  desc: '잘한 일을 한 줄 적어 주세요',
  image: '/prize/gift.png',
  color: 'var(--chip-blue)',
}

// 룰렛이 도는 최소 시간(ms).
export const SPIN_MS = 2000

// 룰렛에서 상품이 바뀌는 간격(ms)
export const SPIN_TICK_MS = 90

// 입력 글자 수 제한
export const MAX_LENGTH = 200

// 서버가 실패했을 때 대신 쓸 칭호
export const FALLBACK_NICKNAME = {
  nickname: '오늘도 해낸 고양이',
  line: '무엇을 하셨든 여기까지 온 것만으로 칭호는 충분합니다.',
}

// 상태별 캐릭터 말풍선 문구
export const BUBBLE = {
  input: '이번 주 잘한 일, 한 줄만 적어 주세요!',
  drawing: '두구두구두구...',
  result: '축하해요! 다시 하려면 아래 버튼!',
}

// 결과 화면에 뿌릴 색종이 조각
export const CONFETTI = ['#FABF4D', '#66C78C', '#3E629F', '#F6D8D5', '#DCE7FF', '#F3E4F7']

// weight 를 반영해서 상품 하나를 고른다.
export function pickPrize() {
  const total = PRIZES.reduce((sum, prize) => sum + prize.weight, 0)
  let point = Math.random() * total

  for (const prize of PRIZES) {
    point -= prize.weight
    if (point < 0) return prize
  }

  return PRIZES[0] // 소수점 오차로 여기까지 오면 첫 상품
}
