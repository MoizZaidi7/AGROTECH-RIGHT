const axios = require('axios');
require('dotenv').config();

const translateText = async (req, res) => {
  const { text } = req.body;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Translate the following text from English to Urdu.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const translated = response.data.choices[0].message.content.trim();
    res.status(200).json({ translated });
  } catch (error) {
    console.error('Translation error:', error.message);
    res.status(500).json({ error: 'Translation failed.' });
  }
};

module.exports = { translateText };
