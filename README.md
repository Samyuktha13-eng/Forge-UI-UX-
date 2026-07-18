<div align="center">

<img src="./assets/images/logo.png" alt="Talkiepedia Logo" width="120" />

# 🎙️ Talkiepedia

### AI-Powered Podcast Learning Platform

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Site-6366f1?style=for-the-badge)](https://forge-ui-ux-flax.vercel.app)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

*Real conversations for real career growth.*

</div>

---

## 📖 Overview

Talkiepedia is a modern podcast discovery and learning platform that bridges the gap between aspiring professionals and the corporate world. Built as a UI/UX redesign challenge, it features AI-assisted recommendations, YouTube-integrated episode cards, and a clean responsive interface.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏠 **Home Page** | Hero section, featured episodes, about preview, newsletter CTA |
| 🎧 **Podcasts Page** | Category filters, team gallery, episode cards with video modal |
| 📖 **About Page** | Story, mission, and values |
| 📞 **Contact Page** | Contact form and details |
| 🤖 **TalkieAI Chat** | Ask career questions powered by Groq LLM |
| 🎯 **AI Matchmaker** | Get personalized episode recommendations |
| 📝 **AI Summaries** | Generate episode summaries before watching |
| ▶️ **Video Modal** | Watch YouTube episodes inline without leaving the page |
| 📱 **Responsive** | Fully optimized for desktop and mobile |

---

## 🤖 AI-Powered Features

<details>
<summary><b>TalkieAI Chat</b> — Ask anything about careers</summary>

> Type a question like *"How do I get into a big MNC?"* and TalkieAI responds with career guidance powered by **Groq LLM (llama-3.3-70b)**.

</details>

<details>
<summary><b>AI Matchmaker</b> — Find the right episode for you</summary>

> Describe your career goal and the AI surfaces the most relevant Talkiepedia episode with a reason why it matches.

</details>

<details>
<summary><b>AI Episode Summaries</b> — Know before you watch</summary>

> Click "AI Summary" on any episode card to get a concise AI-generated summary of what the episode covers.

</details>

---

## 🛠️ Tech Stack

**Frontend**
- HTML5, CSS3, Vanilla JavaScript
- YouTube Thumbnail API for episode images
- Inline video modal (no external libraries)

**Backend**
- Node.js + Express
- Groq API — `llama-3.3-70b-versatile`
- YouTube Data API v3
- Vercel Serverless Functions

---

## 📂 Project Structure

```
├── index.html          # Home page
├── about.html          # About page
├── podcasts.html       # Podcasts + AI matchmaker
├── contact.html        # Contact page
├── styles.css          # All shared styles
├── script.js           # Nav, gallery, AI chat, modal logic
├── frontend/           # Mirror for local Node server
├── backend/
│   ├── server.js       # Express server (local dev)
│   └── api/
│       ├── chat.js     # TalkieAI chat endpoint
│       ├── match.js    # AI matchmaker endpoint
│       ├── summary.js  # Episode summary endpoint
│       └── episodes.js # YouTube API + cache
├── assets/
│   └── images/
└── vercel.json         # Vercel routing config
```

---

## 🚀 Run Locally

**Option 1 — Open directly in browser:**
```bash
# Just open index.html in any browser
```

**Option 2 — Python static server:**
```bash
python -m http.server 8000
# Visit http://localhost:8000
```

**Option 3 — Node.js server (with AI features):**
```bash
cd backend
npm install
# Add .env with GROQ_API_KEY, YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID
node server.js
# Visit http://localhost:3000
```

---

## 📋 Deliverables

- ✅ User Flow / Information Architecture
- ✅ Minimum 3 High-Fidelity Screens
- ✅ Clean, Modern & Consistent UI
- ✅ Improved UX across all pages
- ✅ AI-Powered Podcast Recommendation Feature
- ✅ Clickable Prototype (live on Vercel)
- ✅ Presentation Pitch

---

## 🌟 Future Enhancements

- [ ] User authentication & saved favorites
- [ ] AI chatbot for podcast discovery
- [ ] Voice search
- [ ] Dark / Light mode toggle
- [ ] Podcast playlist management

---

## 👨‍💻 Developed For

**UI/UX Design Challenge** — Talkiepedia Website Redesign  
*Forge Alumnus Initiative*

---

<div align="center">

📄 *Created for educational and demonstration purposes.*

</div>
