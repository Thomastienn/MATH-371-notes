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
// 1.1 HANDSHAKING LEMMA
// ============================================================
const vizHandshaking = (() => {
  const nodes = [
    {x:150,y:80,label:'a',deg:0}, {x:300,y:250,label:'b',deg:0},
    {x:450,y:80,label:'c',deg:0}, {x:300,y:120,label:'d',deg:0},
    {x:150,y:220,label:'e',deg:0}
  ];
  const possibleEdges = [[0,1],[1,2],[0,2],[0,3],[3,2],[3,1],[1,4],[0,4],[3,4]];
  let edges = [], edgeIdx = 0;

  function draw() {
    const ctx = getCtx('canvas-handshaking'); if(!ctx) return;
    clearCanvas(ctx, 600, 300);
    edges.forEach(([i,j]) => drawEdge(ctx, nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y, '#58a6ff88'));
    nodes.forEach(n => drawNode(ctx, n.x, n.y, 24, COLORS.node, n.label + '\n' + n.deg));
    nodes.forEach(n => { drawNode(ctx, n.x, n.y, 24, COLORS.node, n.label); drawLabel(ctx, 'deg=' + n.deg, n.x, n.y + 38, COLORS.accent, 12); });
    const sumDeg = nodes.reduce((s,n) => s+n.deg, 0);
    drawLabel(ctx, `Σ deg = ${sumDeg}  |  2·|E| = ${2*edges.length}  |  ${sumDeg === 2*edges.length ? '✓ Equal!' : ''}`, 300, 290, COLORS.green, 14);
  }
  function addEdge() {
    if (edgeIdx >= possibleEdges.length) return;
    const [i,j] = possibleEdges[edgeIdx];
    edges.push([i,j]); nodes[i].deg++; nodes[j].deg++; edgeIdx++;
    draw();
  }
  function reset() { edges=[]; edgeIdx=0; nodes.forEach(n=>n.deg=0); draw(); }
  setTimeout(draw, 100);
  return { addEdge, reset };
})();

// ============================================================
// 1.2 WALK CONTAINS PATH
// ============================================================
const vizWalk = (() => {
  const positions = {a:{x:50,y:125},b:{x:150,y:125},c:{x:250,y:60},d:{x:350,y:125},e:{x:450,y:60},f:{x:550,y:125}};
  const allEdges = [['a','b'],['b','c'],['b','d'],['d','e'],['d','f'],['c','b'],['e','d']];
  let walk = ['a','b','c','b','d','e','d','f'];
  let step = 0;

  function draw() {
    const ctx = getCtx('canvas-walk'); if(!ctx) return;
    clearCanvas(ctx, 600, 250);
    allEdges.forEach(([a,b]) => drawEdge(ctx, positions[a].x, positions[a].y, positions[b].x, positions[b].y, '#ffffff15'));
    for (let i = 0; i < walk.length-1; i++) {
      const a = positions[walk[i]], b = positions[walk[i+1]];
      const isLoop = walk.indexOf(walk[i+1]) < i+1 || (walk.lastIndexOf(walk[i]) > i);
      drawEdge(ctx, a.x, a.y, b.x, b.y, isLoop ? COLORS.red + '60' : COLORS.green, 3);
    }
    for (const [name, p] of Object.entries(positions)) {
      const onWalk = walk.includes(name);
      drawNode(ctx, p.x, p.y, 22, onWalk ? COLORS.node : '#333', name, onWalk ? '#111' : '#666');
    }
    drawLabel(ctx, 'Walk: ' + walk.join(' → '), 300, 230, COLORS.text, 14);
  }
  function findLoop() {
    for (let i = 0; i < walk.length; i++)
      for (let j = i+2; j < walk.length; j++)
        if (walk[i] === walk[j]) return [i, j];
    return null;
  }
  function stepFn() {
    const loop = findLoop();
    if (!loop) { document.getElementById('walk-label').textContent = '✓ No more loops — this is a path!'; return; }
    walk = [...walk.slice(0, loop[0]+1), ...walk.slice(loop[1]+1)];
    document.getElementById('walk-label').textContent = 'Walk: ' + walk.join(' → ') + (findLoop() ? ' (still has loops)' : ' ✓ Path!');
    draw();
  }
  function reset() { walk = ['a','b','c','b','d','e','d','f']; document.getElementById('walk-label').textContent='Walk: a → b → c → b → d → e → d → f (vertices b, d repeat!)'; draw(); }
  setTimeout(draw, 100);
  return { step: stepFn, reset };
})();

