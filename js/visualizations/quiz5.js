// ============================================================
// QUIZ 5 VISUALS: MATCHINGS AND RAMSEY THEORY
// ============================================================

function edgeKey(u, v) {
  return u < v ? `${u}-${v}` : `${v}-${u}`;
}

function bipKey(leftIdx, rightIdx) {
  return `${leftIdx}|${rightIdx}`;
}

function binom(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  const kk = Math.min(k, n - k);
  let num = 1;
  for (let i = 1; i <= kk; i++) {
    num = (num * (n - kk + i)) / i;
  }
  return Math.round(num);
}

// ============================================================
// 1.50 BERGE
// ============================================================
const vizBerge = (() => {
  const nodes = [
    { x: 60, y: 140, label: 'u' },
    { x: 160, y: 80, label: 'a' },
    { x: 260, y: 140, label: 'b' },
    { x: 360, y: 80, label: 'c' },
    { x: 460, y: 140, label: 'd' },
    { x: 560, y: 80, label: 'v' }
  ];
  const pathEdges = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]];
  const extraEdges = [[1, 3], [2, 4]];
  const beforeMatching = new Set([edgeKey(1, 2), edgeKey(3, 4)]);
  const afterMatching = new Set([edgeKey(0, 1), edgeKey(2, 3), edgeKey(4, 5)]);
  let flipped = false;

  function currentMatching() {
    return flipped ? afterMatching : beforeMatching;
  }

  function draw() {
    const ctx = getCtx('canvas-berge');
    if (!ctx) return;
    clearCanvas(ctx, 600, 280);

    [...pathEdges, ...extraEdges].forEach(([u, v]) => {
      drawEdge(ctx, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y, '#333', 1);
    });

    pathEdges.forEach(([u, v]) => {
      drawEdge(ctx, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y, '#666', 3);
    });

    const matched = currentMatching();
    pathEdges.forEach(([u, v]) => {
      if (matched.has(edgeKey(u, v))) {
        drawEdge(ctx, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y, '#fff', 4);
      }
    });

    nodes.forEach((n, i) => {
      let isMatched = false;
      matched.forEach((k) => {
        const [a, b] = k.split('-').map(Number);
        if (a === i || b === i) isMatched = true;
      });
      drawNode(ctx, n.x, n.y, 20, isMatched ? '#ccc' : '#555', n.label, isMatched ? '#111' : '#ddd');
    });

    const size = matched.size;
    drawLabel(ctx, `|M| = ${size}`, 300, 255, COLORS.accent, 14);
    const lbl = document.getElementById('berge-label');
    if (lbl) {
      lbl.textContent = flipped
        ? 'After flip: |M| grew by 1. Previous M was NOT maximum.'
        : 'Before: white edges = M. Path u-a-b-c-d-v alternates non-M / M / non-M.';
    }
  }

  function flip() { flipped = !flipped; draw(); }
  function reset() { flipped = false; draw(); }

  setTimeout(draw, 100);
  return { flip, reset };
})();

