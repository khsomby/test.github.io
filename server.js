const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();

const conversationHistory = {};

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
  const { sessionId, query } = req.body;

  if (!conversationHistory[sessionId]) {
    conversationHistory[sessionId] = [];
  }

  const conversation = conversationHistory[sessionId];
  conversation.push({ role: 'user', content: query });

  try {
    const response = await axios.post(
      'https://typli.ai/api/generators/completion',
      {
        prompt: conversation.map(turn => turn.content).join('\n'),
        temperature: 1.2,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer undefined',
        },
      }
    );

    const botResponse = response.data;
    conversation.push({ role: 'bot', content: botResponse });

    res.json({ response: botResponse });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate text. Please try again later.' });
  }
});

module.exports = app;
