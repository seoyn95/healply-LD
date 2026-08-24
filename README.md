# healply LUCKY DRAW

헬플리 앱을 홍보할 때 부스에서 돌리는 럭키드로우 화면입니다.

이번 주에 자기를 챙긴 일을 한 줄 적으면, 그동안 룰렛이 돌고
고양이 칭호와 경품이 함께 나옵니다.

```
입력  →  한 줄 적고 Enter
뽑기  →  룰렛이 도는 동안 칭호를 지어 온다 (최소 2초)
결과  →  「아스팔트를 길들인 고양이」 + 경품
```

## 실행

```bash
npm ci
npm run dev
```

칭호를 지으려면 OpenAI 키가 필요합니다. `.env.example` 을 `.env.local` 로
복사하고 키를 넣으세요. 키가 없어도 화면은 돌아가고, 칭호만 기본값으로 나옵니다.

```
OPENAI_API_KEY=sk-proj-...
```

`.env.local` 은 git 에 올라가지 않습니다. 키는 브라우저로 나가지 않고
`api/nickname.js` 안에서만 쓰입니다.

## 폴더 구조

```
api/nickname.js   칭호를 지어 주는 서버. 프롬프트도 여기 있다
src/config.js     경품 · 확률 · 화면 문구. 바꿀 일이 있으면 여기부터
src/App.jsx       화면 하나가 전부다 (입력 · 뽑기 · 결과)
src/App.css       화면 스타일
src/index.css     색 · 글꼴 · 여백. 앱의 lib/theme.js 를 옮긴 것
public/prize/     경품 그림
public/character/ 캐릭터 그림
```

## 경품과 확률

`src/config.js` 의 `PRIZES` 를 고칩니다. `weight` 는 상대 비율이라
합이 100이 아니어도 됩니다. 지금은 키캡 55 : 간식 40 : 꽝 5 입니다.

경품을 늘리거나 줄여도 화면은 알아서 따라갑니다.

## 칭호 문구

`api/nickname.js` 의 `SYSTEM` 이 프롬프트입니다.
말투나 길이를 바꾸려면 규칙보다 **아래쪽 예시**를 원하는 모양으로 고치는 편이 빠릅니다.

서버 코드라서 고친 뒤에는 dev 서버를 껐다 켜야 반영됩니다.

## 배포

Vercel 에 그대로 올리면 `api/nickname.js` 가 서버리스 함수가 됩니다.
프로젝트 설정 > Environment Variables 에 `OPENAI_API_KEY` 를 같은 이름으로 넣으세요.

## 그림 출처

경품 · 캐릭터 그림은 [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (MIT) 입니다.
