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
    edges.forEach(([i,j]) => drawEdge(ctx, nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y, '#555'));
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
      drawEdge(ctx, pts[i].x, pts[i].y, pts[j].x, pts[j].y, '#444', 2);
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
// 1.7 ADJACENCY MATRIX
// ============================================================
const vizMatrix = (() => {
  const pts = {0:{x:100,y:100}, 1:{x:250,y:100}, 2:{x:250,y:220}, 3:{x:100,y:220}};
  const labels = ['a','b','c','d'];
  // a-b, b-c, c-d, c-a
  const A1 = [
    [0,1,1,0],
    [1,0,1,0],
    [1,1,0,1],
    [0,0,1,0]
  ];
  let currentA = null;
  let power = 1;

  function multiply(M1, M2) {
    const res = [
      [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]
    ];
    for (let i=0; i<4; i++) {
      for (let j=0; j<4; j++) {
        for (let k=0; k<4; k++) {
          res[i][j] += M1[i][k] * M2[k][j];
        }
      }
    }
    return res;
  }

  function drawMatrix(ctx, mat, x, y) {
    ctx.fillStyle = COLORS.text; ctx.font = '16px Inter'; ctx.textAlign = 'center';
    
    // col headers
    for(let j=0;j<4;j++) ctx.fillText(labels[j], x + 40 + j*40, y);
    // row headers
    for(let i=0;i<4;i++) ctx.fillText(labels[i], x, y + 30 + i*30);
    
    // elements
    ctx.fillStyle = COLORS.accent;
    for(let i=0;i<4;i++) {
      for(let j=0;j<4;j++) {
        const val = mat[i][j];
        if(val === 0) ctx.fillStyle = '#444';
        else ctx.fillStyle = COLORS.accent;
        ctx.fillText(mat[i][j], x + 40 + j*40, y + 30 + i*30);
      }
    }
    
    // brackets
    ctx.strokeStyle = COLORS.text; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x+20, y+10); ctx.lineTo(x+10, y+10); ctx.lineTo(x+10, y+130); ctx.lineTo(x+20, y+130);
    ctx.moveTo(x+180, y+10); ctx.lineTo(x+190, y+10); ctx.lineTo(x+190, y+130); ctx.lineTo(x+180, y+130);
    ctx.stroke();
  }

  function draw() {
    const ctx = getCtx('canvas-matrix'); if(!ctx) return;
    clearCanvas(ctx, 600, 320);
    
    // Draw graph on left
    for(let i=0;i<4;i++) {
      for(let j=i+1;j<4;j++) {
        if(A1[i][j]) drawEdge(ctx, pts[i].x, pts[i].y, pts[j].x, pts[j].y, '#ffffff20');
      }
    }
    for(let i=0;i<4;i++) {
      drawNode(ctx, pts[i].x, pts[i].y, 22, COLORS.node, labels[i], '#111');
    }
    
    drawLabel(ctx, 'Graph G', 175, 280, COLORS.dim, 14);
    
    // Draw matrix on right
    drawLabel(ctx, `A^${power}`, 430, 60, COLORS.accent3, 18);
    drawMatrix(ctx, currentA, 350, 100);
    
    // Explain text
    const lbl = document.getElementById('matrix-label');
    if(power === 1) lbl.textContent = `Showing A¹ (1-step walks — just the edges!)`;
    else if(power === 2) lbl.textContent = `Showing A² (e.g. entry (a,a)=2 means 2 paths a→_→a, entry (a,d)=1 means path a→c→d)`;
    else lbl.textContent = `Showing A^${power} (${power}-step walks between any two nodes)`;
  }
  
  function init() { currentA = A1; power = 1; }
  function stepPower() {
    if(power >= 5) return;
    currentA = multiply(currentA, A1);
    power++;
    draw();
  }
  function reset() { init(); draw(); }
  init(); setTimeout(draw, 100);
  
  return { stepPower, reset };
})();
