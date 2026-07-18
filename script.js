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
      if (data.error) {
        if (matchResult) matchResult.hidden = false;
        if (badge) badge.textContent = '⚠️ Out of scope';
        if (aiTitle) aiTitle.textContent = data.error;
        if (aiDescription) aiDescription.textContent = 'Try something like: "I want to get into a big tech company" or "How do I grow my career?"';
        if (aiMeta) aiMeta.textContent = '';
        return;
      }
      lastPickedIndex[goal] = data.pickedIndex;
      if (aiTitle) aiTitle.textContent = data.title;
      if (aiDescription) aiDescription.textContent = data.reason;
      if (aiMeta) aiMeta.textContent = `Guest: ${data.guest} • ${data.category} • ${data.year}`;
      if (aiLink) {
        aiLink.href = '#';
        aiLink.textContent = '▶ Watch episode';
        aiLink.onclick = (e) => {
          e.preventDefault();
          const mini = document.getElementById('mini-player');
          const miniIframe = document.getElementById('mini-player-iframe');
          if (mini && miniIframe) {
            miniIframe.src = `https://www.youtube.com/embed/${data.youtubeId}?autoplay=1&rel=0&modestbranding=1`;
            mini.hidden = false;
          }
        };
      }
      // Watch on YouTube link
      let ytLink = document.getElementById('ai-yt-link');
      if (!ytLink) {
        ytLink = document.createElement('a');
        ytLink.id = 'ai-yt-link';
        ytLink.target = '_blank';
        ytLink.rel = 'noreferrer';
        ytLink.style.cssText = 'display:inline-flex;align-items:center;gap:6px;margin-top:8px;margin-left:12px;color:#fff;font-size:0.82rem;font-weight:700;background:rgba(255,0,0,0.85);padding:6px 14px;border-radius:999px;';
        ytLink.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg> Watch on YouTube';
        aiLink.parentNode.insertBefore(ytLink, aiLink.nextSibling);
      }
      ytLink.href = data.url;
      // Show thumbnail
      let aiThumb = document.getElementById('ai-thumb');
      if (!aiThumb) {
        aiThumb = document.createElement('img');
        aiThumb.id = 'ai-thumb';
        aiThumb.style.cssText = 'width:100%;border-radius:12px;margin:12px 0;aspect-ratio:16/9;object-fit:cover;cursor:pointer;';
        aiThumb.onclick = () => aiLink.onclick(new Event('click'));
        aiTitle.parentNode.insertBefore(aiThumb, aiTitle);
      }
      aiThumb.src = `https://img.youtube.com/vi/${data.youtubeId}/hqdefault.jpg`;
      aiThumb.alt = data.title;
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
  attachWatchListeners();
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
                <button class="btn-watch" data-id="${ep.youtubeId}">▶ Watch episode</button>
                <button class="summary-btn" type="button">AI Summary</button>
                <div class="summary-box"></div>
              </div>
            </article>`).join('');
          attachSummaryListeners();
          attachFilterListeners();
          attachWatchListeners();
        } else {
          episodeGrid.innerHTML = '<p style="color:var(--muted);padding:32px 0;grid-column:1/-1">No episodes found. Check back soon.</p>';
        }
      })
      .catch(() => {});
  }

  function attachWatchListeners() {
    const modal = document.getElementById('video-modal');
    const iframe = document.getElementById('modal-iframe');
    if (!modal || !iframe) return;
    document.querySelectorAll('.btn-watch').forEach((btn) => {
      if (btn.dataset.watchBound) return;
      btn.dataset.watchBound = '1';
      btn.addEventListener('click', () => {
        iframe.src = 'https://www.youtube.com/embed/' + btn.getAttribute('data-id') + '?autoplay=1&rel=0';
        modal.hidden = false;
      });
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
