// ============================================================
// 1.42 GREEDY COLORING
// ============================================================
const vizGreedy = (() => {
  const nodes = [
    {x:100,y:100,label:'v₁',adj:[1,3]}, {x:250,y:60,label:'v₂',adj:[0,2,3]},
    {x:400,y:100,label:'v₃',adj:[1,3,4]}, {x:250,y:200,label:'v₄',adj:[0,1,2,4]},
    {x:500,y:200,label:'v₅',adj:[2,3]}
  ];
  const edgeList = [[0,1],[1,2],[0,3],[1,3],[2,3],[2,4],[3,4]];
  let nodeColors, currentIdx, autoTimer;

  function init() { nodeColors = Array(nodes.length).fill(-1); currentIdx = 0; autoTimer = null; }
  function draw() {
    const ctx = getCtx('canvas-greedy'); if(!ctx) return;
    clearCanvas(ctx, 600, 320);
    edgeList.forEach(([i,j]) => drawEdge(ctx, nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y, '#ffffff20'));
    nodes.forEach((n,i) => {
      const c = nodeColors[i] >= 0 ? COLORS.palette[nodeColors[i]] : (i === currentIdx ? '#fff' : COLORS.node);
      const r = i === currentIdx ? 28 : 24;
      drawNode(ctx, n.x, n.y, r, c, n.label, '#111');
      if(nodeColors[i] >= 0) drawLabel(ctx, 'c'+(nodeColors[i]+1), n.x, n.y+38, COLORS.palette[nodeColors[i]], 12);
    });
    const delta = Math.max(...nodes.map(n=>n.adj.length));
    drawLabel(ctx, `Δ = ${delta} → need at most ${delta+1} colors`, 300, 300, COLORS.text, 14);
    const lbl = document.getElementById('greedy-label');
    if(currentIdx < nodes.length) {
      const used = new Set(nodes[currentIdx].adj.filter(j=>nodeColors[j]>=0).map(j=>nodeColors[j]));
      lbl.textContent = `Next: ${nodes[currentIdx].label} | Neighbors use colors: {${[...used].map(c=>c+1).join(',')}} | Free: color ${([0,1,2,3,4].find(c=>!used.has(c)))+1}`;
    } else {
      lbl.textContent = `Done! Used ${new Set(nodeColors).size} colors (Δ+1 = ${Math.max(...nodes.map(n=>n.adj.length))+1} allowed)`;
    }
  }
  function step() {
    if(currentIdx >= nodes.length) return;
    const used = new Set(nodes[currentIdx].adj.filter(j=>nodeColors[j]>=0).map(j=>nodeColors[j]));
    nodeColors[currentIdx] = [0,1,2,3,4].find(c => !used.has(c));
    currentIdx++; draw();
  }
  function autoPlay() {
    if(autoTimer) { clearInterval(autoTimer); autoTimer=null; return; }
    autoTimer = setInterval(() => { if(currentIdx>=nodes.length){clearInterval(autoTimer);autoTimer=null;return;} step(); }, 700);
  }
  function reset() { if(autoTimer){clearInterval(autoTimer);autoTimer=null;} init(); draw(); }
  init(); setTimeout(draw, 100);
  return { step, autoPlay, reset };
})();

// ============================================================
// 1.45 INDEPENDENCE BOUNDS
// ============================================================
const vizIndependence = (() => {
  const n = 5;
  let pts = [], nodeColors = [], showSet = false;
  function initPts() {
    pts = []; nodeColors = Array(n).fill(-1); showSet = false;
    for(let i = 0; i < n; i++) {
      const a = -Math.PI/2 + (2*Math.PI*i)/n;
      pts.push({x: 300+110*Math.cos(a), y:150+110*Math.sin(a), label: String.fromCharCode(97+i)});
    }
  }
  function draw() {
    const ctx = getCtx('canvas-independence'); if(!ctx) return;
    clearCanvas(ctx, 600, 300);
    for(let i=0;i<n;i++) { const j=(i+1)%n; drawEdge(ctx, pts[i].x, pts[i].y, pts[j].x, pts[j].y, '#ffffff20'); }
    pts.forEach((p,i) => {
      let c = COLORS.node;
      if(showSet && (i===0||i===2)) c = COLORS.green;
      if(nodeColors[i]>=0) c = COLORS.palette[nodeColors[i]];
      drawNode(ctx, p.x, p.y, 24, c, p.label, '#111');
    });
    if(showSet) drawLabel(ctx, 'Independent set S = {a, c} → α = 2', 300, 285, COLORS.green, 14);
  }
  function highlightSet() { showSet = true; nodeColors = Array(n).fill(-1); draw(); }
  function colorUpper() {
    showSet = false;
    nodeColors = [0, 1, 0, 2, 3]; // a,c share color 0, rest get unique
    draw();
    document.getElementById('independence-label').textContent = 'Upper bound: color {a,c} with color 1, rest unique → 4 colors (n+1-α = 5+1-2 = 4)';
  }
  function reset() { initPts(); draw(); document.getElementById('independence-label').textContent = 'C₅: n=5, α=2 → bounds: ⌈5/2⌉=3 ≤ χ ≤ 5+1-2=4. Actual: χ=3'; }
  initPts(); setTimeout(draw, 100);
  return { highlightSet, colorUpper, reset };
})();

