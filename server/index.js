// .env의 키 불러오기
require('dotenv').config()
// 서버 도구 꺼내기
const express = require('express')
// 다른 주소(화면)에서 온 요청 허용용
const cors = require('cors')
// 서버 본체 만들기
const app = express()

// 화면(다른 주소)에서 온 요청 허용
app.use(cors())
// 보내온 JSON을 req.body로 풀어줌
app.use(express.json())

// 화면이 부를 창구
app.post('/api/chat', async (req, res) => {
  // 서버만 아는 키 (금고)
  const key = process.env.GROQ_API_KEY
  // 키 없어도 멈추지 않게 가짜 답
  if (!key) return res.json({ reply: '(mock) ' + req.body.prompt })

  // 서버가 Groq에 대신 호출
  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    // 키는 여기 헤더에만
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify({
      // 쓸 AI 모델
      model: 'llama-3.1-8b-instant',
      // 화면이 보낸 질문 그대로 전달
      messages: [{ role: 'user', content: req.body.prompt }]
    })
  })
  // Groq 응답 받기
  const data = await groqRes.json()
  // AI 답만 화면으로 돌려줌
  res.json({ reply: data.choices?.[0]?.message?.content || '(응답 없음)' })
})

// 3000번은 다른 실습 서버가 사용 중이므로 3001번 포트 사용
const PORT = 3001

const server = app.listen(PORT, () => {
  console.log(`Groq 서버 실행: http://localhost:${PORT}`)
})

server.on('error', (error) => {
  console.error('서버 실행 실패:', error.message)
})
