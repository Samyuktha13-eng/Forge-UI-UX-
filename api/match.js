const Groq = require('groq-sdk');
const { podcasts } = require('../data/podcasts');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const podcastList = podcasts.map(p =>
  `ID: ${p.id} | Title: "${p.title}" | Guest: ${p.guest} | Company: ${p.company} | Category: ${p.category} | Tags: ${p.tags.join(', ')}`
).join('\n');

const systemPrompt = `You are TalkieAI, a podcast recommendation engine for Talkiepedia.
Given a user's career goal or interest, pick the single best matching episode ID from the list below and explain why in 2 sentences.

AVAILABLE EPISODES:
${podcastList}

Rules:
- You MUST only pick an ID from the list above. Never invent a new ID.
- Never generate or guess YouTube URLs. Only return the ID and reason.

Respond ONLY in this exact JSON format (no markdown, no extra text):
{
  "id": "episode-id-from-list-above",
  "reason": "Why this episode is the best match in 2 sentences."
}`;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { goal } = req.body;
  if (!goal) return res.status(400).json({ error: 'Goal is required' });
  if (goal.length > 300) return res.status(400).json({ error: 'Input too long.' });
  const blocked = ['ignore previous', 'ignore above', 'disregard', 'forget instructions', 'act as', 'jailbreak'];
  if (blocked.some((p) => goal.toLowerCase().includes(p))) {
    return res.status(400).json({ error: 'Invalid input.' });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `My career goal or interest: ${goal}` }
      ],
      max_tokens: 200,
      temperature: 0.4
    });

    const raw = completion.choices[0].message.content.trim();
    // Strip markdown code blocks if LLM wraps response
    const cleaned = raw.replace(/```json|```/g, '').trim();
    let match;
    try {
      match = JSON.parse(cleaned);
    } catch {
      // If JSON parse fails, fall back to first episode
      match = { id: podcasts[0].id, reason: 'This is a great episode to start your career journey.' };
    }
    // Always use episode data from our database — never trust LLM for URLs
    const episode = podcasts.find(p => p.id === match.id) || podcasts[0];

    res.status(200).json({
      title: episode.title,
      reason: match.reason,
      url: episode.url,
      guest: episode.guest,
      company: episode.company,
      season: episode.season,
      year: episode.year
    });
  } catch (err) {
    res.status(500).json({ error: 'AI service unavailable. Please try again.' });
  }
};
