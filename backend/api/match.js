const Groq = require('groq-sdk');
const { podcasts: fallback } = require('../data/podcasts');
const { fetchYouTubeVideos } = require('./episodes');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { goal, excludeIndex } = req.body;
  if (!goal) return res.status(400).json({ error: 'Goal is required' });
  if (goal.length > 300) return res.status(400).json({ error: 'Input too long.' });
  const blocked = ['ignore previous', 'ignore above', 'disregard', 'forget instructions', 'act as', 'jailbreak', 'system prompt', 'you are now', 'pretend you'];
  if (blocked.some((p) => goal.toLowerCase().includes(p))) {
    return res.status(400).json({ error: 'Invalid input.' });
  }

  // Fetch live YouTube videos, fall back to static data
  let episodes;
  try {
    episodes = await fetchYouTubeVideos();
  } catch {
    episodes = fallback.map(p => ({
      youtubeId: p.youtubeId,
      title: p.title,
      guest: p.guest,
      category: p.category,
      description: p.description,
      url: p.url
    }));
  }

  // Build episode list for LLM — only IDs and metadata, never URLs
  const podcastList = episodes.map((p, i) =>
    `INDEX: ${i} | Title: "${p.title}" | Guest: ${p.guest} | Category: ${p.category} | Description: ${p.description?.slice(0, 120) || ''}`
  ).join('\n');

  const excludeHint = (typeof excludeIndex === 'number' && excludeIndex >= 0)
    ? `\n- Do NOT pick INDEX ${excludeIndex} again if other suitable options exist.`
    : '';

  const systemPrompt = `You are TalkieAI, a podcast recommendation engine for Talkiepedia.
Given a user's career goal, pick the single best matching episode from the list below and explain why in 2 sentences.

AVAILABLE EPISODES:
${podcastList}

Rules:
- You MUST only pick an INDEX number from the list above.
- Never invent episodes or URLs.${excludeHint}

Respond ONLY in this exact JSON format (no markdown, no extra text):
{
  "index": 0,
  "reason": "Why this episode is the best match in 2 sentences."
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `My career goal or interest: ${goal}` },
        { role: 'system', content: 'IMPORTANT: If the user input is not related to careers, jobs, skills, learning, or professional growth, respond ONLY with this exact JSON: {"index": -1, "reason": "off-topic"}' }
      ],
      max_tokens: 200,
      temperature: 0.4
    });

    const raw = completion.choices[0].message.content.trim();
    const cleaned = raw.replace(/```json|```/g, '').trim();

    let match;
    try {
      match = JSON.parse(cleaned);
    } catch {
      match = { index: 0, reason: 'This is a great episode to start your career journey.' };
    }

    // Guardrail: reject off-topic inputs
    if (match.index === -1 || match.reason === 'off-topic') {
      return res.status(400).json({ error: 'Please enter a career-related goal or interest to get a podcast recommendation.' });
    }

    // Always use episode data from our source — never trust LLM for URLs
    const idx = typeof match.index === 'number' && match.index >= 0 && match.index < episodes.length ? match.index : 0;
    const episode = episodes[idx];

    res.status(200).json({
      title: episode.title,
      reason: match.reason,
      url: episode.url,
      youtubeId: episode.youtubeId,
      guest: episode.guest,
      category: episode.category,
      year: episode.publishedAt ? new Date(episode.publishedAt).getFullYear() : 2024,
      pickedIndex: idx
    });
  } catch (err) {
    res.status(500).json({ error: 'AI service unavailable. Please try again.' });
  }
};
