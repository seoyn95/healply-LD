import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// 배포하면 api/nickname.js 는 Vercel 이 알아서 서버리스 함수로 띄운다.
// 개발 서버(npm run dev)에는 그런 게 없어서, 같은 파일을 여기서 직접 붙여 준다.
function apiDev() {
  return {
    name: 'api-dev',
    configureServer(server) {
      server.middlewares.use('/api/nickname', async (req, res, next) => {
        try {
          const mod = await server.ssrLoadModule('/api/nickname.js')

          // Vercel 이 해 주는 일(body 파싱, res.status/json)을 흉내 낸다
          let raw = ''
          for await (const chunk of req) raw += chunk
          req.body = raw ? JSON.parse(raw) : {}

          res.status = (code) => {
            res.statusCode = code
            return res
          }
          res.json = (data) => {
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify(data))
          }

          await mod.default(req, res)
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // .env.local 의 OPENAI_API_KEY 를 개발 서버 프로세스에도 넣어 준다.
  // (Vite 는 원래 VITE_ 로 시작하는 값만 다루기 때문에 이 줄이 필요하다)
  const env = loadEnv(mode, process.cwd(), '')
  if (env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = env.OPENAI_API_KEY

  return { plugins: [react(), apiDev()] }
})
