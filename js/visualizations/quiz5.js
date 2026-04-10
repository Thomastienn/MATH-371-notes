// ============================================================
// QUIZ 5 VISUALS: MATCHINGS AND RAMSEY THEORY
// ============================================================

function edgeKey(u, v) {
  return u < v ? `${u}-${v}` : `${v}-${u}`;
}
function bipKey(l, r) { return `${l}|${r}`; }
function binom(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let v = 1;
  for (let i = 1; i <= Math.min(k, n - k); i++) v = v * (n - Math.min(k, n - k) + i) / i;
  return Math.round(v);
}
function lerp(a, b, t) { return a + (b - a) * t; }
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

function drawDashedEdge(ctx, x1, y1, x2, y2, color, width) {
  ctx.save();
  ctx.setLineDash([6, 4]);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
  ctx.restore();
}

function drawArrowLabel(ctx, text, x, y, color, size) {
  ctx.fillStyle = color || '#aaa';
  ctx.font = `bold ${size || 11}px Inter, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function animateSteps(viz, draw, maxStep) {
  return {
    next() { if (viz.step < maxStep) { viz.step++; draw(); } },
    prev() { if (viz.step > 0) { viz.step--; draw(); } },
    reset() { viz.step = 0; draw(); },
    autoPlay() {
      viz.step = 0; draw();
      let i = 0;
      const iv = setInterval(() => {
        if (i >= maxStep) { clearInterval(iv); return; }
        viz.step = ++i; draw();
      }, 900);
      viz._iv = iv;
    }
  };
}

// ============================================================
// 1.50 BERGE — Animated augmenting path discovery + flip
// ============================================================
const vizBerge = (() => {
  const nodes = [
    { x: 45,  y: 70,  label: 'u' },
    { x: 135, y: 140, label: 'a' },
    { x: 225, y: 70,  label: 'b' },
    { x: 315, y: 140, label: 'c' },
    { x: 405, y: 70,  label: 'd' },
    { x: 495, y: 140, label: 'v' },
    { x: 135, y: 220, label: 'w' },
    { x: 405, y: 220, label: 'z' }
  ];
  const allEdges = [[0,1],[1,2],[2,3],[3,4],[4,5],[1,6],[3,7],[2,6],[2,7]];
  const pathEdges = [0,1,2,3,4];
  const matchBefore = new Set([1,3]);
  const matchAfter = new Set([0,2,4]);
  const state = { step: 0 };

  const steps = [
    { msg: 'Graph with matching M (bold white). Vertices u and v are FREE (unmatched).', hi: [] },
    { msg: 'Start from free vertex u. Edge u-a is NOT in M → follow it.', hi: [0] },
    { msg: 'Edge a-b IS in M → follow it (alternating!).', hi: [0,1] },
    { msg: 'Edge b-c is NOT in M → follow it.', hi: [0,1,2] },
    { msg: 'Edge c-d IS in M → follow it.', hi: [0,1,2,3] },
    { msg: 'Edge d-v is NOT in M, and v is FREE → augmenting path found!', hi: [0,1,2,3,4] },
    { msg: 'FLIP! Swap matched/unmatched along the path. |M| goes from 2 to 3!', hi: [0,1,2,3,4] }
  ];

  function draw() {
    const ctx = getCtx('canvas-berge'); if (!ctx) return;
    clearCanvas(ctx, 600, 280);
    const s = state.step;
    const flipped = s >= 6;
    const matched = flipped ? matchAfter : matchBefore;
    const hiSet = new Set(s < steps.length ? steps[s].hi : []);

    allEdges.forEach(([u,v], ei) => {
      const inPath = pathEdges.includes(ei);
      const inM = matched.has(ei);
      let color = '#252525', width = 1;
      if (inPath && inM) { color = '#fff'; width = 3.5; }
      else if (inPath) { color = '#555'; width = 2; }

      if (hiSet.has(ei)) {
        const wasM = matchBefore.has(ei);
        color = wasM ? COLORS.yellow : COLORS.green;
        width = 4;
      }
      drawEdge(ctx, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y, color, width);
    });

    if (s >= 1 && s < 6) {
      const pathSoFar = steps[s].hi;
      pathSoFar.forEach((ei) => {
        const [u,v] = allEdges[ei];
        const wasM = matchBefore.has(ei);
        if (wasM) {
          drawDashedEdge(ctx, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y, COLORS.yellow, 3);
        }
      });
    }

    nodes.forEach((n, i) => {
      let fill = '#444', tc = '#ccc';
      const free = (i === 0 || i === 5);
      if (free && !flipped) { fill = COLORS.red; tc = '#fff'; }
      else {
        let isMatched = false;
        matched.forEach(ei => { const [a,b] = allEdges[ei]; if (a===i||b===i) isMatched = true; });
        if (isMatched) { fill = '#bbb'; tc = '#111'; }
      }
      if (flipped && (i===0||i===1||i===2||i===3||i===4||i===5)) { fill = COLORS.green; tc = '#111'; }
      drawNode(ctx, n.x, n.y, 18, fill, n.label, tc);
    });

    const mSize = flipped ? 3 : 2;
    drawLabel(ctx, `|M| = ${mSize}`, 550, 30, COLORS.accent, 14);
    if (s >= 5 && !flipped) {
      drawArrowLabel(ctx, '⬆ AUGMENTING PATH FOUND', 300, 260, COLORS.green, 13);
    }
    if (flipped) {
      drawArrowLabel(ctx, '✓ FLIPPED! |M| = 2 → 3', 300, 260, COLORS.green, 14);
    }
    const lbl = document.getElementById('berge-label');
    if (lbl) lbl.textContent = steps[Math.min(s, steps.length-1)].msg;
  }

  function flip() { state.step = 6; draw(); }
  const ctrl = animateSteps(state, draw, 6);
  setTimeout(draw, 100);
  return { flip, next: ctrl.next, reset: ctrl.reset, autoPlay: ctrl.autoPlay };
})();

// ============================================================
// 1.51 HALL — Animated matching construction (two cases)
// ============================================================
const vizHall = (() => {
  const LX = 140, RX = 460, R = 16;
  const left  = [{y:50},{y:105},{y:160},{y:215}];
  const right = [{y:50},{y:105},{y:160},{y:215}];

  const goodEdges = [[0,0],[0,1],[1,1],[1,2],[2,2],[2,3],[3,0],[3,3]];
  const badEdges  = [[0,0],[1,0],[1,1],[2,1],[3,2]];

  const goodSteps = [
    { msg: 'Bipartite graph. Hall holds: every subset S has |N(S)| ≥ |S|.', S:[], N:[], M:[] },
    { msg: 'Check S={x1,x2,x3}: N(S)={y1,y2,y3,y4}, |4|≥|3| ✓', S:[0,1,2], N:[0,1,2,3], M:[] },
    { msg: 'Case 1: strict inequality. Pick x1, match to y1.', S:[], N:[], M:[[0,0]] },
    { msg: 'Remove x1,y1. Match x2→y2.', S:[], N:[], M:[[0,0],[1,1]] },
    { msg: 'Remove x2,y2. Match x3→y3.', S:[], N:[], M:[[0,0],[1,1],[2,2]] },
    { msg: 'Match x4→y4. Everyone matched! ✓', S:[], N:[], M:[[0,0],[1,1],[2,2],[3,3]] }
  ];
  const badSteps = [
    { msg: 'Hall FAILS: S={x1,x2,x3} all connect to {y1,y2} only.', S:[0,1,2], N:[0,1], M:[] },
    { msg: '|N(S)|=2 < |S|=3. Bottleneck! No matching can saturate X.', S:[0,1,2], N:[0,1], M:[] }
  ];

  let mode = 'good';
  const state = { step: 0 };
  function curSteps() { return mode === 'good' ? goodSteps : badSteps; }
  function curEdges() { return mode === 'good' ? goodEdges : badEdges; }

  function draw() {
    const ctx = getCtx('canvas-hall'); if (!ctx) return;
    clearCanvas(ctx, 600, 280);
    const st = curSteps()[Math.min(state.step, curSteps().length-1)];
    const sSet = new Set(st.S), nSet = new Set(st.N);
    const mSet = new Set(st.M.map(([l,r]) => `${l},${r}`));

    drawLabel(ctx, 'X', LX, 25, COLORS.accent, 13);
    drawLabel(ctx, 'Y', RX, 25, COLORS.accent, 13);

    curEdges().forEach(([li,ri]) => {
      const inM = mSet.has(`${li},${ri}`);
      const inS = sSet.has(li) && nSet.has(ri);
      let c = '#252525', w = 1;
      if (inM) { c = '#fff'; w = 4; }
      else if (inS) { c = '#666'; w = 2; }
      drawEdge(ctx, LX, left[li].y, RX, right[ri].y, c, w);
    });

    left.forEach((n,i) => {
      const inS = sSet.has(i);
      const matched = st.M.some(([l]) => l === i);
      let fill = '#444';
      if (matched) fill = COLORS.green;
      else if (inS) fill = mode === 'good' ? COLORS.blue : COLORS.red;
      drawNode(ctx, LX, n.y, R, fill, `x${i+1}`, '#fff');
    });
    right.forEach((n,i) => {
      const inN = nSet.has(i);
      const matched = st.M.some(([,r]) => r === i);
      let fill = '#444';
      if (matched) fill = COLORS.green;
      else if (inN) fill = mode === 'good' ? COLORS.blue : COLORS.red;
      drawNode(ctx, RX, n.y, R, fill, `y${i+1}`, '#fff');
    });

    const lbl = document.getElementById('hall-label');
    if (lbl) lbl.textContent = st.msg;
  }

  function showGood() { mode = 'good'; state.step = 0; draw(); }
  function showBad() { mode = 'bad'; state.step = 0; draw(); }
  function next() { if (state.step < curSteps().length-1) { state.step++; draw(); } }
  function reset() { state.step = 0; draw(); }
  function autoPlay() {
    state.step = 0; draw();
    let i = 0;
    const iv = setInterval(() => {
      if (i >= curSteps().length-1) { clearInterval(iv); return; }
      state.step = ++i; draw();
    }, 1200);
  }

  setTimeout(draw, 100);
  return { showGood, showBad, next, reset, autoPlay };
})();

// ============================================================
// 1.52 SDR
// ============================================================
const vizSDR = (() => {
  const LX = 150, RX = 430;
  const left  = [{y:70,l:'S₁'},{y:140,l:'S₂'},{y:210,l:'S₃'}];
  const right = [{y:45,l:'a'},{y:105,l:'b'},{y:165,l:'c'},{y:225,l:'d'}];

  const successEdges = [[0,0],[0,1],[1,1],[1,2],[2,0],[2,3]];
  const failEdges    = [[0,0],[0,1],[1,0],[1,1],[2,0],[2,1]];

  const successSteps = [
    { msg: 'Sets: S₁={a,b}, S₂={b,c}, S₃={a,d}. Need one distinct pick each.', chosen:[] },
    { msg: 'Pick a from S₁.', chosen:[[0,0]] },
    { msg: 'Pick b from S₂ (a taken).', chosen:[[0,0],[1,1]] },
    { msg: 'Pick d from S₃ (a taken). SDR = {a,b,d} ✓', chosen:[[0,0],[1,1],[2,3]] }
  ];
  const failSteps = [
    { msg: 'Sets: S₁={a,b}, S₂={a,b}, S₃={a,b}. All 3 share only {a,b}.', chosen:[] },
    { msg: '|∪S₁,S₂,S₃| = 2 < 3 = |I|. Hall condition fails. No SDR!', chosen:[] }
  ];

  let mode = 'success';
  const state = { step: 0 };
  function curSteps() { return mode === 'success' ? successSteps : failSteps; }
  function curEdges() { return mode === 'success' ? successEdges : failEdges; }

  function draw() {
    const ctx = getCtx('canvas-sdr'); if (!ctx) return;
    clearCanvas(ctx, 600, 280);
    const st = curSteps()[Math.min(state.step, curSteps().length-1)];
    const chosenSet = new Set(st.chosen.map(([l,r]) => `${l},${r}`));

    drawLabel(ctx, 'Sets', LX, 25, COLORS.accent, 12);
    drawLabel(ctx, 'Elements', RX, 25, COLORS.accent, 12);

    curEdges().forEach(([li,ri]) => {
      const ch = chosenSet.has(`${li},${ri}`);
      drawEdge(ctx, LX, left[li].y, RX, right[ri].y, ch ? '#fff' : '#303030', ch ? 4 : 1);
    });

    left.forEach((n,i) => {
      const matched = st.chosen.some(([l]) => l === i);
      drawNode(ctx, LX, n.y, 18, matched ? COLORS.green : '#666', n.l, '#fff');
    });
    right.forEach((n,i) => {
      const matched = st.chosen.some(([,r]) => r === i);
      drawNode(ctx, RX, n.y, 16, matched ? COLORS.green : '#555', n.l, '#fff');
    });

    const lbl = document.getElementById('sdr-label');
    if (lbl) lbl.textContent = st.msg;
  }

  function showSuccess() { mode = 'success'; state.step = 0; draw(); }
  function showFailure() { mode = 'failure'; state.step = 0; draw(); }
  function next() { if (state.step < curSteps().length-1) { state.step++; draw(); } }
  function reset() { state.step = 0; draw(); }
  function autoPlay() {
    state.step = 0; draw();
    let i = 0;
    const iv = setInterval(() => {
      if (i >= curSteps().length-1) { clearInterval(iv); return; }
      state.step = ++i; draw();
    }, 1100);
  }

  setTimeout(draw, 100);
  return { showSuccess, showFailure, next, reset, autoPlay };
})();

// ============================================================
// LECTURE 27 CLAIM 1 — Animated leaf-forcing
// ============================================================
const vizClaimsTree = (() => {
  const nodes = [
    {x:35,y:115,l:'a'},{x:110,y:115,l:'b'},{x:185,y:60,l:'c'},
    {x:185,y:170,l:'d'},{x:260,y:60,l:'e'},{x:335,y:60,l:'f'},{x:335,y:170,l:'g'}
  ];
  const edges = [[0,1],[1,2],[1,3],[2,4],[4,5],[3,6]];
  const forcedOrder = [
    { e:0, why:'Leaf a → must match b', leaf:0, partner:1 },
    { e:4, why:'Leaf f → must match e', leaf:5, partner:4 },
    { e:5, why:'Leaf g → must match d', leaf:6, partner:3 },
    { e:1, why:'Leaf c left alone (no PM exists!) — or if even: forced.', leaf:2, partner:null }
  ];
  const state = { step: 0 };

  function draw() {
    const ctx = getCtx('canvas-claim-tree'); if (!ctx) return;
    clearCanvas(ctx, 420, 230);
    const matchedNodes = new Set();
    const matchedEdges = new Set();
    for (let i = 0; i < Math.min(state.step, forcedOrder.length); i++) {
      const f = forcedOrder[i];
      matchedEdges.add(f.e);
      matchedNodes.add(f.leaf);
      if (f.partner !== null) matchedNodes.add(f.partner);
    }

    edges.forEach(([u,v], ei) => {
      const inM = matchedEdges.has(ei);
      drawEdge(ctx, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y,
        inM ? '#fff' : '#333', inM ? 4 : 1.5);
    });

    const curLeaf = state.step > 0 && state.step <= forcedOrder.length ? forcedOrder[state.step-1].leaf : -1;
    nodes.forEach((n,i) => {
      let fill = '#444', tc = '#ccc';
      if (matchedNodes.has(i)) { fill = COLORS.green; tc = '#111'; }
      if (i === curLeaf) { fill = COLORS.yellow; tc = '#111'; }
      drawNode(ctx, n.x, n.y, 16, fill, n.l, tc);
    });

    const lbl = document.getElementById('claim-tree-label');
    if (lbl) {
      if (state.step === 0) lbl.textContent = 'Identify leaves. Each has ONE neighbor → forced.';
      else if (state.step <= forcedOrder.length) lbl.textContent = forcedOrder[state.step-1].why;
      else lbl.textContent = 'Every choice was forced → at most 1 PM.';
    }
  }

  const ctrl = animateSteps(state, draw, forcedOrder.length);
  setTimeout(draw, 100);
  return { step: ctrl.next, next: ctrl.next, reset: ctrl.reset };
})();

// ============================================================
// LECTURE 27 CLAIM 2 — Hamiltonian cycle → alternate edges PM
// ============================================================
const vizClaimsDegree = (() => {
  const N = 6;
  const nodes = [];
  for (let i = 0; i < N; i++) {
    const a = -Math.PI/2 + 2*Math.PI*i/N;
    nodes.push({ x: 210 + 85*Math.cos(a), y: 115 + 85*Math.sin(a), l: String(i+1) });
  }
  const allEdges = [];
  for (let i = 0; i < N; i++) for (let j = i+1; j < N; j++) allEdges.push([i,j]);
  const hamCycle = [0,1,2,3,4,5];
  const hamEdges = hamCycle.map((v,i) => [v, hamCycle[(i+1)%N]]);
  const pmEdges = hamEdges.filter((_,i) => i%2===0);

  const state = { step: 0 };
  const steps = [
    { msg: 'K₃,₃ with |V|=6, δ=3=k. Dirac applies (δ≥n/2).', showAll:true, showHam:false, showPM:false },
    { msg: 'Dirac guarantees a Hamiltonian cycle (yellow).', showAll:true, showHam:true, showPM:false },
    { msg: 'Take every other edge of the cycle → perfect matching (green)!', showAll:false, showHam:true, showPM:true }
  ];

  function draw() {
    const ctx = getCtx('canvas-claim-degree'); if (!ctx) return;
    clearCanvas(ctx, 420, 230);
    const st = steps[Math.min(state.step, steps.length-1)];

    if (st.showAll) {
      allEdges.forEach(([u,v]) => {
        drawEdge(ctx, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y, '#252525', 1);
      });
    }
    if (st.showHam) {
      hamEdges.forEach(([u,v], i) => {
        const inPM = st.showPM && i%2===0;
        drawEdge(ctx, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y,
          inPM ? COLORS.green : COLORS.yellow, inPM ? 5 : 2.5);
      });
    }
    if (st.showPM) {
      pmEdges.forEach(([u,v]) => {
        drawEdge(ctx, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y, COLORS.green, 5);
      });
    }

    nodes.forEach(n => drawNode(ctx, n.x, n.y, 15, '#bbb', n.l, '#111'));

    const lbl = document.getElementById('claim-degree-label');
    if (lbl) lbl.textContent = st.msg;
  }

  function toggleMatching() { state.step = (state.step+1) % steps.length; draw(); }
  function reset() { state.step = 0; draw(); }

  setTimeout(draw, 100);
  return { toggleMatching, next: toggleMatching, reset };
})();

// ============================================================
// 1.53 KONIG — Animated cover construction
// ============================================================
const vizKonig = (() => {
  const LX = 130, RX = 470, R = 16;
  const left  = [{y:55,l:'x₁'},{y:115,l:'x₂'},{y:175,l:'x₃'},{y:235,l:'x₄'}];
  const right = [{y:75,l:'y₁'},{y:140,l:'y₂'},{y:205,l:'y₃'}];
  const edges = [[0,0],[0,1],[1,0],[2,1],[2,2],[3,2]];
  const matching = [[1,0],[0,1],[3,2]];
  const matchSet = new Set(matching.map(([l,r]) => `${l},${r}`));

  const state = { step: 0 };
  const steps = [
    { msg: 'Bipartite graph. Find max matching first.', phase:'graph' },
    { msg: 'Max matching M (bold): x₂-y₁, x₁-y₂, x₄-y₃. |M|=3.', phase:'matching' },
    { msg: 'Unmatched left vertices: U = {x₃}. Start alternating paths from U.', phase:'unmatched' },
    { msg: 'From x₃: edge x₃-y₂ (non-M) → y₂-x₁ (M) → x₁-y₁ (non-M) → y₁-x₂ (M). Z = reachable set.', phase:'paths' },
    { msg: 'Cover C = (X\\Z) ∪ (Y∩Z) = {x₄} ∪ {y₁,y₂} = 3 vertices. |C|=|M|=3!', phase:'cover' },
    { msg: 'Check: every edge touches a cover vertex ✓. Max matching = Min cover = 3.', phase:'done' }
  ];

  const reachZ_X = new Set([2,0,1]);
  const reachZ_Y = new Set([1,0]);
  const coverX = new Set([3]);
  const coverY = new Set([0,1]);

  function draw() {
    const ctx = getCtx('canvas-konig'); if (!ctx) return;
    clearCanvas(ctx, 600, 280);
    const st = steps[Math.min(state.step, steps.length-1)];

    drawLabel(ctx, 'X', LX, 25, '#666', 12);
    drawLabel(ctx, 'Y', RX, 25, '#666', 12);

    edges.forEach(([li,ri]) => {
      const inM = matchSet.has(`${li},${ri}`);
      const showM = st.phase !== 'graph';
      let c = '#252525', w = 1;
      if (showM && inM) { c = '#fff'; w = 4; }

      if (st.phase === 'paths') {
        if (li===2 && ri===1) { c = COLORS.yellow; w = 3; }
        if (li===0 && ri===1) { c = COLORS.yellow; w = 3; }
        if (li===0 && ri===0) { c = COLORS.yellow; w = 3; }
        if (li===1 && ri===0) { c = COLORS.yellow; w = 3; }
      }
      drawEdge(ctx, LX, left[li].y, RX, right[ri].y, c, w);
    });

    left.forEach((n,i) => {
      let fill = '#444', tc = '#ccc';
      if (st.phase === 'unmatched' && i === 2) { fill = COLORS.red; tc = '#fff'; }
      if (st.phase === 'paths' && reachZ_X.has(i)) { fill = COLORS.yellow; tc = '#111'; }
      if ((st.phase === 'cover' || st.phase === 'done') && coverX.has(i)) { fill = COLORS.green; tc = '#111'; }
      drawNode(ctx, LX, n.y, R, fill, n.l, tc);
    });
    right.forEach((n,i) => {
      let fill = '#444', tc = '#ccc';
      if (st.phase === 'paths' && reachZ_Y.has(i)) { fill = COLORS.yellow; tc = '#111'; }
      if ((st.phase === 'cover' || st.phase === 'done') && coverY.has(i)) { fill = COLORS.green; tc = '#111'; }
      drawNode(ctx, RX, n.y, R, fill, n.l, tc);
    });

    if (st.phase === 'done') {
      drawArrowLabel(ctx, 'α\'(G) = β(G) = 3 ✓', 300, 268, COLORS.green, 14);
    }

    const lbl = document.getElementById('konig-label');
    if (lbl) lbl.textContent = st.msg;
  }

  function showMatching() { state.step = 1; draw(); }
  function showCover() { state.step = 4; draw(); }
  function showBoth() { state.step = 5; draw(); }
  function next() { if (state.step < steps.length-1) { state.step++; draw(); } }
  function reset() { state.step = 0; draw(); }
  function autoPlay() {
    state.step = 0; draw();
    let i = 0;
    const iv = setInterval(() => {
      if (i >= steps.length-1) { clearInterval(iv); return; }
      state.step = ++i; draw();
    }, 1400);
  }

  setTimeout(draw, 100);
  return { showMatching, showCover, showBoth, next, reset, autoPlay };
})();

// ============================================================
// 1.61 R(3,3) — Animated pivot vertex argument
// ============================================================
const vizRamsey33 = (() => {
  const state = { step: 0 };
  const N6 = 6;

  function pts(n, cx, cy, r) {
    const p = [];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI/2 + 2*Math.PI*i/n;
      p.push({ x: cx + r*Math.cos(a), y: cy + r*Math.sin(a) });
    }
    return p;
  }

  const k5pts = pts(5, 300, 150, 95);
  const k6pts = pts(6, 300, 145, 100);
  const k5cycle = new Set([edgeKey(0,1),edgeKey(1,2),edgeKey(2,3),edgeKey(3,4),edgeKey(4,0)]);

  const pivotSteps = [
    { msg: 'K₅: color C₅ red, rest blue. No monochromatic triangle. R(3,3)>5.', mode:'k5' },
    { msg: 'Now K₆. Pick vertex 1 (yellow). It has 5 edges.', mode:'k6', pivot:0, redNbrs:[], blueNbrs:[], triEdges:[] },
    { msg: 'Pigeonhole: 5 edges → at least 3 same color. Say red to 2,3,4.', mode:'k6', pivot:0, redNbrs:[1,2,3], blueNbrs:[4,5], triEdges:[] },
    { msg: 'Look at triangle {2,3,4}. Is any edge red?', mode:'k6', pivot:0, redNbrs:[1,2,3], blueNbrs:[4,5], triEdges:[[1,2],[2,3],[1,3]], checkTri:true },
    { msg: 'If edge 2-3 is red → red triangle {1,2,3}! If all blue → blue triangle {2,3,4}!', mode:'k6', pivot:0, redNbrs:[1,2,3], blueNbrs:[4,5], triEdges:[[1,2],[2,3],[1,3]], found:true },
    { msg: 'Either way: monochromatic triangle forced. R(3,3)=6. ■', mode:'k6', pivot:0, redNbrs:[1,2,3], blueNbrs:[4,5], triEdges:[[0,1],[0,2],[1,2]], found:true }
  ];

  function draw() {
    const ctx = getCtx('canvas-ramsey33'); if (!ctx) return;
    clearCanvas(ctx, 600, 300);
    const st = pivotSteps[Math.min(state.step, pivotSteps.length-1)];

    if (st.mode === 'k5') {
      for (let i = 0; i < 5; i++) for (let j = i+1; j < 5; j++) {
        const c = k5cycle.has(edgeKey(i,j)) ? COLORS.red : COLORS.blue;
        drawEdge(ctx, k5pts[i].x, k5pts[i].y, k5pts[j].x, k5pts[j].y, c+'88', 2);
      }
      k5pts.forEach((p,i) => drawNode(ctx, p.x, p.y, 16, '#bbb', String(i+1), '#111'));
      drawArrowLabel(ctx, 'No mono triangle in K₅ ✓', 300, 280, COLORS.dim, 13);
    } else {
      const redNbrs = new Set(st.redNbrs || []);
      const blueNbrs = new Set(st.blueNbrs || []);
      const triSet = new Set((st.triEdges||[]).map(([u,v]) => edgeKey(u,v)));

      for (let i = 0; i < N6; i++) for (let j = i+1; j < N6; j++) {
        let c = '#252525', w = 1.5;
        if (st.pivot !== undefined && (i === st.pivot || j === st.pivot)) {
          const other = i === st.pivot ? j : i;
          if (redNbrs.has(other)) { c = COLORS.red; w = 3; }
          else if (blueNbrs.has(other)) { c = COLORS.blue; w = 3; }
        }
        if (triSet.has(edgeKey(i,j))) {
          c = st.found ? '#fff' : COLORS.yellow;
          w = st.found ? 5 : 3;
        }
        drawEdge(ctx, k6pts[i].x, k6pts[i].y, k6pts[j].x, k6pts[j].y, c, w);
      }

      k6pts.forEach((p,i) => {
        let fill = '#555';
        if (i === st.pivot) fill = COLORS.yellow;
        else if (redNbrs.has(i)) fill = COLORS.red;
        else if (blueNbrs.has(i)) fill = COLORS.blue;
        drawNode(ctx, p.x, p.y, 16, fill, String(i+1), '#fff');
      });

      if (st.found) {
        drawArrowLabel(ctx, 'MONOCHROMATIC TRIANGLE FORCED!', 300, 280, COLORS.green, 14);
      }
    }

    const lbl = document.getElementById('ramsey33-label');
    if (lbl) lbl.textContent = st.msg;
  }

  function showK5() { state.step = 0; draw(); }
  function showK6() { state.step = 1; draw(); }
  function toggleTriangle() { state.step = 5; draw(); }
  function next() { if (state.step < pivotSteps.length-1) { state.step++; draw(); } }
  function reset() { state.step = 0; draw(); }
  function autoPlay() {
    state.step = 0; draw();
    let i = 0;
    const iv = setInterval(() => {
      if (i >= pivotSteps.length-1) { clearInterval(iv); return; }
      state.step = ++i; draw();
    }, 1500);
  }

  setTimeout(draw, 100);
  return { showK5, showK6, toggleTriangle, next, reset, autoPlay };
})();

// ============================================================
// 1.62 R(3,4) — Colored complete graphs
// ============================================================
const vizRamsey34 = (() => {
  let mode = 'lower';

  function pts(n, cx, cy, r) {
    const p = [];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI/2 + 2*Math.PI*i/n;
      p.push({ x: cx + r*Math.cos(a), y: cy + r*Math.sin(a) });
    }
    return p;
  }

  function draw() {
    const ctx = getCtx('canvas-ramsey34'); if (!ctx) return;
    clearCanvas(ctx, 600, 220);
    const low = mode === 'lower';

    const cx = 300, cy = 105, r = 80;
    const n = low ? 8 : 9;
    const p = pts(n, cx, cy, r);

    for (let i = 0; i < n; i++) for (let j = i+1; j < n; j++) {
      const isAdj = (j - i === 1) || (i === 0 && j === n-1) ||
                    (j - i === 2) || (i === 0 && j === n-2) || (i === 1 && j === n-1);
      const c = isAdj ? COLORS.red + '66' : COLORS.blue + '44';
      drawEdge(ctx, p[i].x, p[i].y, p[j].x, p[j].y, c, 1.5);
    }

    p.forEach((pt,i) => drawNode(ctx, pt.x, pt.y, 10, low ? '#aaa' : '#ccc', '', '#111'));

    const title = low ? 'K₈: can avoid red K₃ and blue K₄' : 'K₉: impossible to avoid';
    const tc = low ? COLORS.orange : COLORS.green;
    drawArrowLabel(ctx, title, 300, 200, tc, 13);
    drawArrowLabel(ctx, `n = ${n}`, 300, 15, COLORS.accent, 14);
  }

  function showLower() { mode = 'lower'; draw(); }
  function showUpper() { mode = 'upper'; draw(); }
  function reset() { mode = 'lower'; draw(); }

  setTimeout(draw, 100);
  return { showLower, showUpper, reset };
})();

// ============================================================
// 1.64 RECURSIVE RAMSEY — Animated decision tree
// ============================================================
const vizRamseyBounds = (() => {
  let p = 3, q = 4;
  const state = { step: 0 };

  function recBound(a, b, memo = {}) {
    const key = `${a},${b}`;
    if (memo[key] !== undefined) return memo[key];
    if (a === 1 || b === 1) return 1;
    if (a === 2) return b;
    if (b === 2) return a;
    const val = recBound(a-1, b, memo) + recBound(a, b-1, memo);
    memo[key] = val; return val;
  }

  function improvedBound(a, b) {
    const l = recBound(a-1, b), r = recBound(a, b-1);
    return (l%2===0 && r%2===0) ? l+r-1 : l+r;
  }

  const treeSteps = [
    { msg: 'The pivot argument: pick a vertex v in K_N.', phase: 'start' },
    { msg: `v has N-1 neighbors. Split: red-neighbors (R) and blue-neighbors (B).`, phase: 'split' },
    { msg: `If |R| ≥ R(p-1,q): look inside R for red K_{p-1} or blue K_q.`, phase: 'red' },
    { msg: `If |B| ≥ R(p,q-1): look inside B for red K_p or blue K_{q-1}.`, phase: 'blue' },
    { msg: `Every branch finds a monochromatic clique! R(p,q) ≤ R(p-1,q)+R(p,q-1).`, phase: 'done' }
  ];

  function draw() {
    const ctx = getCtx('canvas-ramsey-bounds'); if (!ctx) return;
    clearCanvas(ctx, 600, 280);
    const st = treeSteps[Math.min(state.step, treeSteps.length-1)];

    const vx = 300, vy = 35;
    const rx = 150, ry = 100;
    const bx = 450, by = 100;
    const rr1x = 80, rr1y = 180, rr2x = 220, rr2y = 180;
    const bb1x = 380, bb1y = 180, bb2x = 520, bb2y = 180;

    const rAlpha = (st.phase === 'start') ? 0.15 : 1;

    ctx.globalAlpha = rAlpha;
    drawNode(ctx, vx, vy, 18, COLORS.yellow, 'v', '#111');

    if (st.phase !== 'start') {
      drawEdge(ctx, vx, vy+18, rx, ry-18, COLORS.red, 2);
      drawEdge(ctx, vx, vy+18, bx, by-18, COLORS.blue, 2);
      drawNode(ctx, rx, ry, 18, COLORS.red, 'R', '#fff');
      drawNode(ctx, bx, by, 18, COLORS.blue, 'B', '#fff');

      drawArrowLabel(ctx, `≥R(${p-1},${q})`, rx, ry+30, COLORS.red, 10);
      drawArrowLabel(ctx, `≥R(${p},${q-1})`, bx, by+30, COLORS.blue, 10);
    }

    if (st.phase === 'red' || st.phase === 'done') {
      drawEdge(ctx, rx, ry+18, rr1x, rr1y-16, '#888', 1.5);
      drawEdge(ctx, rx, ry+18, rr2x, rr2y-16, '#888', 1.5);

      ctx.fillStyle = '#1a1a1a'; ctx.strokeStyle = COLORS.red; ctx.lineWidth = 1.5;
      roundRect(ctx, rr1x-50, rr1y-14, 100, 28, 4);
      roundRect(ctx, rr2x-50, rr2y-14, 100, 28, 4);
      drawArrowLabel(ctx, `red K${p-1}+v`, rr1x, rr1y, COLORS.red, 10);
      drawArrowLabel(ctx, `→ red K${p} ✓`, rr1x, rr1y+22, COLORS.green, 9);
      drawArrowLabel(ctx, `blue K${q}`, rr2x, rr2y, COLORS.blue, 10);
      drawArrowLabel(ctx, `→ done ✓`, rr2x, rr2y+22, COLORS.green, 9);
    }
    if (st.phase === 'blue' || st.phase === 'done') {
      drawEdge(ctx, bx, by+18, bb1x, bb1y-16, '#888', 1.5);
      drawEdge(ctx, bx, by+18, bb2x, bb2y-16, '#888', 1.5);

      ctx.fillStyle = '#1a1a1a'; ctx.strokeStyle = COLORS.blue; ctx.lineWidth = 1.5;
      roundRect(ctx, bb1x-50, bb1y-14, 100, 28, 4);
      roundRect(ctx, bb2x-50, bb2y-14, 100, 28, 4);
      drawArrowLabel(ctx, `red K${p}`, bb1x, bb1y, COLORS.red, 10);
      drawArrowLabel(ctx, `→ done ✓`, bb1x, bb1y+22, COLORS.green, 9);
      drawArrowLabel(ctx, `blue K${q-1}+v`, bb2x, bb2y, COLORS.blue, 10);
      drawArrowLabel(ctx, `→ blue K${q} ✓`, bb2x, bb2y+22, COLORS.green, 9);
    }

    ctx.globalAlpha = 1;

    const l = recBound(p-1,q), r2 = recBound(p,q-1);
    const bound = l + r2;
    const imp = improvedBound(p,q);
    const bin = binom(p+q-2,p-1);
    drawArrowLabel(ctx, `R(${p},${q}) ≤ ${bound}${imp<bound ? ` (improved: ${imp})` : ''}   Binomial: ${bin}`,
      300, 250, COLORS.accent, 12);
    drawArrowLabel(ctx, `R(${p-1},${q})=${l}   R(${p},${q-1})=${r2}`, 300, 268, COLORS.dim, 10);

    const lbl = document.getElementById('ramsey-bounds-label');
    if (lbl) lbl.textContent = st.msg;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }

  function changeP(d) { p = Math.max(2, Math.min(7, p+d)); state.step = 4; draw(); }
  function changeQ(d) { q = Math.max(2, Math.min(7, q+d)); state.step = 4; draw(); }
  function next() { if (state.step < treeSteps.length-1) { state.step++; draw(); } }
  function reset() { p = 3; q = 4; state.step = 0; draw(); }
  function autoPlay() {
    state.step = 0; draw();
    let i = 0;
    const iv = setInterval(() => {
      if (i >= treeSteps.length-1) { clearInterval(iv); return; }
      state.step = ++i; draw();
    }, 1400);
  }

  setTimeout(draw, 100);
  return { changeP, changeQ, next, reset, autoPlay };
})();

// ============================================================
// 1.64* PARITY TRICK — Animated degree counting contradiction
// ============================================================
const vizParity = (() => {
  const state = { step: 0 };
  const N = 9;
  const nodes = [];
  for (let i = 0; i < N; i++) {
    const a = -Math.PI/2 + 2*Math.PI*i/N;
    nodes.push({ x: 200 + 95*Math.cos(a), y: 155 + 95*Math.sin(a) });
  }

  const steps = [
    { msg: 'R(2,4)=4, R(3,3)=6. Both even. So R(3,4) ≤ 4+6-1 = 9.', phase:'setup' },
    { msg: 'Suppose a BAD coloring of K₉ exists (no red K₃, no blue K₄)...', phase:'bad' },
    { msg: 'Each vertex: red-deg < R(2,4)=4, blue-deg < R(3,3)=6. Sum = 8 = N-1.', phase:'degrees' },
    { msg: 'Both tight! Every vertex has red-deg = 3 (exactly). That\'s ODD.', phase:'odd' },
    { msg: '9 vertices × odd red-degree = ODD total. But Σdeg = 2|E| is EVEN!', phase:'contradiction' },
    { msg: 'CONTRADICTION! No bad coloring exists. R(3,4) ≤ 9. ■', phase:'done' }
  ];

  function draw() {
    const ctx = getCtx('canvas-parity'); if (!ctx) return;
    clearCanvas(ctx, 600, 300);
    const st = steps[Math.min(state.step, steps.length-1)];

    const showEdges = st.phase !== 'setup';
    if (showEdges) {
      for (let i = 0; i < N; i++) for (let j = i+1; j < N; j++) {
        const isRed = (j-i <= 3) || (i === 0 && j >= N-3);
        drawEdge(ctx, nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y,
          isRed ? COLORS.red + '40' : COLORS.blue + '25', 1);
      }
    }

    nodes.forEach((n, i) => {
      let fill = '#555', tc = '#ccc', r = 14;
      if (st.phase === 'odd' || st.phase === 'contradiction') {
        fill = COLORS.red; tc = '#fff'; r = 16;
      }
      if (st.phase === 'done') { fill = '#444'; tc = '#aaa'; }
      drawNode(ctx, n.x, n.y, r, fill, String(i+1), tc);

      if (st.phase === 'odd' || st.phase === 'contradiction') {
        drawArrowLabel(ctx, '3', n.x + 20, n.y - 16, COLORS.yellow, 10);
      }
    });

    const infoX = 470, infoY = 40;
    if (st.phase !== 'setup') {
      drawArrowLabel(ctx, 'N = 9 (odd)', infoX, infoY, COLORS.accent, 12);
    }
    if (st.phase === 'degrees' || st.phase === 'odd') {
      drawArrowLabel(ctx, 'red-deg ≤ 3', infoX, infoY+20, COLORS.red, 11);
      drawArrowLabel(ctx, 'blue-deg ≤ 5', infoX, infoY+38, COLORS.blue, 11);
      drawArrowLabel(ctx, 'sum = 8 = N-1', infoX, infoY+56, COLORS.dim, 10);
    }
    if (st.phase === 'odd') {
      drawArrowLabel(ctx, '→ red-deg = 3 (odd)', infoX, infoY+78, COLORS.yellow, 11);
    }
    if (st.phase === 'contradiction') {
      drawArrowLabel(ctx, '9 × 3 = 27', infoX, infoY+20, COLORS.yellow, 13);
      drawArrowLabel(ctx, '= ODD!', infoX, infoY+40, COLORS.red, 14);
      drawArrowLabel(ctx, 'But Σdeg = 2|E|', infoX, infoY+65, COLORS.dim, 11);
      drawArrowLabel(ctx, '= EVEN!', infoX, infoY+85, COLORS.green, 14);

      ctx.strokeStyle = COLORS.red; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(infoX-40, infoY+100); ctx.lineTo(infoX+40, infoY+120);
      ctx.moveTo(infoX+40, infoY+100); ctx.lineTo(infoX-40, infoY+120);
      ctx.stroke();
      drawArrowLabel(ctx, 'IMPOSSIBLE', infoX, infoY+110, COLORS.red, 12);
    }
    if (st.phase === 'done') {
      drawArrowLabel(ctx, '✓ R(3,4) ≤ 9', infoX, infoY+20, COLORS.green, 16);
      drawArrowLabel(ctx, 'No bad coloring', infoX, infoY+44, COLORS.green, 12);
      drawArrowLabel(ctx, 'can exist!', infoX, infoY+60, COLORS.green, 12);
    }

    const lbl = document.getElementById('parity-label');
    if (lbl) lbl.textContent = st.msg;
  }

  const ctrl = animateSteps(state, draw, steps.length - 1);
  setTimeout(draw, 100);
  return { next: ctrl.next, reset: ctrl.reset, autoPlay: ctrl.autoPlay };
})();

// ============================================================
// ERDOS-SZEKERES — Pascal's triangle with animated highlight
// ============================================================
const vizErdos = (() => {
  const examples = [
    { r:3, s:3, exact:6 },
    { r:3, s:4, exact:9 },
    { r:3, s:5, exact:14 },
    { r:4, s:4, exact:18 },
    { r:4, s:5, exact:null }
  ];
  let idx = 0;

  function draw() {
    const ctx = getCtx('canvas-erdos'); if (!ctx) return;
    clearCanvas(ctx, 600, 280);
    const ex = examples[idx];
    const hiRow = ex.r + ex.s - 2, hiCol = ex.r - 1;
    const bound = binom(hiRow, hiCol);
    const maxRow = 8;
    const startY = 18, dy = 26, dx = 44;

    const topRow1 = ex.r + ex.s - 3, topCol1 = ex.r - 2, topCol2 = ex.r - 1;

    for (let n = 0; n <= maxRow; n++) {
      for (let k = 0; k <= n; k++) {
        const x = 300 + (k - n/2) * dx;
        const y = startY + n * dy;
        const isHi = (n === hiRow && k === hiCol);
        const isTop = (n === topRow1 && (k === topCol1 || k === topCol2));

        if (isHi) {
          ctx.beginPath(); ctx.arc(x, y, 17, 0, Math.PI*2);
          ctx.fillStyle = COLORS.green + '33'; ctx.fill();
          ctx.strokeStyle = COLORS.green; ctx.lineWidth = 2; ctx.stroke();
        } else if (isTop) {
          ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI*2);
          ctx.fillStyle = COLORS.yellow + '22'; ctx.fill();
          ctx.strokeStyle = COLORS.yellow; ctx.lineWidth = 1.5; ctx.stroke();
        }

        const color = isHi ? '#fff' : isTop ? COLORS.yellow : '#555';
        drawArrowLabel(ctx, String(binom(n, k)), x, y, color, 11);
      }
    }

    if (hiRow <= maxRow && topRow1 <= maxRow) {
      const x1 = 300 + (topCol1 - topRow1/2) * dx;
      const x2 = 300 + (topCol2 - topRow1/2) * dx;
      const y1 = startY + topRow1 * dy;
      const xh = 300 + (hiCol - hiRow/2) * dx;
      const yh = startY + hiRow * dy;
      ctx.setLineDash([3,3]);
      ctx.strokeStyle = COLORS.yellow + '66'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x1, y1+12); ctx.lineTo(xh, yh-12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x2, y1+12); ctx.lineTo(xh, yh-12); ctx.stroke();
      ctx.setLineDash([]);
    }

    let text = `R(${ex.r},${ex.s}) ≤ C(${hiRow},${hiCol}) = ${bound}`;
    if (ex.exact !== null) text += `    (exact: ${ex.exact})`;
    drawArrowLabel(ctx, text, 300, 262, COLORS.accent, 13);

    drawArrowLabel(ctx, `C(${topRow1},${topCol1}) + C(${topRow1},${topCol2}) = C(${hiRow},${hiCol})   ← Pascal`,
      300, 248, COLORS.dim, 10);

    const lbl = document.getElementById('erdos-label');
    if (lbl) lbl.textContent = text;
  }

  function next() { idx = (idx+1) % examples.length; draw(); }
  function prev() { idx = (idx-1+examples.length) % examples.length; draw(); }
  function reset() { idx = 0; draw(); }

  setTimeout(draw, 100);
  return { next, prev, reset };
})();
