// ============================================================
// MATH 371 — Interactive Theorem Visualizations
// ============================================================
const COLORS = {
  bg: '#1c2333', node: '#e8f4fd', text: '#e6edf3', dim: '#8b949e',
  accent: '#58a6ff', edge: '#58a6ff',
  palette: ['#ff6b6b','#4dabf7','#51cf66','#ffd43b','#cc5de8','#ff922b','#20c997'],
  red: '#ff6b6b', blue: '#4dabf7', green: '#51cf66', yellow: '#ffd43b',
  purple: '#cc5de8', orange: '#ff922b'
};

// --- Utility ---
function getCtx(id) {
  const c = document.getElementById(id);
  return c ? c.getContext('2d') : null;
}
function drawNode(ctx, x, y, r, fill, label, textColor) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
  ctx.fillStyle = fill || COLORS.node; ctx.fill();
  ctx.strokeStyle = '#58a6ff'; ctx.lineWidth = 2; ctx.stroke();
  if (label) { ctx.fillStyle = textColor || '#111'; ctx.font = 'bold 14px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, x, y); }
}
function drawEdge(ctx, x1, y1, x2, y2, color, width) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = color || COLORS.edge; ctx.lineWidth = width || 2; ctx.stroke();
}
function clearCanvas(ctx, w, h) { 
  const canvas = ctx.canvas;
  
  // First draw (on page load) has no transition
  if (!canvas.hasDrawnOnce) {
    canvas.hasDrawnOnce = true;
    ctx.fillStyle = COLORS.bg; ctx.fillRect(0, 0, w, h);
    return;
  }
  
  // If actively animating or in autoPlay, skip the heavy crossfade to avoid pileup
  // Actually, we WANT crossfade for autoPlay, just fast enough
  if (canvas.getAttribute('data-animating') === 'true') {
     ctx.fillStyle = COLORS.bg; ctx.fillRect(0, 0, w, h);
     return;
  }

  const oldImg = canvas.toDataURL();
  ctx.fillStyle = COLORS.bg; ctx.fillRect(0, 0, w, h);
  canvas.setAttribute('data-animating', 'true');

  Promise.resolve().then(() => {
    const img = new Image();
    img.src = oldImg;
    img.style.position = 'absolute';
    img.style.left = canvas.offsetLeft + 'px';
    img.style.top = canvas.offsetTop + 'px';
    img.style.width = canvas.offsetWidth + 'px';
    img.style.height = canvas.offsetHeight + 'px';
    img.style.pointerEvents = 'none';
    img.style.transition = 'opacity 0.25s ease-out';
    canvas.parentElement.appendChild(img);
    
    // Force reflow
    img.offsetHeight;
    img.style.opacity = '0';
    
    setTimeout(() => {
      img.remove();
      canvas.removeAttribute('data-animating');
    }, 250);
  });
}
function drawLabel(ctx, text, x, y, color, size) {
  ctx.fillStyle = color || COLORS.dim; ctx.font = (size || 13) + 'px Inter, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y);
}

// ============================================================
// ACCORDION & SIDEBAR NAVIGATION LOGIC
// ============================================================

function openSection(targetEl) {
  // Close all others
  document.querySelectorAll('.theorem, .glossary-section').forEach(el => {
    if (el !== targetEl) el.classList.remove('open');
  });
  // Open target
  targetEl.classList.add('open');
  
  // Highlight sidebar
  document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
  const link = document.querySelector(`.sidebar a[href="#${targetEl.id}"]`);
  if (link) link.classList.add('active');
  
  // Scroll to it
  setTimeout(() => {
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}

// Override inline onclicks from HTML for strict accordion
document.querySelectorAll('.theorem-header, .glossary-header').forEach(header => {
  header.removeAttribute('onclick'); // Disable inline toggle
  header.addEventListener('click', function(e) {
    const parent = this.parentElement;
    if (parent.classList.contains('open')) {
      parent.classList.remove('open'); // user just wants to close it
    } else {
      openSection(parent);
    }
  });
});

// Sidebar links
document.querySelectorAll('.sidebar a').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      openSection(targetEl);
    }
  });
});

// ============================================================
// SEARCH FUNCTIONALITY
// ============================================================
const searchInput = document.getElementById('searchInput');
const theorems = Array.from(document.querySelectorAll('.theorem'));
const glossaryItems = Array.from(document.querySelectorAll('.glossary-item'));
const navLinks = Array.from(document.querySelectorAll('#nav-links a'));

searchInput.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase().trim();
  
  // Filter Theorems
  theorems.forEach(thm => {
    const text = thm.textContent.toLowerCase();
    const id = thm.id;
    const match = text.includes(q);
    thm.classList.toggle('hidden', !match && q !== '');
    
    // Auto-expand if searching
    if (q !== '' && match) {
      thm.classList.add('open');
    } else if (q === '') {
      thm.classList.remove('open');
    }
    
    // Update sidebar links for theorems
    const link = navLinks.find(a => a.getAttribute('href') === '#' + id);
    if(link) link.classList.toggle('hidden', !match && q !== '');
  });

  // Filter Glossary
  let glossaryMatches = 0;
  const glossarySec = document.getElementById('glossary');
  if (q !== '') glossarySec.classList.add('open');
  else glossarySec.classList.remove('open');

  glossaryItems.forEach(item => {
    const text = item.textContent.toLowerCase();
    const match = text.includes(q);
    item.classList.toggle('hidden', !match && q !== '');
    if (match) glossaryMatches++;
  });

  // Handle "No Results" for glossary
  let noRes = document.getElementById('glossary-no-res');
  if (glossaryMatches === 0 && q !== '') {
    if (!noRes) {
      noRes = document.createElement('div');
      noRes.id = 'glossary-no-res';
      noRes.className = 'no-results';
      noRes.textContent = 'No glossary terms match your search.';
      glossaryGrid.appendChild(noRes);
    }
  } else if (noRes) {
    noRes.remove();
  }
});
