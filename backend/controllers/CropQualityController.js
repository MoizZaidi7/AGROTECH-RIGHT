import fs from 'fs';
import path from 'path';
import multer from 'multer';
import axios from 'axios';

// Multer storage config - files saved in /uploads folder
const upload = multer({ dest: path.join(process.cwd(), 'uploads/') });

// Quality indicators based on crop type
const qualityIndicators = {
  Tomato: "Bright red color, firm texture, sugar content > 6%, minimal blemishes",
  Wheat: "Golden grains, high protein content > 12%, low moisture < 12%",
  Maize: "Uniform kernels, starch content > 70%, minimal kernel damage",
  Rice: "Uniform grains, low moisture < 13%, no broken grains",
  Chickpea: "Uniform size, low moisture < 10%, firm texture",
  Kidneybeans: "Bright color, firm texture, moisture < 14%",
  Pigeonpeas: "Uniform size, smooth surface, minimal pest damage",
  Mothbeans: "Uniform size, high protein content > 20%, low moisture",
  Mungbean: "Bright green color, firm texture, minimal foreign matter",
  Blackgram: "Dark black color, firm texture, no cracks",
  Lentil: "Uniform size, firm texture, low moisture < 12%",
  Pomegranate: "Bright red skin, high juice content, firm texture",
  Banana: "Uniform size, smooth skin, slight yellow tint",
  Mango: "Bright color, juicy, high sugar content > 14%",
  Grapes: "Uniform size, sweet (sugar > 18%), firm skin",
  Watermelon: "Uniform color, firm rind, high sugar content > 12%",
  Muskmelon: "Smooth rind, strong aroma, firm texture",
  Apple: "Firm texture, sweet (sugar > 12%), minimal bruises",
  Orange: "Uniform color, firm texture, high juice content",
  Papaya: "Bright orange skin, soft flesh, minimal blemishes",
  Coconut: "Brown shell, firm white meat, clear liquid inside",
  Cotton: "Clean, white fibers, high fiber strength",
  Jute: "Long fibers, minimal breakage, golden-brown color",
  Coffee: "Bright red cherries, uniform size, low moisture < 12%"
};


const assessCropQuality = async (req, res) => {
  const { cropType, starch, sugar, texture, moistureContent } = req.body;
  const imageFile = req.file;

  if (!imageFile) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  try {
    const indicatorsText = Object.entries(qualityIndicators)
      .map(([crop, sign]) => `- ${crop}: ${sign}`)
      .join('\n');

    const YOUR_DOMAIN = process.env.DOMAIN || 'http://localhost:3000';
    const publicUrl = `${YOUR_DOMAIN}/uploads/${imageFile.filename}`;

    const predictionData = {
      'Crop Name': cropType,
      'Starch (%)': parseFloat(starch) || 0,
      'Sugar Content (°Brix)': parseFloat(sugar) || 0,
      'Texture': texture || 'Unknown',
      'Moisture (%)': parseFloat(moistureContent)
    };

    const prompt = `
You are a crop quality assessment AI. Evaluate the crop quality using these indicators and input data:

${indicatorsText}

Input Data:
${JSON.stringify(predictionData, null, 2)}

Image URL: ${publicUrl}

Assess the crop quality and provide a rating (e.g., Excellent, Good, Fair, Poor).
`.trim();

    const maxTokens = 15;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3-opus',
        messages: [
          { role: 'system', content: `You are a crop quality classifier. Respond in this format:
<Quality Rating> <Crop Name> – Confidence Level <XX>%.
Examples:
- Excellent Quality Apple – Confidence Level 95%
- Fair Quality Mango – Confidence Level 75%
Do not provide explanations.` },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CROPQUALITY_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://yourdomain.com',
          'X-Title': 'Crop Quality Checker'
        }
      }
    );

    if (!response.data) {
      console.error('No data in API response', response);
      return res.status(500).json({ error: 'No data in API response' });
    }

    if (response.data.error) {
      console.error('API returned error:', response.data.error);
      return res.status(500).json({ error: response.data.error.message || 'API returned an error' });
    }

    const reply = response.data.choices[0]?.message?.content;

    fs.unlinkSync(imageFile.path);

    res.json({ result: reply });
  } catch (err) {
    console.error('Claude API Error:', err?.response?.data || err.message || err);
    res.status(500).json({ error: 'API error during crop quality assessment' });
  }
};

export { assessCropQuality };
