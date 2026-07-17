document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const galleryTrack = document.getElementById('podcast-gallery-track');
  const galleryButtons = document.querySelectorAll('.gallery-btn');

  if (galleryTrack && galleryButtons.length) {
    galleryButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const direction = button.getAttribute('data-direction') === 'next' ? 1 : -1;
        galleryTrack.scrollBy({ left: direction * 240, behavior: 'smooth' });
      });
    });
  }

  const episodeCards = document.querySelectorAll('.episode-grid .card');
  const filterButtons = document.querySelectorAll('.episode-filter-row .filter-chip');

  if (episodeCards.length && filterButtons.length) {
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');

        filterButtons.forEach((chip) => chip.classList.remove('active'));
        button.classList.add('active');

        episodeCards.forEach((card) => {
          const matches = filter === 'all' || card.getAttribute('data-category') === filter;
          card.classList.toggle('is-hidden', !matches);
        });
      });
    });
  }

  const aiButtons = document.querySelectorAll('.ai-pill');
  const aiTitle = document.getElementById('ai-title');
  const aiDescription = document.getElementById('ai-description');
  const aiMeta = document.getElementById('ai-meta');
  const aiLink = document.getElementById('ai-link');

  const aiRecommendations = {
    'career-growth': {
      title: 'Dream Your Career Into a Big MNC',
      description: 'A strong match if you want practical guidance for landing your first role or growing faster in a company.',
      meta: 'Guest: Bharat Chandra • Season 1 • 2024',
      link: 'https://www.youtube.com/watch?v=hhckoit3fKk'
    },
    leadership: {
      title: 'Welcome to Talkiepedia',
      description: 'Best for people who want a thoughtful entry point into leadership, confidence, and career storytelling.',
      meta: 'Guest: Talkiepedia Team • Season 1 • 2024',
      link: 'https://www.youtube.com/watch?v=rsG-bZZ4vCs'
    },
    technology: {
      title: 'The World of Aerospace',
      description: 'Ideal for learners exploring how technology careers can branch into aerospace, strategy, and innovation.',
      meta: 'Guest: Sumanvitha KannamReddy • Season 1 • 2024',
      link: 'https://www.youtube.com/watch?v=5oZ_GtRx6S0'
    }
  };

  const setAiRecommendation = (goal) => {
    const item = aiRecommendations[goal] || aiRecommendations['career-growth'];
    if (aiTitle) aiTitle.textContent = item.title;
    if (aiDescription) aiDescription.textContent = item.description;
    if (aiMeta) aiMeta.textContent = item.meta;
    if (aiLink) aiLink.href = item.link;
  };

  if (aiButtons.length) {
    aiButtons.forEach((button) => {
      button.addEventListener('click', () => {
        aiButtons.forEach((chip) => chip.classList.remove('active'));
        button.classList.add('active');
        setAiRecommendation(button.getAttribute('data-ai-goal'));
      });
    });
    setAiRecommendation('career-growth');
  }

  // TalkieAI chat
  const aiInput = document.getElementById('ai-search');
  const aiBtn = document.getElementById('ai-search-btn');
  const aiResponse = document.getElementById('talkie-response');
  const quickChips = document.querySelectorAll('.ai-quick-chip');

  const aiKnowledge = [
    {
      keys: ['career growth', 'grow', 'promotion', 'advance'],
      answer: 'Focus on building T-shaped skills — go deep in one area and broad across others. Listen to our episode with Bharat Chandra from Microsoft for a practical roadmap on growing inside big companies.'
    },
    {
      keys: ['mnc', 'big company', 'microsoft', 'amazon', 'corporate'],
      answer: 'Getting into a big MNC takes preparation, networking, and the right mindset. Our episode "Dream Your Career Into a Big MNC" with Bharat Chandra covers exactly this — from resume tips to interview strategy.'
    },
    {
      keys: ['podcast', 'episode', 'watch', 'listen', 'recommend'],
      answer: 'We recommend starting with "The World of Aerospace" for tech careers, "Dream Your Career Into a Big MNC" for corporate growth, and "Navigating Corporate Success" for leadership insights. All on our Podcasts page!'
    },
    {
      keys: ['aerospace', 'engineering', 'technology', 'tech'],
      answer: '"The World of Aerospace" with Sumanvitha from Collins Aerospace is a must-watch if you\'re exploring tech and engineering careers. It covers how to navigate a highly specialized industry.'
    },
    {
      keys: ['leadership', 'leader', 'manage', 'team'],
      answer: 'Leadership is about influence, not authority. Check out "Navigating Corporate Success" with Dhananjay Dubey — it dives deep into building credibility and leading with confidence in corporate environments.'
    },
    {
      keys: ['resume', 'cv', 'interview', 'job', 'hire'],
      answer: 'A strong resume tells a story, not just a list of jobs. Tailor it to each role, quantify your impact, and lead with results. Our podcast guests share real hiring insights — browse the Podcasts page for more.'
    },
    {
      keys: ['talkiepedia', 'about', 'forge', 'alumnus', 'who'],
      answer: 'Talkiepedia is a flagship initiative by Forge Alumnus, created to bridge the gap between aspiring professionals and the corporate world through meaningful conversations with real leaders.'
    },
    {
      keys: ['subscribe', 'newsletter', 'follow', 'update'],
      answer: "Stay in the loop by subscribing to our newsletter at the bottom of this page! You'll get fresh episodes, behind-the-scenes stories, and career insights delivered to your inbox."
    }
  ];

  function getAIAnswer(query) {
    const q = query.toLowerCase();
    for (const item of aiKnowledge) {
      if (item.keys.some((k) => q.includes(k))) return item.answer;
    }
    return "Great question! While I don't have a specific answer for that yet, I'd suggest browsing our Podcasts page — our guests cover a wide range of career topics that might help you out.";
  }

  function typeAnswer(text) {
    aiResponse.hidden = false;
    aiResponse.innerHTML = '<span class="talkie-label">TalkieAI</span>';
    const span = document.createElement('span');
    aiResponse.appendChild(span);
    const cursor = document.createElement('span');
    cursor.className = 'talkie-cursor';
    aiResponse.appendChild(cursor);

    let i = 0;
    const interval = setInterval(() => {
      span.textContent += text[i++];
      if (i >= text.length) {
        clearInterval(interval);
        cursor.remove();
      }
    }, 18);
  }

  function handleAIQuery(query) {
    if (!query.trim()) return;
    typeAnswer(getAIAnswer(query));
  }

  if (aiBtn && aiInput) {
    aiBtn.addEventListener('click', () => handleAIQuery(aiInput.value));
    aiInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAIQuery(aiInput.value); });
  }

  quickChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      aiInput.value = chip.getAttribute('data-q');
      handleAIQuery(aiInput.value);
    });
  });
});
