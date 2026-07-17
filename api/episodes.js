const https = require('https');
const { podcasts: fallback } = require('../data/podcasts');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Invalid JSON')); }
      });
    }).on('error', reject);
  });
}

// Simple in-memory cache — refreshes every 30 minutes
let cache = null;
let cacheTime = 0;
const CACHE_TTL = 30 * 60 * 1000;

async function fetchYouTubeVideos() {
  if (cache && Date.now() - cacheTime < CACHE_TTL) return cache;

  const key = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!key || !channelId) throw new Error('YouTube credentials missing');

  const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${key}&channelId=${channelId}&part=snippet&order=date&maxResults=20&type=video`;
  const data = await fetchJSON(searchUrl);

  if (!data.items || data.items.length === 0) throw new Error('No videos found');

  const videos = data.items.map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description || '',
    thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    publishedAt: item.snippet.publishedAt,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    youtubeId: item.id.videoId,
    guest: extractGuest(item.snippet.title, item.snippet.description),
    category: inferCategory(item.snippet.title, item.snippet.description)
  }));

  cache = videos;
  cacheTime = Date.now();
  return videos;
}

function extractGuest(title, description) {
  // Try to extract guest name from title patterns like "with John" or "| John Doe"
  const match = title.match(/(?:with|ft\.?|feat\.?)\s+([A-Z][a-z]+(?: [A-Z][a-z]+)?)/i)
    || description.match(/Guest:\s*([A-Z][a-z]+(?: [A-Z][a-z]+)?)/i);
  return match ? match[1] : 'Talkiepedia Guest';
}

function inferCategory(title, description) {
  const text = (title + ' ' + description).toLowerCase();
  if (text.match(/aerospace|engineering|tech|software|ai|data/)) return 'technology';
  if (text.match(/leader|manage|team|executive|founder/)) return 'leadership';
  return 'career-growth';
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const videos = await fetchYouTubeVideos();
    res.status(200).json({ source: 'youtube', episodes: videos });
  } catch (err) {
    // Fallback to local data if YouTube API fails
    console.error('YouTube API error:', err.message);
    res.status(200).json({ source: 'fallback', episodes: fallback });
  }
};

module.exports.fetchYouTubeVideos = fetchYouTubeVideos;