// ============================================================
// 1.47 KEMPE CHAIN
// ============================================================
const vizKempe = (() => {
  let step = 0;
  const cx = 300, cy = 180, R = 120;
  const neighbors = [];
  for(let i=0;i<5;i++) {
    const a=-Math.PI/2+(2*Math.PI*i)/5;
    neighbors.push({x:cx+R*Math.cos(a), y:cy+R*Math.sin(a)});
  }
  const labels = ['v₁','v₂','v₃','v₄','v₅'];
  const steps = [
    { title: 'Setup: v has 5 neighbors with all 5 colors', nColors: [0,1,2,3,4], vColor: -1 },
    { title: 'Try 1-3 Kempe chain: are v₁(red) and v₃(green) connected?', nColors: [0,1,2,3,4], vColor: -1, highlight: [0,2] },
    { title: 'Case A: Different components → swap 1↔3 in v₁\'s part', nColors: [2,1,2,3,4], vColor: -1, swap: true },
    { title: '→ Color 1 (red) is now FREE for v!', nColors: [2,1,2,3,4], vColor: 0 },
    { title: 'Case B: Same component → 1-3 path blocks. Try 2-4 swap.', nColors: [0,1,2,3,4], vColor: -1, highlight: [1,3] },
    { title: 'v₂ and v₄ must be in different 2-4 components → swap!', nColors: [0,3,2,3,4], vColor: -1, swap: true },
    { title: '→ Color 2 (blue) is now FREE for v!', nColors: [0,3,2,3,4], vColor: 1 },
  ];

  function draw() {
    const ctx = getCtx('canvas-kempe'); if(!ctx) return;
    clearCanvas(ctx, 600, 350);
    const s = steps[step];
    // edges from v to neighbors
    neighbors.forEach(n => drawEdge(ctx, cx, cy, n.x, n.y, '#ffffff20'));
    // neighbor nodes
    neighbors.forEach((n,i) => {
      const c = s.nColors[i] >= 0 ? COLORS.palette[s.nColors[i]] : COLORS.node;
      const r = (s.highlight && s.highlight.includes(i)) ? 28 : 22;
      drawNode(ctx, n.x, n.y, r, c, labels[i], '#111');
    });
    // center v
    const vc = s.vColor >= 0 ? COLORS.palette[s.vColor] : '#555';
    drawNode(ctx, cx, cy, 28, vc, 'v', s.vColor>=0?'#111':'#fff');
    drawLabel(ctx, s.title, 300, 335, COLORS.text, 13);
    document.getElementById('kempe-label').textContent = `Step ${step+1}/${steps.length}: ${s.title}`;
  }
  function stepFn() { step = (step + 1) % steps.length; draw(); }
  function reset() { step = 0; draw(); }
  setTimeout(draw, 100);
  return { step: stepFn, reset };
})();