// ============================================================
// 1.3 BIPARTITE
// ============================================================
const vizBipartite = (() => {
  let isOdd = false, colorStep = -1, colors = [];
  function getNodes() {
    const n = isOdd ? 5 : 4;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI/2 + (2*Math.PI*i)/n;
      pts.push({ x: 300 + 100*Math.cos(a), y: 150 + 100*Math.sin(a), label: String.fromCharCode(97+i) });
    }
    return pts;
  }
  function draw() {
    const ctx = getCtx('canvas-bipartite'); if(!ctx) return;
    clearCanvas(ctx, 600, 300);
    const pts = getNodes();
    for (let i = 0; i < pts.length; i++) {
      const j = (i+1)%pts.length;
      drawEdge(ctx, pts[i].x, pts[i].y, pts[j].x, pts[j].y, '#58a6ff55', 2);
    }
    pts.forEach((p, i) => {
      const c = i < colors.length ? (colors[i] === 0 ? COLORS.red : COLORS.blue) : COLORS.node;
      const clash = i < colors.length && i === pts.length-1 && isOdd && colors[i] !== undefined;
      drawNode(ctx, p.x, p.y, 26, c, p.label, '#111');
      if (clash && colors[i] === -1) {
        drawNode(ctx, p.x, p.y, 26, COLORS.yellow, '??', '#111');
      }
    });
    const title = isOdd ? `C₅ — Odd cycle (NOT bipartite)` : `C₄ — Even cycle (bipartite ✓)`;
    drawLabel(ctx, title, 300, 285, isOdd ? COLORS.red : COLORS.green, 15);
  }
  function toggleCycle() { isOdd = !isOdd; colorStep = -1; colors = []; document.getElementById('bipartite-label').textContent = isOdd ? 'Odd cycle C₅ — click "Animate" to see 2-coloring fail' : 'Even cycle C₄ — click "Animate" to see 2-coloring succeed'; draw(); }
  function animate() {
    colorStep = -1; colors = [];
    const n = isOdd ? 5 : 4;
    let i = 0;
    const timer = setInterval(() => {
      if (i >= n) { clearInterval(timer); return; }
      if (i === n - 1 && isOdd) { colors.push(-1); }
      else { colors.push(i % 2); }
      draw(); i++;
    }, 500);
  }
  function reset() { colorStep=-1; colors=[]; draw(); }
  setTimeout(draw, 100);
  return { toggleCycle, animate, reset };
})();

// ============================================================
// 1.10 TREE EDGE COUNT
// ============================================================
const vizTree = (() => {
  const initNodes = [
    {x:300,y:40,id:0}, {x:180,y:110,id:1}, {x:420,y:110,id:2},
    {x:100,y:190,id:3}, {x:250,y:190,id:4}, {x:350,y:190,id:5},
    {x:500,y:190,id:6}
  ];
  const initEdges = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]];
  let nodes, edges, splitEdge = null, group = null;

  function init() { nodes = initNodes.map(n=>({...n})); edges = initEdges.map(e=>[...e]); splitEdge=null; group=null; }
  function draw() {
    const ctx = getCtx('canvas-tree'); if(!ctx) return;
    clearCanvas(ctx, 600, 280);
    edges.forEach(([i,j], idx) => {
      const c = splitEdge === idx ? COLORS.red : (group ? (group[i]===group[j] ? (group[i]===0?COLORS.blue:COLORS.green) : '#555') : COLORS.edge + '88');
      drawEdge(ctx, nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y, c, splitEdge===idx?3:2);
    });
    nodes.forEach(n => {
      const c = group ? (group[n.id]===0 ? '#bbdefb' : '#c8e6c9') : COLORS.node;
      drawNode(ctx, n.x, n.y, 20, c, String(n.id));
    });
    const lbl = document.getElementById('tree-label');
    if(group) {
      const g0 = Object.values(group).filter(v=>v===0).length;
      const g1 = Object.values(group).filter(v=>v===1).length;
      const e0 = edges.filter(([i,j])=>group[i]===0&&group[j]===0).length;
      const e1 = edges.filter(([i,j])=>group[i]===1&&group[j]===1).length;
      lbl.textContent = `T₁: ${g0} vertices, ${e0} edges | T₂: ${g1} vertices, ${e1} edges | Total: ${e0}+${e1}+1(removed) = ${e0+e1+1} = ${nodes.length}-1 ✓`;
    } else {
      lbl.textContent = `Tree with ${nodes.length} vertices, ${edges.length} edges (= ${nodes.length}-1 ✓)`;
    }
  }
  function bfs(start, adj) {
    const visited = new Set();
    const queue = [start]; visited.add(start);
    while(queue.length) { const u = queue.shift(); (adj[u]||[]).forEach(v => { if(!visited.has(v)){visited.add(v);queue.push(v);} }); }
    return visited;
  }
  function split() {
    if(splitEdge !== null) return;
    const idx = Math.floor(Math.random() * edges.length);
    splitEdge = idx;
    const adj = {};
    edges.forEach(([i,j], ei) => { if(ei===idx) return; (adj[i]=adj[i]||[]).push(j); (adj[j]=adj[j]||[]).push(i); });
    const comp = bfs(edges[idx][0], adj);
    group = {};
    nodes.forEach(n => group[n.id] = comp.has(n.id) ? 0 : 1);
    draw();
  }
  function reset() { init(); draw(); }
  init(); setTimeout(draw, 100);
  return { split, reset };
})();

