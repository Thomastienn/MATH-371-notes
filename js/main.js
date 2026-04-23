// ============================================================
// MATH 371 — Interactive Theorem Visualizations
// ============================================================
const COLORS = {
  bg: '#181818', node: '#d4d4d4', text: '#d4d4d4', dim: '#777',
  accent: '#bbb', edge: '#888',
  palette: ['#d95555','#6a9fc4','#5db85d','#c9a84c','#9475b2','#c78740','#5aafa5'],
  red: '#d95555', blue: '#6a9fc4', green: '#5db85d', yellow: '#c9a84c',
  purple: '#9475b2', orange: '#c78740'
};

// --- Utility ---
function getCtx(id) {
  const c = document.getElementById(id);
  return c ? c.getContext('2d') : null;
}
function drawNode(ctx, x, y, r, fill, label, textColor) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
  ctx.fillStyle = fill || COLORS.node; ctx.fill();
  ctx.strokeStyle = '#888'; ctx.lineWidth = 1.5; ctx.stroke();
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
  
  // Force any canvas inside the opened section to reset/redraw
  const canvases = targetEl.querySelectorAll('canvas');
  canvases.forEach(canvas => {
    canvas.hasDrawnOnce = false;
    const id = canvas.id;
    const idMap = {
      'canvas-petersen': () => typeof vizPetersen !== 'undefined' && vizPetersen.reset(),
      'canvas-ramsey-lb': () => typeof vizRamseyLB !== 'undefined' && vizRamseyLB.showBoth()
    };
    if (idMap[id]) try { idMap[id](); } catch(_) {}
  });

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

// Exercise accordion (independent of theorem strict accordion — multiple open OK)
document.querySelectorAll('.exercise-header').forEach(header => {
  header.addEventListener('click', function(e) {
    const ex = this.parentElement;
    ex.classList.toggle('open');
    // Force any canvas inside to redraw (in case it rendered while hidden)
    if (ex.classList.contains('open')) {
      const canvases = ex.querySelectorAll('canvas');
      canvases.forEach(canvas => {
        canvas.hasDrawnOnce = false; // trigger fresh draw path in clearCanvas
        // Dispatch custom event so viz modules can re-render if needed
        const reset = canvas.getAttribute('data-reset');
        // Best effort: call a global reset matching the canvas id
        const idMap = {
          'canvas-prufer': () => vizPrufer && vizPrufer.reset && vizPrufer.reset(),
          'canvas-bowtie': () => vizBowtie && vizBowtie.showNormal && vizBowtie.showNormal(),
          'canvas-triangle-count': () => vizTriangleCount && vizTriangleCount.reset && vizTriangleCount.reset(),
          'canvas-chrom-poly': () => vizChromPoly && vizChromPoly.reset && vizChromPoly.reset()
        };
        if (idMap[canvas.id]) try { idMap[canvas.id](); } catch(_) {}
      });
    }
  });
});

// Exam-chip clicks: auto-open the target theorem card
document.querySelectorAll('.exam-thm-chip').forEach(chip => {
  chip.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetEl = document.getElementById(targetId);
    if (targetEl) openSection(targetEl);
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
const exercises = Array.from(document.querySelectorAll('.exercise'));
const exerciseGroups = Array.from(document.querySelectorAll('.exercise-group'));
const glossaryItems = Array.from(document.querySelectorAll('.glossary-item'));
const navLinks = Array.from(document.querySelectorAll('#nav-links a'));
const finalExam = document.getElementById('final-exam');

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

  // Filter Exercises
  exercises.forEach(ex => {
    const text = ex.textContent.toLowerCase();
    const match = text.includes(q);
    ex.classList.toggle('hidden', !match && q !== '');
    if (q !== '' && match) ex.classList.add('open');
    else if (q === '') ex.classList.remove('open');
  });

  // Hide empty exercise groups when searching
  exerciseGroups.forEach(grp => {
    const anyVisible = Array.from(grp.querySelectorAll('.exercise')).some(e => !e.classList.contains('hidden'));
    grp.classList.toggle('hidden', !anyVisible && q !== '');
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