// ============================================================
// 1.48 DELETION-CONTRACTION
// ============================================================
const vizDelCon = (() => {
  let mode = 'original'; // 'original', 'delete', 'contract'
  function draw() {
    const ctx = getCtx('canvas-delcon'); if(!ctx) return;
    clearCanvas(ctx, 600, 300);
    const lbl = document.getElementById('delcon-label');
    if(mode === 'original') {
      drawEdge(ctx, 200, 80, 400, 80, COLORS.red, 3);
      drawEdge(ctx, 200, 80, 300, 230, '#555');
      drawEdge(ctx, 400, 80, 300, 230, '#555');
      drawNode(ctx, 200, 80, 24, COLORS.node, 'a');
      drawNode(ctx, 400, 80, 24, COLORS.node, 'b');
      drawNode(ctx, 300, 230, 24, COLORS.node, 'c');
      drawLabel(ctx, 'G (triangle) — red edge e = {a,b}', 300, 280, COLORS.text, 14);
      drawLabel(ctx, 'C_G(k) = ?', 300, 150, COLORS.accent, 16);
      lbl.textContent = 'Triangle K₃ with edge e = {a,b} highlighted in red';
    } else if(mode === 'delete') {
      drawEdge(ctx, 200, 80, 300, 230, COLORS.green, 2);
      drawEdge(ctx, 400, 80, 300, 230, COLORS.green, 2);
      drawNode(ctx, 200, 80, 24, COLORS.node, 'a');
      drawNode(ctx, 400, 80, 24, COLORS.node, 'b');
      drawNode(ctx, 300, 230, 24, COLORS.node, 'c');
      drawLabel(ctx, 'G - e (delete edge a-b)', 300, 280, COLORS.green, 14);
      drawLabel(ctx, 'C(G-e) = k(k-1)²', 300, 150, COLORS.green, 16);
      lbl.textContent = 'G - e: deleted edge a-b. Path a-c-b. Chromatic polynomial = k(k-1)²';
    } else {
      drawEdge(ctx, 250, 140, 400, 140, COLORS.purple, 2);
      drawNode(ctx, 250, 140, 28, COLORS.yellow, 'ab', '#111');
      drawNode(ctx, 400, 140, 24, COLORS.node, 'c');
      drawLabel(ctx, 'G/e (contract a,b into one vertex)', 300, 280, COLORS.purple, 14);
      drawLabel(ctx, 'C(G/e) = k(k-1)', 300, 80, COLORS.purple, 16);
      lbl.textContent = 'G/e: merged a,b into "ab". Single edge ab-c. C(G/e) = k(k-1)';
    }
  }
  function showDelete() { mode = 'delete'; draw(); }
  function showContract() { mode = 'contract'; draw(); }
  function reset() { mode = 'original'; draw(); }
  setTimeout(draw, 100);
  return { showDelete, showContract, reset };
})();

// ============================================================
// CLAIM — CYCLE CHROMATIC POLYNOMIAL
// ============================================================
const vizCycle = (() => {
  let N = 4, K = 3;
  function formula(n, k) { return Math.pow(k-1, n) + Math.pow(-1, n) * (k-1); }
  function draw() {
    const ctx = getCtx('canvas-cycle'); if(!ctx) return;
    clearCanvas(ctx, 600, 300);
    const pts = [];
    for(let i=0;i<N;i++) {
      const a = -Math.PI/2 + (2*Math.PI*i)/N;
      pts.push({x:300+100*Math.cos(a), y:150+100*Math.sin(a)});
    }
    for(let i=0;i<N;i++) { const j=(i+1)%N; drawEdge(ctx, pts[i].x, pts[i].y, pts[j].x, pts[j].y, '#444'); }
    pts.forEach((p,i) => drawNode(ctx, p.x, p.y, 22, COLORS.palette[i%K], 'v'+(i+1), '#111'));
    // color palette
    for(let c=0;c<K;c++) {
      ctx.fillStyle = COLORS.palette[c]; ctx.fillRect(500, 40+c*28, 20, 20);
      ctx.fillStyle = COLORS.text; ctx.font = '12px Inter'; ctx.textAlign = 'left'; ctx.fillText('Color '+(c+1), 526, 55+c*28);
    }
    const val = formula(N, K);
    drawLabel(ctx, `C(C${N})(${K}) = (${K}-1)^${N} + (-1)^${N}·(${K}-1) = ${val} colorings`, 300, 285, COLORS.accent, 14);
    document.getElementById('cycle-label').textContent = `C${N<10?'₀₁₂₃₄₅₆₇₈₉'[N]:'_'+N} with k=${K} colors: (${K-1})^${N} + (-1)^${N}·(${K-1}) = ${val} proper colorings`;
  }
  function changeN(d) { N = Math.max(3, Math.min(8, N+d)); draw(); }
  function changeK(d) { K = Math.max(2, Math.min(6, K+d)); draw(); }
  setTimeout(draw, 100);
  return { changeN, changeK };
})();