// ============================================================
// 1.15 CENTER OF A TREE (LEAF PEELING)
// ============================================================
const vizCenter = (() => {
  const initNodes = [
    {x:60,y:140,id:0}, {x:160,y:140,id:1}, {x:260,y:100,id:2},
    {x:360,y:140,id:3}, {x:460,y:100,id:4}, {x:540,y:140,id:5},
    {x:260,y:200,id:6}, {x:160,y:60,id:7}
  ];
  const initEdges = [[0,1],[1,2],[2,3],[3,4],[4,5],[1,7],[2,6]];
  let activeNodes, activeEdges;

  function init() { activeNodes = new Set(initNodes.map(n=>n.id)); activeEdges = initEdges.map(e=>[...e]); }
  function getAdj() {
    const adj = {};
    activeEdges.forEach(([i,j]) => { if(activeNodes.has(i)&&activeNodes.has(j)) { (adj[i]=adj[i]||[]).push(j); (adj[j]=adj[j]||[]).push(i); } });
    return adj;
  }
  function draw() {
    const ctx = getCtx('canvas-center'); if(!ctx) return;
    clearCanvas(ctx, 600, 280);
    activeEdges.forEach(([i,j]) => {
      if(!activeNodes.has(i)||!activeNodes.has(j)) return;
      drawEdge(ctx, initNodes[i].x, initNodes[i].y, initNodes[j].x, initNodes[j].y, COLORS.edge+'66');
    });
    initNodes.forEach(n => {
      if(!activeNodes.has(n.id)) { drawNode(ctx, n.x, n.y, 16, '#333', '', '#555'); return; }
      const adj = getAdj();
      const isLeaf = (adj[n.id]||[]).length <= 1 && activeNodes.size > 2;
      drawNode(ctx, n.x, n.y, 20, isLeaf ? COLORS.yellow : (activeNodes.size <= 2 ? COLORS.green : COLORS.node), String(n.id));
    });
    const lbl = document.getElementById('center-label');
    if (activeNodes.size <= 2) lbl.textContent = `Center found! {${[...activeNodes].join(', ')}} — ${activeNodes.size===1?'single vertex':'two adjacent vertices'}`;
    else lbl.textContent = `${activeNodes.size} vertices remaining. Yellow = leaves (will be peeled)`;
  }
  function peel() {
    if(activeNodes.size <= 2) return;
    const adj = getAdj();
    const leaves = [...activeNodes].filter(id => (adj[id]||[]).length <= 1);
    leaves.forEach(id => activeNodes.delete(id));
    draw();
  }
  function reset() { init(); draw(); }
  init(); setTimeout(draw, 100);
  return { peel, reset };
})();

