import fs from 'fs';
import path from 'path';
import multer from 'multer';
import axios from 'axios';

// Multer storage config - files saved in /uploads folder
const upload = multer({ dest: path.join(process.cwd(), 'uploads/') });

// Maturity indicators
const maturityIndicators = {
  Tomato: "fully red, soft touch, drying stem",
  Wheat: "golden grain, dry brittle stem",
  Maize: "dented firm kernels, dry husk",
  Rice: "80-90% grains golden, bent panicle",
  Chickpea: "pods turn yellow, dry plant, seeds harden",
  Kidneybeans: "pods dry and yellow, seeds firm",
  Pigeonpeas: "yellowing leaves, dry pods",
  Mothbeans: "dry pods, hardened seeds, brown leaves",
  Mungbean: "70-80% pods turn black or brown",
  Blackgram: "pods mature black/dark brown, dry stem",
  Lentil: "yellow-brown pods, dry leaves",
  Pomegranate: "skin turns deep red, makes metallic sound on tap",
  Banana: "tips of fingers rounded, slight yellow tint",
  Mango: "shoulder rises, skin yellow-reddish, mild aroma",
  Grapes: "berries full-colored, sweet taste, soft skin",
  Watermelon: "dull skin, dry tendril, yellow underside",
  Muskmelon: "netting on rind, fruity smell, slight softness at stem",
  Apple: "full color, seeds brown, firm but not hard",
  Orange: "uniform color, slightly soft to touch",
  Papaya: "yellow-orange skin, soft flesh",
  Coconut: "brown shell, sloshing sound inside",
  Cotton: "fully open bolls, dry fluffy fibers",
  Jute: "plants yellowing, early flowering stage",
  Coffee: "cherries turn bright red, firm but not hard"
};

const assessCropMaturity = async (req, res) => {
  const { cropType, location, season } = req.body;
  const imageFile = req.file;

  if (!imageFile) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  try {
    const indicatorsText = Object.entries(maturityIndicators)
      .map(([crop, sign]) => `- ${crop}: ${sign}`)
      .join('\n');

    const YOUR_DOMAIN = process.env.DOMAIN || 'http://localhost:3000';
    const publicUrl = `${YOUR_DOMAIN}/uploads/${imageFile.filename}`;

    const prompt = `
You are a crop maturity assessment AI. Evaluate the crop maturity using these indicators:

${indicatorsText}

Crop Type: ${cropType}
Location: ${location}
Season: ${season}

Image URL: ${publicUrl}

Is the crop mature and ready to harvest? Provide reasons.
`.trim();

    const maxTokens = 35;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3-opus',
        messages: [
          { role: 'system', content: `You are a crop maturity classifier. Only return responses in this format:
<Maturity Status> <Crop Name> – Confidence Level <XX>%.
Examples:
- Fully Matured Wheat – Confidence Level 93%
- Partially Matured Tomato – Confidence Level 88%
Do not explain or provide any extra text. Do not include "According to the image" or similar phrases.` },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://yourdomain.com',
          'X-Title': 'Crop Maturity Checker'
        }
      }
    );

    // Check for errors or unexpected responses
    if (!response.data) {
      console.error('No data in API response', response);
      return res.status(500).json({ error: 'No data in API response' });
    }

    // Handle API error format explicitly
    if (response.data.error) {
      console.error('API returned error:', response.data.error);
      return res.status(500).json({ error: response.data.error.message || 'API returned an error' });
    }

    // Check if choices array exists and is valid
    if (
      !Array.isArray(response.data.choices) ||
      response.data.choices.length === 0 ||
      !response.data.choices[0].message ||
      !response.data.choices[0].message.content
    ) {
      console.error('Unexpected API response structure:', response.data);
      return res.status(500).json({ error: 'Invalid response from Claude API' });
    }

    const reply = response.data.choices[0].message.content;

    // Clean up uploaded file
    fs.unlinkSync(imageFile.path);

    res.json({ result: reply });
  } catch (err) {
    console.error('Claude API Error:', err?.response?.data || err.message || err);

    // Handle rate-limit or quota exceeded
    if (err?.response?.data?.error?.code === 402) {
      return res.status(429).json({ error: 'API quota exceeded or insufficient credits' });
    }

    res.status(500).json({ error: 'Claude API error' });
  }
};

export {assessCropMaturity}

