const Groq = require('groq-sdk');
const { podcasts } = require('../data/podcasts');
const { fetchYouTubeVideos } = require('./episodes');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Episode ID is required' });

  // Look up in static data first, then YouTube cache
  let episode = podcasts.find(p => p.id === id || p.youtubeId === id);

  if (!episode) {
    try {
      const ytVideos = await fetchYouTubeVideos();
      const yt = ytVideos.find(v => v.youtubeId === id || v.id === id);
      if (yt) {
        episode = {
          title: yt.title,
          guest: yt.guest,
          company: 'Talkiepedia',
          description: yt.description || yt.title,
          tags: [yt.category]
        };
      }
    } catch {}
  }

  if (!episode) return res.status(404).json({ error: 'Episode not found' });

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are TalkieAI. Generate a concise, engaging 3-bullet summary of a podcast episode based on its metadata. Each bullet should be one sentence highlighting a key insight or takeaway. Format as plain text bullets starting with •'
        },
        {
          role: 'user',
          content: `Summarize this episode:\nTitle: ${episode.title}\nGuest: ${episode.guest} from ${episode.company}\nDescription: ${episode.description}\nTags: ${episode.tags.join(', ')}`
        }
      ],
      max_tokens: 180,
      temperature: 0.6
    });

    const summary = completion.choices[0].message.content.trim();
    res.status(200).json({ summary, title: episode.title, guest: episode.guest });
  } catch (err) {
    res.status(500).json({ error: 'AI service unavailable. Please try again.' });
  }
};