// ============================================================
// 1.31 EULER'S FORMULA
// ============================================================
const vizEuler = (() => {
  const pts = [{x:150,y:60},{x:450,y:60},{x:450,y:240},{x:150,y:240}];
  const initEdges = [[0,1],[1,2],[2,3],[3,0],[0,2],[1,3]];
  let edges;

  function init() { edges = initEdges.map(e=>[...e]); }
  function countFaces() {
    const E = edges.length, V = 4;
    return 2 - V + E;
  }
  function isCycleEdge(idx) {
    const [u,v] = edges[idx];
    const adj = {};
    edges.forEach(([i,j],ei) => { if(ei===idx) return; (adj[i]=adj[i]||[]).push(j); (adj[j]=adj[j]||[]).push(i); });
    const visited = new Set(); const queue = [u]; visited.add(u);
    while(queue.length) { const c = queue.shift(); if(c===v) return true; (adj[c]||[]).forEach(x => { if(!visited.has(x)){visited.add(x);queue.push(x);} }); }
    return false;
  }
  function draw() {
    const ctx = getCtx('canvas-euler'); if(!ctx) return;
    clearCanvas(ctx, 600, 300);
    edges.forEach(([i,j]) => drawEdge(ctx, pts[i].x, pts[i].y, pts[j].x, pts[j].y, COLORS.edge+'88'));
    pts.forEach((p,i) => drawNode(ctx, p.x, p.y, 22, COLORS.node, String.fromCharCode(97+i)));
    const V=4, E=edges.length, F=countFaces();
    document.getElementById('euler-label').textContent = `V=${V}, E=${E}, F=${F} → V-E+F = ${V}-${E}+${F} = ${V-E+F} ${V-E+F===2?'✓':''}`;
  }
  function removeEdge() {
    if(edges.length <= 3) return;
    for(let i = edges.length-1; i >= 0; i--) {
      if(isCycleEdge(i)) { edges.splice(i, 1); draw(); return; }
    }
  }
  function reset() { init(); draw(); }
  init(); setTimeout(draw, 100);
  return { removeEdge, reset };
})();

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
      drawEdge(ctx, 200, 80, 300, 230, '#58a6ff88');
      drawEdge(ctx, 400, 80, 300, 230, '#58a6ff88');
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
    for(let i=0;i<N;i++) { const j=(i+1)%N; drawEdge(ctx, pts[i].x, pts[i].y, pts[j].x, pts[j].y, '#58a6ff55'); }
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
// GLOSSARY DATA & RENDER
// ============================================================
const glossaryData = [
  { term: "Bipartite Graph", def: "A graph whose vertices can be divided into two disjoint sets such that every edge connects a vertex in one set to a vertex in the other. Equivalent to having no odd cycles." },
  { term: "Chromatic Number χ(G)", def: "The minimum number of colors needed to properly color the vertices of a graph such that no two adjacent vertices share the same color." },
  { term: "Chromatic Polynomial C_G(k)", def: "A polynomial that evaluates to the number of proper k-colorings of a graph G." },
  { term: "Claw (K₁,₃)", def: "A star graph with 1 center vertex and 3 leaf vertices, with no edges between the leaves. A common 'forbidden subgraph'." },
  { term: "Degree deg(v)", def: "The number of edges incident to a vertex v." },
  { term: "Deletion-Contraction", def: "A recursive method to compute chromatic polynomials: C_G(k) = C_{G-e}(k) - C_{G/e}(k)." },
  { term: "Euler's Formula", def: "For any connected planar graph: V - E + F = 2, where V is vertices, E is edges, and F is faces (regions)." },
  { term: "Eulerian Circuit", def: "A closed walk that traverses every edge of a graph exactly once. Exists if and only if every vertex has an even degree." },
  { term: "Greedy Coloring", def: "An algorithm that colors vertices one by one using the lowest available color. Uses at most Δ(G) + 1 colors." },
  { term: "Independence Number α(G)", def: "The size of the largest independent set (a set of vertices where no two are adjacent) in graph G." },
  { term: "Induced Subgraph", def: "A subset of vertices and ALL edges that connect them in the original graph." },
  { term: "Kempe Chain", def: "A maximal connected subgraph containing vertices of only two specific colors. Swapping the colors in a Kempe chain preserves a valid coloring." },
  { term: "Path", def: "A walk with no repeated vertices." },
  { term: "Planar Graph", def: "A graph that can be drawn on a flat plane without any edges crossing." },
  { term: "Tree", def: "A connected graph with no cycles. Always has exactly n-1 edges and at least 2 leaves." },
  { term: "Walk", def: "A sequence of alternating vertices and edges. May repeat vertices." }
];

const glossaryGrid = document.getElementById('glossary-grid');
glossaryData.forEach(item => {
  const el = document.createElement('div');
  el.className = 'glossary-item';
  el.innerHTML = `<div class="glossary-term">${item.term}</div><div class="glossary-def">${item.def}</div>`;
  glossaryGrid.appendChild(el);
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
