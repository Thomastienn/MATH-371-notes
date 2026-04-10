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
  const pathEdges = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5]
  ];
  const extraEdges = [
    [1, 3], [2, 4]
  ];
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
      drawEdge(ctx, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y, '#ffffff22', 2);
    });

    pathEdges.forEach(([u, v]) => {
      drawEdge(ctx, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y, COLORS.orange + '99', 4);
    });

    const matched = currentMatching();
    pathEdges.forEach(([u, v]) => {
      if (matched.has(edgeKey(u, v))) {
        drawEdge(ctx, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y, COLORS.green, 6);
      }
    });

    nodes.forEach((n, i) => {
      let isMatched = false;
      matched.forEach((k) => {
        const [a, b] = k.split('-').map(Number);
        if (a === i || b === i) isMatched = true;
      });
      drawNode(ctx, n.x, n.y, 21, isMatched ? '#c8e6c9' : '#ffe0e0', n.label, '#111');
    });

    const size = matched.size;
    drawLabel(ctx, `|M| = ${size}`, 300, 255, COLORS.accent, 15);
    const lbl = document.getElementById('berge-label');
    if (lbl) {
      lbl.textContent = flipped
        ? 'After flip: matching gained +1 edge, so previous matching was not maximum.'
        : 'Before flip: orange path is augmenting (unmatched endpoints).';
    }
  }

  function flip() {
    flipped = !flipped;
    draw();
  }

  function reset() {
    flipped = false;
    draw();
  }

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
    text: '|S| = 3, |N(S)| = 2  (Hall fails)'
  };

  let mode = 'good';

  function data() {
    return mode === 'good' ? good : bad;
  }

  function draw() {
    const ctx = getCtx('canvas-hall');
    if (!ctx) return;
    clearCanvas(ctx, 600, 280);

    const d = data();

    drawLabel(ctx, 'X', 160, 20, COLORS.accent, 15);
    drawLabel(ctx, 'Y', 440, 20, COLORS.green, 15);

    d.edges.forEach(([i, j]) => {
      const inS = d.S.has(i);
      const inN = d.N.has(j);
      const color = inS && inN ? COLORS.accent + 'bb' : '#ffffff28';
      drawEdge(ctx, left[i].x, left[i].y, right[j].x, right[j].y, color, inS && inN ? 3 : 2);
    });

    left.forEach((n, i) => {
      drawNode(ctx, n.x, n.y, 20, d.S.has(i) ? '#dbeafe' : COLORS.node, n.label, '#111');
    });
    right.forEach((n, i) => {
      drawNode(ctx, n.x, n.y, 20, d.N.has(i) ? '#dcfce7' : COLORS.node, n.label, '#111');
    });

    drawLabel(ctx, d.text, 300, 262, mode === 'good' ? COLORS.green : COLORS.red, 14);
    const lbl = document.getElementById('hall-label');
    if (lbl) {
      lbl.textContent = mode === 'good'
        ? 'No bottleneck: every highlighted subset has enough neighbors.'
        : 'Bottleneck detected: highlighted subset has fewer neighbors than vertices.';
    }
  }

  function showGood() {
    mode = 'good';
    draw();
  }

  function showBad() {
    mode = 'bad';
    draw();
  }

  function reset() {
    mode = 'good';
    draw();
  }

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
    unionInfo: 'Choose reps: S1->2, S2->3, S3->1 (all distinct).'
  };

  const failure = {
    edges: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1]],
    chosen: new Set(),
    unionInfo: 'For {S1,S2,S3}, union = {1,2}: size 2 < 3, so SDR impossible.'
  };

  let mode = 'success';

  function getData() {
    return mode === 'success' ? success : failure;
  }

  function mapEdge(l, r) {
    return edgeKey(l, r + left.length);
  }

  function draw() {
    const ctx = getCtx('canvas-sdr');
    if (!ctx) return;
    clearCanvas(ctx, 600, 280);

    const d = getData();
    drawLabel(ctx, 'Set Vertices', 150, 20, COLORS.accent, 14);
    drawLabel(ctx, 'Element Vertices', 430, 20, COLORS.green, 14);

    d.edges.forEach(([li, ri]) => {
      const k = mapEdge(li, ri);
      const inChosen = d.chosen.has(k);
      drawEdge(
        ctx,
        left[li].x,
        left[li].y,
        right[ri].x,
        right[ri].y,
        inChosen ? COLORS.green : '#ffffff28',
        inChosen ? 4 : 2
      );
    });

    left.forEach((n) => drawNode(ctx, n.x, n.y, 20, '#dbeafe', n.label, '#111'));
    right.forEach((n) => drawNode(ctx, n.x, n.y, 18, '#dcfce7', n.label, '#111'));

    drawLabel(ctx, d.unionInfo, 300, 262, mode === 'success' ? COLORS.green : COLORS.red, 13);
    const lbl = document.getElementById('sdr-label');
    if (lbl) {
      lbl.textContent = mode === 'success'
        ? 'Green edges form an SDR (distinct reps).'
        : 'Hall condition fails for a 3-set subcollection.';
    }
  }

  function showSuccess() {
    mode = 'success';
    draw();
  }

  function showFailure() {
    mode = 'failure';
    draw();
  }

  function reset() {
    mode = 'success';
    draw();
  }

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
    for (let i = 0; i < step; i++) {
      s.add(forcedSteps[i][0]);
      s.add(forcedSteps[i][1]);
    }
    return s;
  }

  function leavesOfResidual(matched) {
    const deg = Array(nodes.length).fill(0);
    edges.forEach(([u, v]) => {
      if (!matched.has(u) && !matched.has(v)) {
        deg[u]++;
        deg[v]++;
      }
    });
    const leaves = new Set();
    for (let i = 0; i < nodes.length; i++) {
      if (!matched.has(i) && deg[i] === 1) leaves.add(i);
    }
    return leaves;
  }

  function draw() {
    const ctx = getCtx('canvas-claim-tree');
    if (!ctx) return;
    clearCanvas(ctx, 420, 230);

    const matched = matchedSet();
    const leaves = leavesOfResidual(matched);
    const newEdge = step > 0 ? edgeKey(forcedSteps[step - 1][0], forcedSteps[step - 1][1]) : null;

    edges.forEach(([u, v]) => {
      const k = edgeKey(u, v);
      let color = '#ffffff22';
      let width = 2;
      for (let i = 0; i < step; i++) {
        if (k === edgeKey(forcedSteps[i][0], forcedSteps[i][1])) {
          color = COLORS.green;
          width = 4;
        }
      }
      if (k === newEdge) {
        color = COLORS.yellow;
        width = 5;
      }
      drawEdge(ctx, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y, color, width);
    });

    nodes.forEach((n, i) => {
      let fill = COLORS.node;
      if (matched.has(i)) fill = '#c8e6c9';
      else if (leaves.has(i)) fill = '#fde68a';
      drawNode(ctx, n.x, n.y, 16, fill, n.label, '#111');
    });

    const lbl = document.getElementById('claim-tree-label');
    if (lbl) {
      if (step === 0) lbl.textContent = 'Leaves force choices: pick a leaf edge first.';
      else if (step === 1) lbl.textContent = 'After matching (0,1), a new leaf is forced.';
      else if (step === 2) lbl.textContent = 'After matching (2,5), only one completion remains.';
      else lbl.textContent = 'Perfect matching is forced edge-by-edge, so it is unique.';
    }
  }

  function stepFn() {
    if (step < forcedSteps.length) step++;
    draw();
  }

  function reset() {
    step = 0;
    draw();
  }

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
      drawEdge(ctx, left[i].x, left[i].y, right[j].x, right[j].y, on ? COLORS.green : '#ffffff22', on ? 4 : 2);
    });

    left.forEach((n) => drawNode(ctx, n.x, n.y, 16, '#dbeafe', n.l, '#111'));
    right.forEach((n) => drawNode(ctx, n.x, n.y, 16, '#dcfce7', n.l, '#111'));

    drawLabel(ctx, '|V| = 6 = 2k,  delta = 3 = k', 210, 212, COLORS.accent, 12);
    const lbl = document.getElementById('claim-degree-label');
    if (lbl) {
      lbl.textContent = show
        ? 'One perfect matching highlighted (existence guaranteed).'
        : 'Dense graph example with min degree meeting the threshold.';
    }
  }

  function toggleMatching() {
    show = !show;
    draw();
  }

  function reset() {
    show = false;
    draw();
  }

  setTimeout(draw, 100);
  return { toggleMatching, reset };
})();

