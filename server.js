const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const googleTTS = require('google-tts-api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Text-to-Speech backend server is running and ready!',
    usage: 'Send a POST request to /api/tts with { text, language, gender }'
  });
});

const audioDir = path.join(__dirname, 'public', 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}
app.use('/audio', express.static(audioDir));

async function translateText(inputText, targetLang) {
  try {
    const langCode = targetLang ? targetLang.split('-')[0].toLowerCase() : 'hi';
    
    if (langCode === 'en') {
      return inputText;
    }

    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(inputText)}&langpair=en|${langCode}`
    );
    const data = await response.json();
    
    if (data && data.responseData && data.responseData.translatedText) {
      const translated = data.responseData.translatedText;
      if (translated.toLowerCase().includes('select two distinct languages')) {
        return inputText;
      }
      return translated;
    }
  } catch (err) {
    console.error('Translation error:', err);
  }
  return inputText;
}

// Endpoint to handle text-to-speech synthesis
app.post('/api/synthesize', async (req, res) => {
  try {
    const { text, gender } = req.body;
    
    const apiKey = process.env.TTS_API_KEY;
    const endpoint = process.env.TTS_ENDPOINT;

    if (!apiKey || apiKey === 'your_actual_tts_api_key_here') {
      return res.status(400).json({ error: 'Please update your TTS_API_KEY in the .env file.' });
    }

    // Call Google Cloud TTS API with explicit gender handling
    const response = await axios.post(`${endpoint}?key=${apiKey}`, {
      input: { text: text || 'Hello' },
      voice: {
        languageCode: 'en-US',
        ssmlGender: gender === 'MALE' ? 'MALE' : 'FEMALE',
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('TTS API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to synthesize speech' });
  }
});

// POST /api/tts endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, language, gender } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Text cannot be empty.' });
    }

    // Step 1: Translate text on the server
    const translatedText = await translateText(text, language || 'hi-IN');
    const langCode = language ? language.split('-')[0] : 'hi';

    console.log(`Generating TTS -> Language: ${langCode}, Gender Requested: ${gender || 'female'}`);

    // Step 2: Generate audio base64 safely on server
    const base64Audio = await googleTTS.getAudioBase64(translatedText, {
      lang: langCode,
      slow: false,
      host: 'https://translate.google.com',
      timeout: 15000,
    });

    const fileName = `speech-${Date.now()}.mp3`;
    const filePath = path.join(audioDir, fileName);

    fs.writeFileSync(filePath, Buffer.from(base64Audio, 'base64'));

    return res.status(200).json({
      success: true,
      translatedText,
      audioUrl: `/audio/${fileName}`
    });

  } catch (error) {
    console.error('TTS Generation Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate speech audio.' });
  }
});

app.listen(PORT, () => {
  console.log(`TTS Backend Server running on http://localhost:${PORT}`);
});