// ============================================================
// 1.51 HALL
// ============================================================
const vizHall = (() => {
  const left = [
    { x: 160, y: 55, label: 'x1' },
    { x: 160, y: 115, label: 'x2' },
    { x: 160, y: 175, label: 'x3' },
    { x: 160, y: 235, label: 'x4' }
  ];
  const right = [
    { x: 440, y: 55, label: 'y1' },
    { x: 440, y: 115, label: 'y2' },
    { x: 440, y: 175, label: 'y3' },
    { x: 440, y: 235, label: 'y4' }
  ];

  const good = {
    edges: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3], [3, 0], [3, 3]],
    S: new Set([0, 1, 2]),
    N: new Set([0, 1, 2, 3]),
    text: '|S| = 3, |N(S)| = 4  (Hall holds)'
  };
  const bad = {
    edges: [[0, 0], [1, 0], [1, 1], [2, 1], [3, 2]],
    S: new Set([0, 1, 2]),
    N: new Set([0, 1]),
    text: '|S| = 3, |N(S)| = 2  (Hall FAILS)'
  };

  let mode = 'good';
  function data() { return mode === 'good' ? good : bad; }

  function draw() {
    const ctx = getCtx('canvas-hall');
    if (!ctx) return;
    clearCanvas(ctx, 600, 280);

    const d = data();
    drawLabel(ctx, 'X', 160, 20, COLORS.accent, 14);
    drawLabel(ctx, 'Y', 440, 20, COLORS.accent, 14);

    d.edges.forEach(([i, j]) => {
      const inS = d.S.has(i);
      const inN = d.N.has(j);
      const color = inS && inN ? '#ccc' : '#333';
      drawEdge(ctx, left[i].x, left[i].y, right[j].x, right[j].y, color, inS && inN ? 2.5 : 1);
    });

    left.forEach((n, i) => {
      drawNode(ctx, n.x, n.y, 18, d.S.has(i) ? '#ccc' : '#555', n.label, d.S.has(i) ? '#111' : '#ddd');
    });
    right.forEach((n, i) => {
      drawNode(ctx, n.x, n.y, 18, d.N.has(i) ? '#ccc' : '#555', n.label, d.N.has(i) ? '#111' : '#ddd');
    });

    drawLabel(ctx, d.text, 300, 262, mode === 'good' ? COLORS.green : COLORS.red, 13);
  }

  function showGood() { mode = 'good'; draw(); }
  function showBad() { mode = 'bad'; draw(); }
  function reset() { mode = 'good'; draw(); }

  setTimeout(draw, 100);
  return { showGood, showBad, reset };
})();

// ============================================================
// 1.52 SDR
// ============================================================
const vizSDR = (() => {
  const left = [
    { x: 150, y: 70, label: 'S1' },
    { x: 150, y: 140, label: 'S2' },
    { x: 150, y: 210, label: 'S3' }
  ];
  const right = [
    { x: 430, y: 45, label: '1' },
    { x: 430, y: 105, label: '2' },
    { x: 430, y: 165, label: '3' },
    { x: 430, y: 225, label: '4' }
  ];

  const success = {
    edges: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 0], [2, 3]],
    chosen: new Set([edgeKey(0, 4), edgeKey(1, 5), edgeKey(2, 3)]),
    unionInfo: 'Reps: S1->2, S2->3, S3->1 (all distinct).'
  };
  const failure = {
    edges: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1]],
    chosen: new Set(),
    unionInfo: 'Union of {S1,S2,S3} = {1,2}: size 2 < 3. No SDR.'
  };

  let mode = 'success';
  function getData() { return mode === 'success' ? success : failure; }
  function mapEdge(l, r) { return edgeKey(l, r + left.length); }

  function draw() {
    const ctx = getCtx('canvas-sdr');
    if (!ctx) return;
    clearCanvas(ctx, 600, 280);

    const d = getData();
    drawLabel(ctx, 'Sets', 150, 20, COLORS.accent, 13);
    drawLabel(ctx, 'Elements', 430, 20, COLORS.accent, 13);

    d.edges.forEach(([li, ri]) => {
      const k = mapEdge(li, ri);
      const inChosen = d.chosen.has(k);
      drawEdge(ctx, left[li].x, left[li].y, right[ri].x, right[ri].y,
        inChosen ? '#fff' : '#333', inChosen ? 3 : 1);
    });

    left.forEach((n) => drawNode(ctx, n.x, n.y, 18, '#aaa', n.label, '#111'));
    right.forEach((n) => drawNode(ctx, n.x, n.y, 16, '#888', n.label, '#111'));

    drawLabel(ctx, d.unionInfo, 300, 262, mode === 'success' ? COLORS.green : COLORS.red, 12);
  }

  function showSuccess() { mode = 'success'; draw(); }
  function showFailure() { mode = 'failure'; draw(); }
  function reset() { mode = 'success'; draw(); }

  setTimeout(draw, 100);
  return { showSuccess, showFailure, reset };
})();

