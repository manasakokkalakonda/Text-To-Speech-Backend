let favoriteLibrary = [
  { id: 1, text: 'Welcome to VoiceCraft Studio!', language: 'en-US', voice: 'English (US)' },
  { id: 2, text: '¡Bienvenido a la aplicación de conversión!', language: 'es-ES', voice: 'Spanish (Spain)' }
];

let historyLibrary = [];
let usageStats = { totalRequests: 0, totalCharsProcessed: 0, formatsExported: { mp3: 0, wav: 0 } };

const handleTextToSpeech = async (req, res, next) => {
  try {
    const { text, language, voice, rate = 1, pitch = 1, audioFormat = 'mp3' } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, error: 'Text must not be empty.' });
    }
    if (text.length > 5000) {
      return res.status(400).json({ success: false, error: 'Text exceeds maximum character limit of 5000.' });
    }

    // Update telemetry stats
    usageStats.totalRequests += 1;
    usageStats.totalCharsProcessed += text.length;
    if (audioFormat === 'wav') usageStats.formatsExported.wav += 1;
    else usageStats.formatsExported.mp3 += 1;

    // Log to server history buffer
    const historyItem = { 
      id: Date.now(), 
      text: text.slice(0, 40) + (text.length > 40 ? '...' : ''), 
      language, 
      rate, 
      pitch, 
      audioFormat,
      timestamp: new Date().toLocaleTimeString() 
    };
    historyLibrary.unshift(historyItem);
    if (historyLibrary.length > 20) historyLibrary.pop();

    return res.status(200).json({
      success: true,
      message: `Day 14 multi-format pipeline active (${audioFormat.toUpperCase()}).`,
      config: { text, language, voice, rate, pitch, audioFormat },
      downloadEndpoint: `http://localhost:5000/api/download-audio?format=${audioFormat}`
    });

  } catch (error) {
    next(error);
  }
};

const handleGetVoices = (req, res) => {
  res.status(200).json({
    voices: [
      { name: 'English (US)', language: 'en-US', gender: 'Female' },
      { name: 'Spanish (Spain)', language: 'es-ES', gender: 'Female' },
      { name: 'Hindi (India)', language: 'hi-IN', gender: 'Female' },
      { name: 'French (France)', language: 'fr-FR', gender: 'Female' }
    ]
  });
};

// Day 14: Consolidated Sync Endpoint for UI initial load / refresh
const handleGetDashboardSync = (req, res) => {
  res.status(200).json({
    success: true,
    favorites: favoriteLibrary,
    history: historyLibrary,
    stats: usageStats
  });
};

const handleSaveFavorite = (req, res) => {
  const { text, language, voice } = req.body;
  if (!text || !language) {
    return res.status(400).json({ success: false, error: 'Text and language are required.' });
  }
  const newFavorite = { id: Date.now(), text, language, voice };
  favoriteLibrary.unshift(newFavorite);
  res.status(201).json({ success: true, message: 'Saved successfully!', favorite: newFavorite });
};

const handleDownloadAudio = (req, res) => {
  const format = req.query.format || 'mp3';
  const sampleAudioUrl = format === 'wav' 
    ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' 
    : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  res.status(200).json({
    success: true,
    message: `Audio file ready in .${format} format.`,
    fileUrl: sampleAudioUrl,
    format
  });
};

module.exports = { 
  handleTextToSpeech, 
  handleGetVoices, 
  handleGetDashboardSync,
  handleSaveFavorite, 
  handleDownloadAudio 
};