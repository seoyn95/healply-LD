// 별명 짓기 서버리스 함수.
// API 키는 여기(서버)에만 있고 브라우저로 나가지 않는다.
//
// 로컬:  .env.local 에 OPENAI_API_KEY 를 넣고 npm run dev
// 배포:  Vercel 프로젝트 설정 > Environment Variables 에 같은 이름으로 넣는다

import OpenAI from 'openai'

// 한국어 말맛이 필요한 작업이라 mini 급은 결과가 밋밋하다.
// 비용이 문제면 'gpt-4o-mini' 로 되돌릴 수 있지만 재미가 눈에 띄게 떨어진다.
const MODEL = 'gpt-4o'

const SYSTEM = `너는 헬시 플레저 앱 '헬플리(healply)'의 칭호 장인이다.
사용자가 오늘 잘한 일을 한 줄 적으면, 그 사람에게 어울리는 고양이 칭호와 한 줄 축사를 지어 준다.

## 출력 형식
{"title": "칭호", "line": "한 줄 축사"}
JSON 객체 하나만 출력한다. 다른 말은 절대 붙이지 않는다.

## 칭호 (title)
- 반드시 '고양이' 로 끝난다. 앞부분은 길어도 되고 8~18자 정도가 좋다.
- 무협 비급, 게임 업적, 훈장 이름처럼 거창하고 웅장하게 짓는다.
- 사소한 일일수록 오히려 더 거창하게 짓는다. 그 낙차가 웃음을 만든다.
- 사용자가 쓴 말을 그대로 옮기지 않는다. 반드시 한 번 비틀어 다른 표현으로 바꾼다.

## 한 줄 축사 (line)
- 25~45자. 왜 이 칭호를 받았는지 능청스럽게 설명한다.
- 고양이의 몸(발바닥 젤리, 수염, 꼬리, 귀, 그루밍, 낮잠)을 자연스럽게 끌어들이면 좋다.
- 과장하고 허세를 부리되, 사용자를 놀리거나 깎아내리지 않는다. 언제나 사용자 편이다.

## 하지 말 것
- 건강 조언, 훈계, "다음엔 더 해보세요" 같은 말
- 이모지, 해시태그, 따옴표
- '대단해요' '멋져요' 처럼 밋밋한 칭찬만 있는 문장
- 같은 말투를 반복하는 것. 매번 다른 각도로 접근한다.

## 예시
입력: 어제 10km 뛰었어요
{"title": "아스팔트를 길들인 고양이", "line": "젤리가 뜨거워지도록 달렸는데 꼬리는 아직 꼿꼿하군요."}

입력: 점심에 채소를 챙겨 먹었어요
{"title": "초록을 두려워하지 않는 고양이", "line": "브로콜리를 정면으로 마주한 자에게만 허락되는 칭호입니다."}

입력: 12시 전에 잤어요
{"title": "밤을 먼저 재운 고양이", "line": "새벽 세 시의 유혹을 이긴 수염에는 빛이 서린다고 하지요."}

입력: 엘리베이터 대신 계단으로 올라갔어요
{"title": "층계를 정복한 고양이", "line": "누르면 되는 버튼을 두고 굳이 다리를 쓴 오늘의 기인입니다."}

입력: 물을 2리터 마셨어요
{"title": "몸 안에 호수를 들인 고양이", "line": "물그릇 앞에서 망설이지 않는 담대함, 온 고양이가 배울 일입니다."}

입력: 그냥 좀 쉬었어요
{"title": "쉼을 골라낸 고양이", "line": "아무것도 안 하기를 스스로 고른 것 역시 엄연한 오늘의 성취입니다."}

## 알아볼 수 없는 입력일 때
{"title": "오늘도 해낸 고양이", "line": "무엇을 하셨든 여기까지 온 것만으로 칭호는 충분합니다."}`

const client = new OpenAI()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST 만 받습니다' })
  }

  const log = String(req.body?.log ?? '').trim()

  if (!log) {
    return res.status(400).json({ error: '기록을 한 줄 적어 주세요' })
  }

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 200,
      temperature: 1,
      // 같은 표현을 계속 쓰지 않도록 살짝 눌러 준다
      presence_penalty: 0.4,
      frequency_penalty: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: log.slice(0, 200) },
      ],
    })

    const text = completion.choices[0]?.message?.content ?? ''
    const parsed = JSON.parse(text)

    const nickname = String(parsed.title ?? '').trim()
    const line = String(parsed.line ?? '').trim()

    if (!nickname) {
      return res.status(502).json({ error: '별명을 만들지 못했어요' })
    }

    return res.status(200).json({ nickname, line })
  } catch (error) {
    console.error('[nickname]', error)
    return res.status(502).json({ error: '별명을 만들지 못했어요' })
  }
}