// ============================================================
// LECTURE 27 CLAIM 1 (TREE UNIQUENESS)
// ============================================================
const vizClaimsTree = (() => {
  const nodes = [
    { x: 40, y: 120, label: '0' },
    { x: 120, y: 120, label: '1' },
    { x: 200, y: 120, label: '2' },
    { x: 280, y: 120, label: '3' },
    { x: 360, y: 120, label: '4' },
    { x: 200, y: 200, label: '5' }
  ];
  const edges = [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5]];
  const forcedSteps = [[0, 1], [2, 5], [3, 4]];
  let step = 0;

  function matchedSet() {
    const s = new Set();
    for (let i = 0; i < step; i++) { s.add(forcedSteps[i][0]); s.add(forcedSteps[i][1]); }
    return s;
  }

  function draw() {
    const ctx = getCtx('canvas-claim-tree');
    if (!ctx) return;
    clearCanvas(ctx, 420, 230);

    const matched = matchedSet();
    const newEdge = step > 0 ? edgeKey(forcedSteps[step - 1][0], forcedSteps[step - 1][1]) : null;

    edges.forEach(([u, v]) => {
      const k = edgeKey(u, v);
      let color = '#333'; let width = 1;
      for (let i = 0; i < step; i++) {
        if (k === edgeKey(forcedSteps[i][0], forcedSteps[i][1])) { color = '#ccc'; width = 3; }
      }
      if (k === newEdge) { color = '#fff'; width = 4; }
      drawEdge(ctx, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y, color, width);
    });

    nodes.forEach((n, i) => {
      let fill = '#555';
      if (matched.has(i)) fill = '#bbb';
      drawNode(ctx, n.x, n.y, 15, fill, n.label, matched.has(i) ? '#111' : '#ddd');
    });

    const lbl = document.getElementById('claim-tree-label');
    if (lbl) {
      if (step === 0) lbl.textContent = 'Leaf 0 must match its only neighbor 1.';
      else if (step === 1) lbl.textContent = 'Now leaf 5 must match neighbor 2.';
      else if (step === 2) lbl.textContent = 'Leaf 4 must match neighbor 3.';
      else lbl.textContent = 'Every choice was forced. At most 1 perfect matching.';
    }
  }

  function stepFn() { if (step < forcedSteps.length) step++; draw(); }
  function reset() { step = 0; draw(); }

  setTimeout(draw, 100);
  return { step: stepFn, reset };
})();

// ============================================================
// LECTURE 27 CLAIM 2 (DELTA >= K)
// ============================================================
const vizClaimsDegree = (() => {
  const left = [{ x: 90, y: 45, l: 'a' }, { x: 90, y: 115, l: 'b' }, { x: 90, y: 185, l: 'c' }];
  const right = [{ x: 330, y: 45, l: '1' }, { x: 330, y: 115, l: '2' }, { x: 330, y: 185, l: '3' }];
  const allEdges = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) allEdges.push([i, j]);
  const perfect = new Set([bipKey(0, 0), bipKey(1, 1), bipKey(2, 2)]);
  let show = false;

  function draw() {
    const ctx = getCtx('canvas-claim-degree');
    if (!ctx) return;
    clearCanvas(ctx, 420, 230);

    allEdges.forEach(([i, j]) => {
      const k = bipKey(i, j);
      const on = show && perfect.has(k);
      drawEdge(ctx, left[i].x, left[i].y, right[j].x, right[j].y, on ? '#fff' : '#333', on ? 3 : 1);
    });

    left.forEach((n) => drawNode(ctx, n.x, n.y, 15, '#aaa', n.l, '#111'));
    right.forEach((n) => drawNode(ctx, n.x, n.y, 15, '#888', n.l, '#111'));

    drawLabel(ctx, '|V|=6=2k, delta=3=k', 210, 212, COLORS.dim, 11);
  }

  function toggleMatching() { show = !show; draw(); }
  function reset() { show = false; draw(); }

  setTimeout(draw, 100);
  return { toggleMatching, reset };
})();

