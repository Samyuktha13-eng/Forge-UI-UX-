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
    if (matchResult) matchResult.innerHTML = '<div class="ai-badge">Finding best match...</div>';
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
      if (aiLink) aiLink.href = data.url;
      if (matchResult) matchResult.querySelector('.ai-badge') && (matchResult.querySelector('.ai-badge').textContent = 'Recommended for you');
    } catch {
      if (aiDescription) aiDescription.textContent = 'Could not load recommendation. Please try again.';
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

  // ── Episode AI Summary (podcasts page) ─────────────────────
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
});
