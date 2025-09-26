// server.js
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// 中间件，用于解析JSON请求体
app.use(express.json());

// 设置API密钥（从环境变量获取，避免硬编码）
const API_KEY = process.env.DEEPSEEK_API_KEY;

// 定义一个路由，用于处理AI请求
app.post('/api/ai', async (req, res) => {
  try {
    // 从请求体中获取用户输入
    const { message } = req.body;

    // 调用AI API（这里以OpenAI为例）
    const response = await axios.post('https://api.deepseek.com/v1/chat', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }]
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // 将AI的响应返回给前端
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '调用AI API时发生错误' });
  }
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});