// ============================================================
// 1.53 KONIG-EGERVARY
// ============================================================
const vizKonig = (() => {
  const left = [
    { x: 140, y: 50, l: 'x1' }, { x: 140, y: 105, l: 'x2' },
    { x: 140, y: 160, l: 'x3' }, { x: 140, y: 215, l: 'x4' }
  ];
  const right = [
    { x: 460, y: 80, l: 'y1' }, { x: 460, y: 135, l: 'y2' }, { x: 460, y: 190, l: 'y3' }
  ];
  const edges = [[0, 0], [0, 1], [1, 0], [2, 1], [2, 2], [3, 2]];
  const matching = new Set([bipKey(1, 0), bipKey(0, 1), bipKey(3, 2)]);
  const coverY = new Set([0, 1, 2]);
  let mode = 'matching';

  function draw() {
    const ctx = getCtx('canvas-konig');
    if (!ctx) return;
    clearCanvas(ctx, 600, 280);

    edges.forEach(([lx, ry]) => {
      const mk = bipKey(lx, ry);
      const showMatch = mode === 'matching' || mode === 'both';
      const inM = showMatch && matching.has(mk);
      drawEdge(ctx, left[lx].x, left[lx].y, right[ry].x, right[ry].y,
        inM ? '#fff' : '#333', inM ? 3 : 1);
    });

    left.forEach((n) => drawNode(ctx, n.x, n.y, 16, '#aaa', n.l, '#111'));
    right.forEach((n, i) => {
      const showCover = mode === 'cover' || mode === 'both';
      const fill = showCover && coverY.has(i) ? '#fff' : '#888';
      drawNode(ctx, n.x, n.y, 16, fill, n.l, '#111');
    });

    drawLabel(ctx, "|max matching| = |min cover| = 3", 300, 258, COLORS.accent, 13);
  }

  function showMatching() { mode = 'matching'; draw(); }
  function showCover() { mode = 'cover'; draw(); }
  function showBoth() { mode = 'both'; draw(); }
  function reset() { mode = 'matching'; draw(); }

  setTimeout(draw, 100);
  return { showMatching, showCover, showBoth, reset };
})();

// ============================================================
// 1.61 R(3,3)
// ============================================================
const vizRamsey33 = (() => {
  let mode = 'k5';
  let showTri = false;

  function completeEdges(n) {
    const e = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) e.push([i, j]);
    return e;
  }

  function colorK5(u, v) {
    const cyc = new Set([edgeKey(0, 1), edgeKey(1, 2), edgeKey(2, 3), edgeKey(3, 4), edgeKey(4, 0)]);
    return cyc.has(edgeKey(u, v)) ? COLORS.red : COLORS.blue;
  }

  function colorK6(u, v) {
    const redTri = new Set([edgeKey(0, 1), edgeKey(1, 2), edgeKey(0, 2)]);
    return redTri.has(edgeKey(u, v)) ? COLORS.red : COLORS.blue;
  }

  function drawGraph(ctx, n) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
      pts.push({ x: 300 + 95 * Math.cos(a), y: 150 + 95 * Math.sin(a) });
    }

    completeEdges(n).forEach(([u, v]) => {
      const c = mode === 'k5' ? colorK5(u, v) : colorK6(u, v);
      drawEdge(ctx, pts[u].x, pts[u].y, pts[v].x, pts[v].y, c + '99', 2);
    });

    if (mode === 'k6' && showTri) {
      [[0, 1], [1, 2], [0, 2]].forEach(([u, v]) => {
        drawEdge(ctx, pts[u].x, pts[u].y, pts[v].x, pts[v].y, '#fff', 5);
      });
    }

    pts.forEach((p, i) => drawNode(ctx, p.x, p.y, 15, '#bbb', String(i + 1), '#111'));
  }

  function draw() {
    const ctx = getCtx('canvas-ramsey33');
    if (!ctx) return;
    clearCanvas(ctx, 600, 300);

    if (mode === 'k5') {
      drawGraph(ctx, 5);
      drawLabel(ctx, 'K5: no mono triangle possible', 300, 282, COLORS.dim, 13);
    } else {
      drawGraph(ctx, 6);
      drawLabel(ctx, 'K6: mono triangle unavoidable', 300, 282, COLORS.dim, 13);
    }
  }

  function showK5() { mode = 'k5'; showTri = false; draw(); }
  function showK6() { mode = 'k6'; showTri = true; draw(); }
  function toggleTriangle() {
    if (mode !== 'k6') { mode = 'k6'; showTri = true; }
    else showTri = !showTri;
    draw();
  }
  function reset() { mode = 'k5'; showTri = false; draw(); }

  setTimeout(draw, 100);
  return { showK5, showK6, toggleTriangle, reset };
})();