// ============================================================
// 1.53 KONIG-EGERVARY
// ============================================================
const vizKonig = (() => {
  const left = [
    { x: 140, y: 50, l: 'x1' },
    { x: 140, y: 105, l: 'x2' },
    { x: 140, y: 160, l: 'x3' },
    { x: 140, y: 215, l: 'x4' }
  ];
  const right = [
    { x: 460, y: 80, l: 'y1' },
    { x: 460, y: 135, l: 'y2' },
    { x: 460, y: 190, l: 'y3' }
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
      drawEdge(ctx, left[lx].x, left[lx].y, right[ry].x, right[ry].y, inM ? COLORS.green : '#ffffff26', inM ? 4 : 2);
    });

    left.forEach((n) => drawNode(ctx, n.x, n.y, 18, '#dbeafe', n.l, '#111'));
    right.forEach((n, i) => {
      const showCover = mode === 'cover' || mode === 'both';
      const fill = showCover && coverY.has(i) ? '#fde68a' : '#dcfce7';
      drawNode(ctx, n.x, n.y, 18, fill, n.l, '#111');
    });

    drawLabel(ctx, "|max matching| = 3  and  |min vertex cover| = 3", 300, 258, COLORS.accent, 14);
    const lbl = document.getElementById('konig-label');
    if (lbl) {
      if (mode === 'matching') lbl.textContent = 'Green edges show a maximum matching of size 3.';
      else if (mode === 'cover') lbl.textContent = 'Yellow vertices form a minimum vertex cover of size 3.';
      else lbl.textContent = 'Both overlays agree in size: alpha\'(G) = beta(G) = 3.';
    }
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
    const cyc = new Set([
      edgeKey(0, 1), edgeKey(1, 2), edgeKey(2, 3), edgeKey(3, 4), edgeKey(4, 0)
    ]);
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
      drawEdge(ctx, pts[u].x, pts[u].y, pts[v].x, pts[v].y, c + 'aa', 2.5);
    });

    if (mode === 'k6' && showTri) {
      [[0, 1], [1, 2], [0, 2]].forEach(([u, v]) => {
        drawEdge(ctx, pts[u].x, pts[u].y, pts[v].x, pts[v].y, COLORS.yellow, 6);
      });
    }

    pts.forEach((p, i) => drawNode(ctx, p.x, p.y, 17, COLORS.node, String(i + 1), '#111'));
  }

  function draw() {
    const ctx = getCtx('canvas-ramsey33');
    if (!ctx) return;
    clearCanvas(ctx, 600, 300);

    if (mode === 'k5') {
      drawGraph(ctx, 5);
      drawLabel(ctx, 'K5 coloring with no monochromatic triangle', 300, 282, COLORS.orange, 14);
    } else {
      drawGraph(ctx, 6);
      drawLabel(ctx, 'K6 example with a monochromatic triangle', 300, 282, COLORS.green, 14);
    }

    const lbl = document.getElementById('ramsey33-label');
    if (lbl) {
      if (mode === 'k5') lbl.textContent = 'Lower bound witness: R(3,3) > 5.';
      else lbl.textContent = showTri
        ? 'Highlighted monochromatic triangle (forced phenomenon at 6 vertices).'
        : 'Use toggle to highlight a monochromatic triangle.';
    }
  }

  function showK5() { mode = 'k5'; showTri = false; draw(); }
  function showK6() { mode = 'k6'; showTri = true; draw(); }
  function toggleTriangle() {
    if (mode !== 'k6') {
      mode = 'k6';
      showTri = true;
    } else {
      showTri = !showTri;
    }
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

  function drawMini(ctx, cx, cy, n, highlightColor) {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
      drawNode(
        ctx,
        cx + 55 * Math.cos(a),
        cy + 55 * Math.sin(a),
        9,
        highlightColor,
        '',
        '#111'
      );
    }
  }

  function drawPanel(ctx, x, title, subtitle, active, color) {
    ctx.fillStyle = active ? color + '22' : '#ffffff08';
    ctx.strokeStyle = active ? color : '#ffffff22';
    ctx.lineWidth = active ? 2.5 : 1.2;
    ctx.fillRect(x, 20, 250, 180);
    ctx.strokeRect(x, 20, 250, 180);
    drawLabel(ctx, title, x + 125, 42, active ? color : COLORS.text, 14);
    drawLabel(ctx, subtitle, x + 125, 190, active ? color : COLORS.dim, 12);
  }

  function draw() {
    const ctx = getCtx('canvas-ramsey34');
    if (!ctx) return;
    clearCanvas(ctx, 600, 220);

    const low = mode === 'lower';
    const up = mode === 'upper';

    drawPanel(ctx, 30, 'n = 8', 'Not guaranteed', low, COLORS.orange);
    drawPanel(ctx, 320, 'n = 9', 'Guaranteed', up, COLORS.green);

    drawMini(ctx, 155, 110, 8, low ? '#fed7aa' : '#e5e7eb');
    drawMini(ctx, 445, 110, 9, up ? '#bbf7d0' : '#e5e7eb');

    const lbl = document.getElementById('ramsey34-label');
    if (lbl) {
      lbl.textContent = low
        ? 'Lower side: there exists an 8-vertex coloring avoiding red K3 and blue K4.'
        : 'Upper side: every 9-vertex coloring forces red K3 or blue K4.';
    }
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
  let p = 3;
  let q = 4;

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
    const left = recBound(a - 1, b);
    const right = recBound(a, b - 1);
    if (left % 2 === 0 && right % 2 === 0) return left + right - 1;
    return left + right;
  }

  function drawBars(ctx, values, labels, colors) {
    const maxVal = Math.max(...values, 1);
    const baseY = 240;
    const barW = 120;
    const gap = 45;
    const startX = 55;

    for (let i = 0; i < values.length; i++) {
      const h = (values[i] / maxVal) * 130;
      const x = startX + i * (barW + gap);
      const y = baseY - h;
      ctx.fillStyle = colors[i] + 'bb';
      ctx.fillRect(x, y, barW, h);
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, barW, h);
      drawLabel(ctx, labels[i], x + barW / 2, 252, COLORS.text, 12);
      drawLabel(ctx, String(values[i]), x + barW / 2, y - 10, colors[i], 13);
    }
  }

  function draw() {
    const ctx = getCtx('canvas-ramsey-bounds');
    if (!ctx) return;
    clearCanvas(ctx, 600, 280);

    const left = recBound(p - 1, q);
    const right = recBound(p, q - 1);
    const rec = left + right;
    const imp = improvedBound(p, q);
    const closed = binom(p + q - 2, p - 1);

    drawLabel(ctx, `p = ${p}, q = ${q}`, 300, 20, COLORS.accent, 15);
    drawLabel(ctx, `R(p,q) <= R(p-1,q)+R(p,q-1) = ${left}+${right} = ${rec}`, 300, 42, COLORS.text, 12);
    drawLabel(ctx, `Improved: ${imp}   (only when both pieces are even)`, 300, 62, COLORS.green, 12);
    drawLabel(ctx, `Erdos-Szekeres: C(p+q-2, p-1) = C(${p + q - 2}, ${p - 1}) = ${closed}`, 300, 82, COLORS.yellow, 12);

    drawBars(
      ctx,
      [rec, imp, closed],
      ['Recursive', 'Improved', 'Binomial'],
      [COLORS.blue, COLORS.green, COLORS.yellow]
    );

    const lbl = document.getElementById('ramsey-bounds-label');
    if (lbl) {
      const parityMsg = left % 2 === 0 && right % 2 === 0
        ? 'Parity condition satisfied: improved bound is recursive bound minus 1.'
        : 'Parity condition not satisfied: improved bound equals recursive bound.';
      lbl.textContent = parityMsg;
    }
  }

  function changeP(d) {
    p = Math.max(2, Math.min(8, p + d));
    draw();
  }

  function changeQ(d) {
    q = Math.max(2, Math.min(8, q + d));
    draw();
  }

  function reset() {
    p = 3;
    q = 4;
    draw();
  }

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
    const startY = 20;
    const dy = 26;
    const dx = 44;

    for (let n = 0; n <= maxRow; n++) {
      for (let k = 0; k <= n; k++) {
        const x = 300 + (k - n / 2) * dx;
        const y = startY + n * dy;
        const isHi = n === rowHi && k === colHi;
        if (isHi) {
          ctx.beginPath();
          ctx.arc(x, y, 16, 0, Math.PI * 2);
          ctx.fillStyle = COLORS.yellow + '66';
          ctx.fill();
          ctx.strokeStyle = COLORS.yellow;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        drawLabel(ctx, String(binom(n, k)), x, y, isHi ? COLORS.yellow : '#cbd5e1', 11);
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
    drawLabel(ctx, `Highlight: C(${row}, ${col}) = ${bound}`, 300, 248, COLORS.accent, 14);

    const lbl = document.getElementById('erdos-label');
    if (lbl) {
      let text = `For (r,s)=(${ex.r},${ex.s}), R(r,s) <= C(${row},${col}) = ${bound}.`;
      if (ex.exact !== null) text += ` Known exact value: ${ex.exact}.`;
      lbl.textContent = text;
    }
  }

  function next() {
    idx = (idx + 1) % examples.length;
    draw();
  }

  function prev() {
    idx = (idx - 1 + examples.length) % examples.length;
    draw();
  }

  function reset() {
    idx = 0;
    draw();
  }

  setTimeout(draw, 100);
  return { next, prev, reset };
})();
