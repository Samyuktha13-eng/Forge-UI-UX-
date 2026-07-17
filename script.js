document.addEventListener('DOMContentLoaded', () => {
  // ── Nav toggle ──────────────────────────────────────────────
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // ── Gallery scroll ──────────────────────────────────────────
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

  // ── Episode category filter ─────────────────────────────────
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

  // ── TalkieAI Chat (home page) ───────────────────────────────
  const aiInput = document.getElementById('ai-search');
  const aiBtn = document.getElementById('ai-search-btn');
  const aiResponse = document.getElementById('talkie-response');
  const quickChips = document.querySelectorAll('.ai-quick-chip');

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
      if (i >= text.length) { clearInterval(interval); cursor.remove(); }
    }, 18);
  }

  async function handleAIQuery(query) {
    if (!query.trim()) return;
    aiResponse.hidden = false;
    aiResponse.innerHTML = '<span class="talkie-label">TalkieAI</span><span class="talkie-thinking">Thinking...</span>';
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });
      const data = await res.json();
      typeAnswer(data.reply || data.error);
    } catch {
      typeAnswer('Sorry, I could not connect right now. Please try again.');
    }
  }

  if (aiBtn && aiInput) {
    aiBtn.addEventListener('click', () => handleAIQuery(aiInput.value));
    aiInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAIQuery(aiInput.value); });
  }

  if (quickChips.length) {
    quickChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        aiInput.value = chip.getAttribute('data-q');
        handleAIQuery(aiInput.value);
      });
    });
  }

  // ── AI Matchmaker (podcasts page) ───────────────────────────
  const matchInput = document.getElementById('match-input');
  const matchBtn = document.getElementById('match-btn');
  const matchResult = document.getElementById('match-result');
  const aiTitle = document.getElementById('ai-title');
  const aiDescription = document.getElementById('ai-description');
  const aiMeta = document.getElementById('ai-meta');
  const aiLink = document.getElementById('ai-link');
  const aiPills = document.querySelectorAll('.ai-pill');

  async function runMatch(goal) {
    if (!goal.trim()) return;
    const badge = matchResult ? matchResult.querySelector('.ai-badge') : null;
    if (badge) badge.textContent = 'Finding best match...';
    if (aiTitle) aiTitle.textContent = 'Thinking...';
    if (aiDescription) aiDescription.textContent = '';
    if (aiMeta) aiMeta.textContent = '';
    if (aiLink) aiLink.href = '#';
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (aiTitle) aiTitle.textContent = data.title;
      if (aiDescription) aiDescription.textContent = data.reason;
      if (aiMeta) aiMeta.textContent = `Guest: ${data.guest} • ${data.company} • Season ${data.season} • ${data.year}`;
      if (aiLink) { aiLink.href = data.url; aiLink.textContent = 'Watch this episode'; }
      if (badge) badge.textContent = 'Recommended for you';
    } catch {
      if (aiTitle) aiTitle.textContent = 'Could not load recommendation.';
      if (aiDescription) aiDescription.textContent = 'Please try again or click a pill above.';
      if (badge) badge.textContent = 'Try again';
    }
  }

  if (matchBtn && matchInput) {
    matchBtn.addEventListener('click', () => runMatch(matchInput.value));
    matchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') runMatch(matchInput.value); });
  }

  if (aiPills.length) {
    aiPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        aiPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        runMatch(pill.textContent.trim());
      });
    });
    // Auto-load first pill on podcasts page
    if (document.querySelector('.ai-panel')) runMatch(aiPills[0].textContent.trim());
  }

  // ── Dynamic episode loading from YouTube ─────────────────
  const episodeGrid = document.getElementById('episode-grid');
  if (episodeGrid) {
    fetch('/api/episodes')
      .then(r => r.json())
      .then(data => {
        if (data.source === 'youtube' && data.episodes.length) {
          episodeGrid.innerHTML = data.episodes.map(ep => `
            <article class="card" data-category="${ep.category}" data-id="${ep.youtubeId}">
              <img src="${ep.thumbnail}" alt="${ep.title}" loading="lazy" />
              <div class="card-content">
                <div class="card-topline">
                  <p class="episode-tag">${ep.category.replace('-', ' ')}</p>
                  <span class="pill">New</span>
                </div>
                <h3>${ep.title}</h3>
                <p class="meta-line">Guest: ${ep.guest} • ${new Date(ep.publishedAt).getFullYear()}</p>
                <p>${ep.description.slice(0, 100)}${ep.description.length > 100 ? '...' : ''}</p>
                <a href="${ep.url}" target="_blank" rel="noreferrer">Watch on YouTube</a>
                <button class="summary-btn" type="button">AI Summary</button>
                <div class="summary-box"></div>
              </div>
            </article>`).join('');
          // Re-attach summary button listeners after dynamic render
          attachSummaryListeners();
          // Re-attach filter listeners
          attachFilterListeners();
        }
      })
      .catch(() => {
        // Static HTML fallback already in place, do nothing
      });
  }

  function attachFilterListeners() {
    const cards = document.querySelectorAll('.episode-grid .card');
    const filters = document.querySelectorAll('.episode-filter-row .filter-chip');
    filters.forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');
        filters.forEach((chip) => chip.classList.remove('active'));
        button.classList.add('active');
        cards.forEach((card) => {
          const matches = filter === 'all' || card.getAttribute('data-category') === filter;
          card.classList.toggle('is-hidden', !matches);
        });
      });
    });
  }

  function attachSummaryListeners() {
    document.querySelectorAll('.summary-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const card = btn.closest('.card');
        const episodeId = card.getAttribute('data-id');
        const summaryBox = card.querySelector('.summary-box');
        if (summaryBox.classList.contains('open')) {
          summaryBox.classList.remove('open');
          summaryBox.innerHTML = '';
          btn.textContent = 'AI Summary';
          return;
        }
        btn.textContent = 'Loading...';
        btn.disabled = true;
        try {
          const res = await fetch('/api/summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: episodeId })
          });
          const data = await res.json();
          summaryBox.innerHTML = `<span class="talkie-label">TalkieAI Summary</span>${data.summary || data.error}`;
          summaryBox.classList.add('open');
          btn.textContent = 'Hide Summary';
        } catch {
          summaryBox.innerHTML = '<span class="talkie-label">TalkieAI</span>Could not load summary.';
          summaryBox.classList.add('open');
          btn.textContent = 'Hide Summary';
        }
        btn.disabled = false;
      });
    });
  }
});