// ============================================================
// 1.62 R(3,4)
// ============================================================
const vizRamsey34 = (() => {
  let mode = 'lower';

  function drawMini(ctx, cx, cy, n, color) {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
      drawNode(ctx, cx + 50 * Math.cos(a), cy + 50 * Math.sin(a), 7, color, '', '#111');
    }
  }

  function drawPanel(ctx, x, title, subtitle, active, color) {
    ctx.fillStyle = active ? '#1a1a1a' : '#111';
    ctx.strokeStyle = active ? color : '#333';
    ctx.lineWidth = active ? 2 : 1;
    ctx.fillRect(x, 20, 240, 175);
    ctx.strokeRect(x, 20, 240, 175);
    drawLabel(ctx, title, x + 120, 40, active ? color : COLORS.dim, 13);
    drawLabel(ctx, subtitle, x + 120, 185, active ? color : COLORS.dim, 11);
  }

  function draw() {
    const ctx = getCtx('canvas-ramsey34');
    if (!ctx) return;
    clearCanvas(ctx, 600, 220);

    const low = mode === 'lower';
    drawPanel(ctx, 35, 'n = 8', 'Avoidable', low, COLORS.orange);
    drawPanel(ctx, 325, 'n = 9', 'Guaranteed', !low, COLORS.green);

    drawMini(ctx, 155, 108, 8, low ? '#aaa' : '#555');
    drawMini(ctx, 445, 108, 9, !low ? '#aaa' : '#555');
  }

  function showLower() { mode = 'lower'; draw(); }
  function showUpper() { mode = 'upper'; draw(); }
  function reset() { mode = 'lower'; draw(); }

  setTimeout(draw, 100);
  return { showLower, showUpper, reset };
})();

