document.addEventListener('DOMContentLoaded', () => {
  // ── Nav toggle ──────────────────────────────────────────────
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
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

  // Track last picked index per category to ensure variety
  const lastPickedIndex = {};

  async function runMatch(goal) {
    if (!goal.trim()) return;
    const badge = matchResult ? matchResult.querySelector('.ai-badge') : null;
    if (badge) badge.textContent = 'Finding best match...';
    if (matchResult) matchResult.hidden = false;
    if (aiTitle) aiTitle.textContent = 'Thinking...';
    if (aiDescription) aiDescription.textContent = '';
    if (aiMeta) aiMeta.textContent = '';
    if (aiLink) aiLink.href = '#';
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, excludeIndex: lastPickedIndex[goal] ?? -1 })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      lastPickedIndex[goal] = data.pickedIndex;
      if (aiTitle) aiTitle.textContent = data.title;
      if (aiDescription) aiDescription.textContent = data.reason;
      if (aiMeta) aiMeta.textContent = `Guest: ${data.guest} • ${data.category} • ${data.year}`;
      if (aiLink) {
        aiLink.href = data.url;
        aiLink.textContent = '▶ Watch on YouTube';
        aiLink.target = '_blank';
        aiLink.rel = 'noreferrer';
      }
      // Show YouTube thumbnail in result
      let thumb = document.getElementById('ai-thumb');
      if (!thumb) {
        thumb = document.createElement('img');
        thumb.id = 'ai-thumb';
        thumb.style.cssText = 'width:100%;border-radius:12px;margin:12px 0;aspect-ratio:16/9;object-fit:contain;background:#000;';
        aiTitle.parentNode.insertBefore(thumb, aiTitle);
      }
      if (data.youtubeId) {
        thumb.src = `https://img.youtube.com/vi/${data.youtubeId}/maxresdefault.jpg`;
        thumb.onerror = () => { thumb.src = `https://img.youtube.com/vi/${data.youtubeId}/hqdefault.jpg`; thumb.onerror = null; };
      }
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

  // ── Form feedback ───────────────────────────────────────────
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input[type="email"]');
      if (!input.value.trim()) return;
      newsletterForm.innerHTML = '<p style="color:var(--accent-2);font-weight:700;margin:0">✓ You\'re subscribed! We\'ll keep you posted.</p>';
    });
  }
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.textContent = '✓ Message sent!';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';
    });
  }

  // ── Dynamic episode loading from YouTube ─────────────────
  const episodeGrid = document.getElementById('episode-grid');
  // Attach listeners to static cards immediately on load
  attachSummaryListeners();
  if (episodeGrid) {
    fetch('/api/episodes')
      .then(r => r.json())
      .then(data => {
        if (data.episodes && data.episodes.length) {
          const filtered = data.episodes.filter(ep => !/\bshorts?\b/i.test(ep.title));
          episodeGrid.innerHTML = filtered.map(ep => `
            <article class="card" data-category="${ep.category}" data-id="${ep.youtubeId || ep.id}">
              <img src="${ep.thumbnail || `https://img.youtube.com/vi/${ep.youtubeId}/hqdefault.jpg`}" alt="${ep.title}" loading="lazy" />
              <div class="card-content">
                <div class="card-topline">
                  <p class="episode-tag">${(ep.category || 'career-growth').replace('-', ' ')}</p>
                  <span class="pill">New</span>
                </div>
                <h3>${ep.title}</h3>
                <p class="meta-line">Guest: ${ep.guest} • ${ep.publishedAt ? new Date(ep.publishedAt).getFullYear() : 2024}</p>
                <p>${(ep.description || '').slice(0, 100)}${(ep.description || '').length > 100 ? '...' : ''}</p>
                <a href="${ep.url}" target="_blank" rel="noreferrer">Watch on YouTube</a>
                <button class="summary-btn" type="button">AI Summary</button>
                <div class="summary-box"></div>
              </div>
            </article>`).join('');
          attachSummaryListeners();
          attachFilterListeners();
        } else {
          episodeGrid.innerHTML = '<p style="color:var(--muted);padding:32px 0;grid-column:1/-1">No episodes found. Check back soon.</p>';
        }
      })
      .catch(() => {});
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
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
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
          const formatted = (data.summary || data.error).replace(/\n/g, '<br>');
          summaryBox.innerHTML = `<span class="talkie-label">TalkieAI Summary</span>${formatted}`;
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