// ============================================================
// 1.64 RECURSIVE BOUNDS + 1.64*
// ============================================================
const vizRamseyBounds = (() => {
  let p = 3, q = 4;

  function recBound(a, b, memo = {}) {
    const key = `${a},${b}`;
    if (memo[key] !== undefined) return memo[key];
    if (a === 1 || b === 1) return 1;
    if (a === 2) return b;
    if (b === 2) return a;
    const val = recBound(a - 1, b, memo) + recBound(a, b - 1, memo);
    memo[key] = val;
    return val;
  }

  function improvedBound(a, b) {
    const l = recBound(a - 1, b);
    const r = recBound(a, b - 1);
    return (l % 2 === 0 && r % 2 === 0) ? l + r - 1 : l + r;
  }

  function draw() {
    const ctx = getCtx('canvas-ramsey-bounds');
    if (!ctx) return;
    clearCanvas(ctx, 600, 280);

    const l = recBound(p - 1, q);
    const r = recBound(p, q - 1);
    const rec = l + r;
    const imp = improvedBound(p, q);
    const closed = binom(p + q - 2, p - 1);

    drawLabel(ctx, `R(${p},${q})`, 300, 20, COLORS.accent, 16);
    drawLabel(ctx, `Recursive:  R(${p-1},${q}) + R(${p},${q-1}) = ${l}+${r} = ${rec}`, 300, 48, COLORS.dim, 12);
    drawLabel(ctx, `Improved:   ${imp}${imp < rec ? '  (both pieces even, save 1)' : '  (no parity gain)'}`, 300, 68, COLORS.dim, 12);
    drawLabel(ctx, `Binomial:   C(${p+q-2}, ${p-1}) = ${closed}`, 300, 88, COLORS.dim, 12);

    const maxVal = Math.max(rec, imp, closed, 1);
    const baseY = 240, barW = 110, gap = 40, startX = 60;
    const vals = [rec, imp, closed];
    const labels = ['Recursive', 'Improved', 'Binomial'];
    const fills = ['#888', '#aaa', '#666'];

    for (let i = 0; i < 3; i++) {
      const h = (vals[i] / maxVal) * 120;
      const x = startX + i * (barW + gap);
      const y = baseY - h;
      ctx.fillStyle = fills[i];
      ctx.fillRect(x, y, barW, h);
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barW, h);
      drawLabel(ctx, labels[i], x + barW / 2, 252, COLORS.dim, 11);
      drawLabel(ctx, String(vals[i]), x + barW / 2, y - 10, '#ddd', 13);
    }
  }

  function changeP(d) { p = Math.max(2, Math.min(8, p + d)); draw(); }
  function changeQ(d) { q = Math.max(2, Math.min(8, q + d)); draw(); }
  function reset() { p = 3; q = 4; draw(); }

  setTimeout(draw, 100);
  return { changeP, changeQ, reset };
})();

// ============================================================
// ERDOS-SZEKERES BINOMIAL BOUND
// ============================================================
const vizErdos = (() => {
  const examples = [
    { r: 3, s: 3, exact: 6 },
    { r: 3, s: 4, exact: 9 },
    { r: 3, s: 5, exact: 14 },
    { r: 4, s: 4, exact: 18 },
    { r: 4, s: 5, exact: null }
  ];
  let idx = 0;

  function drawPascal(ctx, rowHi, colHi) {
    const maxRow = 8;
    const startY = 20, dy = 26, dx = 44;

    for (let n = 0; n <= maxRow; n++) {
      for (let k = 0; k <= n; k++) {
        const x = 300 + (k - n / 2) * dx;
        const y = startY + n * dy;
        const isHi = n === rowHi && k === colHi;
        if (isHi) {
          ctx.beginPath();
          ctx.arc(x, y, 16, 0, Math.PI * 2);
          ctx.fillStyle = '#333';
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        drawLabel(ctx, String(binom(n, k)), x, y, isHi ? '#fff' : '#666', 11);
      }
    }
  }

  function draw() {
    const ctx = getCtx('canvas-erdos');
    if (!ctx) return;
    clearCanvas(ctx, 600, 280);

    const ex = examples[idx];
    const row = ex.r + ex.s - 2;
    const col = ex.r - 1;
    const bound = binom(row, col);

    drawPascal(ctx, row, col);
    drawLabel(ctx, `C(${row}, ${col}) = ${bound}`, 300, 248, COLORS.accent, 13);

    const lbl = document.getElementById('erdos-label');
    if (lbl) {
      let text = `R(${ex.r},${ex.s}) <= C(${row},${col}) = ${bound}.`;
      if (ex.exact !== null) text += `  Exact: ${ex.exact}.`;
      lbl.textContent = text;
    }
  }

  function next() { idx = (idx + 1) % examples.length; draw(); }
  function prev() { idx = (idx - 1 + examples.length) % examples.length; draw(); }
  function reset() { idx = 0; draw(); }

  setTimeout(draw, 100);
  return { next, prev, reset };
})();
