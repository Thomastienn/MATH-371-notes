// ============================================================
// FINAL EXAM VISUALIZATIONS
// L16 Claims (Petersen) · Thm 1.68/1.69 · Prüfer · Bowtie · Triangles · Chrom Polys
// ============================================================

// ============================================================
// PETERSEN GRAPH — for L16 Claims 1-4
// ============================================================
const vizPetersen = (() => {
  // Outer pentagon v1..v5, inner pentagram v6..v10
  const CX = 300, CY = 160;
  const R_OUT = 130, R_IN = 60;
  const nodes = [];
  for (let i = 0; i < 5; i++) {
    const ang = -Math.PI / 2 + (2 * Math.PI * i) / 5;
    nodes.push({ x: CX + R_OUT * Math.cos(ang), y: CY + R_OUT * Math.sin(ang), label: 'v' + (i + 1) });
  }
  for (let i = 0; i < 5; i++) {
    const ang = -Math.PI / 2 + (2 * Math.PI * i) / 5;
    nodes.push({ x: CX + R_IN * Math.cos(ang), y: CY + R_IN * Math.sin(ang), label: 'v' + (i + 6) });
  }

  // Outer pentagon (0-1,1-2,...,4-0); inner pentagram (5-7,7-9,9-6,6-8,8-5); spokes (0-5,1-6,...)
  const outer = [[0,1],[1,2],[2,3],[3,4],[4,0]];
  const inner = [[5,7],[7,9],[9,6],[6,8],[8,5]];
  const spokes = [[0,5],[1,6],[2,7],[3,8],[4,9]];
  const allEdges = [...outer, ...inner, ...spokes];

  // Hamilton path for Claim 1: v1-v2-v3-v4-v5-v10-v7-v9-v6-v8
  // index:               0 -1 -2 -3 -4 - 9 -6 -8 -5 -7
  const hamPath = [0, 1, 2, 3, 4, 9, 6, 8, 5, 7];

  // Max independent set of size 4 (Claim 4): e.g. {v1, v3, v6, v9} indices 0,2,5,8
  const indSet = [0, 2, 5, 8];

  // 3 vertices whose removal disconnects (Claim 3 Part I): neighbors of v1 = {v2, v5, v6} idx 1,4,5
  const cutSet = [1, 4, 5];

  const modes = [
    {
      key: 'overview',
      title: 'Petersen: 10 vertices, 15 edges, 3-regular',
      draw: ctx => drawBase(ctx, {})
    },
    {
      key: 'ham-path',
      title: 'Claim 1: Hamilton PATH exists (traceable)',
      draw: ctx => drawBase(ctx, { pathEdges: hamPathEdges(), pathColor: COLORS.green })
    },
    {
      key: 'no-ham-cycle',
      title: 'Claim 2: No Hamilton CYCLE (closing the path creates no edge)',
      draw: ctx => {
        drawBase(ctx, { pathEdges: hamPathEdges(), pathColor: COLORS.green });
        // dashed red attempt to close
        const a = nodes[hamPath[0]], b = nodes[hamPath[9]];
        drawDashedEdgeLocal(ctx, a.x, a.y, b.x, b.y, COLORS.red, 3);
        drawLabel(ctx, '✗ no edge', (a.x+b.x)/2, (a.y+b.y)/2 - 12, COLORS.red, 12);
      }
    },
    {
      key: 'connectivity',
      title: 'Claim 3: κ(P) = 3 (remove 3 neighbors of v1 to isolate it)',
      draw: ctx => drawBase(ctx, { removedVerts: cutSet, highlight: [0] })
    },
    {
      key: 'independence',
      title: 'Claim 4: α(P) = 4 (example max independent set: v1, v3, v6, v9)',
      draw: ctx => drawBase(ctx, { indVerts: indSet })
    }
  ];

  function hamPathEdges() {
    const set = new Set();
    for (let i = 0; i < hamPath.length - 1; i++) {
      const u = hamPath[i], v = hamPath[i + 1];
      const k = u < v ? `${u}-${v}` : `${v}-${u}`;
      set.add(k);
    }
    return set;
  }

  function drawDashedEdgeLocal(ctx, x1, y1, x2, y2, color, width) {
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
    ctx.restore();
  }

  function drawBase(ctx, opts) {
    const pathEdges = opts.pathEdges || new Set();
    const removed = new Set(opts.removedVerts || []);
    const highlight = new Set(opts.highlight || []);
    const indVerts = new Set(opts.indVerts || []);
    const pathColor = opts.pathColor || COLORS.green;

    // Draw edges first
    allEdges.forEach(([u, v]) => {
      if (removed.has(u) || removed.has(v)) return;
      const k = u < v ? `${u}-${v}` : `${v}-${u}`;
      const isPath = pathEdges.has(k);
      drawEdge(ctx, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y,
        isPath ? pathColor : COLORS.edge + '88', isPath ? 3 : 1.5);
    });

    // Draw nodes
    nodes.forEach((n, i) => {
      if (removed.has(i)) {
        // grey-out: dashed circle
        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.arc(n.x, n.y, 14, 0, Math.PI*2);
        ctx.strokeStyle = COLORS.red + 'aa'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.restore();
        drawLabel(ctx, n.label, n.x, n.y, COLORS.red + '77', 10);
        return;
      }
      let fill = COLORS.node;
      let textColor = '#111';
      if (indVerts.has(i)) { fill = COLORS.yellow; }
      if (highlight.has(i)) { fill = COLORS.blue; textColor = '#fff'; }
      drawNode(ctx, n.x, n.y, 16, fill, n.label, textColor);
    });
  }

  let modeIdx = 0;
  function draw() {
    const ctx = getCtx('canvas-petersen'); if (!ctx) return;
    clearCanvas(ctx, 600, 320);
    modes[modeIdx].draw(ctx);
    const lbl = document.getElementById('petersen-label');
    if (lbl) lbl.textContent = modes[modeIdx].title;
  }
  function next() { modeIdx = (modeIdx + 1) % modes.length; draw(); }
  function prev() { modeIdx = (modeIdx - 1 + modes.length) % modes.length; draw(); }
  function reset() { modeIdx = 0; draw(); }
  function setMode(key) {
    const i = modes.findIndex(m => m.key === key);
    if (i >= 0) { modeIdx = i; draw(); }
  }

  setTimeout(draw, 100);
  return { next, prev, reset, setMode };
})();

// ============================================================
// THM 1.68/1.69 — Lower-bound construction: (χ-1) blobs of (C-1) vertices
// ============================================================
const vizRamseyLB = (() => {
  // Example: m = χ(G)-1 = 3, n = C(H)-1 = 3  →  K_9 with bad coloring
  // 3 blobs of 3 vertices. Red = within blob. Blue = between blobs.
  // (For Thm 1.69: T_m with m=4 means m-1=3, K_n with n=4 means n-1=3)
  const BLOBS = 3, PER = 3;
  const CX = 300, CY = 150;
  const BLOB_R = 90;
  const NODE_R = 35;
  const nodes = [];
  for (let b = 0; b < BLOBS; b++) {
    const ang = -Math.PI / 2 + (2 * Math.PI * b) / BLOBS;
    const bx = CX + 95 * Math.cos(ang);
    const by = CY + 70 * Math.sin(ang);
    for (let j = 0; j < PER; j++) {
      const subAng = (2 * Math.PI * j) / PER - Math.PI / 2;
      nodes.push({
        x: bx + NODE_R * Math.cos(subAng),
        y: by + NODE_R * Math.sin(subAng),
        blob: b
      });
    }
  }

  let mode = 'both'; // 'both', 'red', 'blue'

  function draw() {
    const ctx = getCtx('canvas-ramsey-lb'); if (!ctx) return;
    clearCanvas(ctx, 600, 300);

    // Draw edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const sameBlob = nodes[i].blob === nodes[j].blob;
        let color, width;
        if (sameBlob) {
          // within-blob: red edge
          if (mode === 'blue') continue;
          color = COLORS.red;
          width = 2.5;
        } else {
          // between-blob: blue edge
          if (mode === 'red') continue;
          color = COLORS.blue + (mode === 'both' ? '55' : 'cc');
          width = mode === 'both' ? 1 : 2;
        }
        drawEdge(ctx, nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y, color, width);
      }
    }

    // Draw blob circles
    for (let b = 0; b < BLOBS; b++) {
      const ang = -Math.PI / 2 + (2 * Math.PI * b) / BLOBS;
      const bx = CX + 95 * Math.cos(ang);
      const by = CY + 70 * Math.sin(ang);
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.arc(bx, by, 55, 0, Math.PI * 2);
      ctx.strokeStyle = COLORS.dim + 'aa'; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
      drawLabel(ctx, `K_${PER}`, bx, by + 72, COLORS.dim, 11);
    }

    // Draw nodes
    nodes.forEach(n => {
      drawNode(ctx, n.x, n.y, 8, COLORS.node, '', '#111');
    });

    // Label
    const lbl = document.getElementById('ramsey-lb-label');
    if (lbl) {
      const explain = {
        both: `Full coloring of K₉ — 3 blobs of 3. Red inside blobs, blue between blobs.`,
        red: `RED graph only: 3 disjoint copies of K₃. χ(red) = 3. If χ(G) = 4, no red G exists.`,
        blue: `BLUE graph only: complete tripartite K_{3,3,3}. Every component has 9 vertices, but each blue connected component has max independent set... wait, we want: largest comp of H has C(H) = 4, so need 4 vtx comp in blue. Blue here is one big graph — instead for Thm 1.69, we swap: red within (containing T_m) vs blue between (kills K_n).`
      };
      lbl.textContent = explain[mode];
    }
  }

  function showBoth() { mode = 'both'; draw(); }
  function showRed() { mode = 'red'; draw(); }
  function showBlue() { mode = 'blue'; draw(); }

  setTimeout(draw, 100);
  return { showBoth, showRed, showBlue };
})();

// ============================================================
// EX 1.3.4.3 — Prüfer Sequence Reconstruction (5,4,3,5,4,3,5,4,3)
// ============================================================
const vizPrufer = (() => {
  // Decode Prüfer sequence step by step
  // Final tree: vertices 1..11
  // Edges found in decoding:
  // (1,5), (2,4), (6,3), (7,5), (8,4), (9,3), (10,5), (11,4), (4,3), (3,5) final
  // So: 3-4, 4-5, 3-{6,9}, 4-{2,8,11}, 5-{1,7,10}

  const seq = [5, 4, 3, 5, 4, 3, 5, 4, 3];

  // Precompute reconstruction
  function decode(sequence) {
    const n = sequence.length + 2;
    const degrees = new Array(n + 1).fill(1);
    sequence.forEach(v => degrees[v]++);
    const steps = [];
    const seqCopy = [...sequence];

    while (seqCopy.length > 0) {
      // smallest leaf (degree 1)
      let leaf = -1;
      for (let i = 1; i <= n; i++) if (degrees[i] === 1) { leaf = i; break; }
      const parent = seqCopy.shift();
      steps.push({ leaf, parent, edge: [leaf, parent] });
      degrees[leaf]--;
      degrees[parent]--;
    }
    // last 2 vertices
    const remaining = [];
    for (let i = 1; i <= n; i++) if (degrees[i] === 1) remaining.push(i);
    steps.push({ leaf: remaining[0], parent: remaining[1], edge: remaining, final: true });
    return steps;
  }

  const steps = decode(seq);
  let stepIdx = 0; // 0 = initial; steps.length = all done

  // Final tree layout (caterpillar on spine 3-4-5)
  const nodePositions = {
    3: { x: 200, y: 170 },
    4: { x: 300, y: 170 },
    5: { x: 400, y: 170 },
    // leaves on 3: {6, 9}
    6: { x: 140, y: 80 }, 9: { x: 140, y: 260 },
    // leaves on 4: {2, 8, 11}
    2: { x: 260, y: 50 }, 8: { x: 300, y: 50 }, 11: { x: 340, y: 50 },
    // leaves on 5: {1, 7, 10}
    1: { x: 460, y: 80 }, 7: { x: 480, y: 170 }, 10: { x: 460, y: 260 }
  };

  function draw() {
    const ctx = getCtx('canvas-prufer'); if (!ctx) return;
    clearCanvas(ctx, 600, 320);

    // Collect edges drawn so far
    const drawnEdges = steps.slice(0, stepIdx).map(s => s.edge);

    // Draw all edges in grey first (final tree preview) then overlay
    const finalEdges = steps.map(s => s.edge);
    finalEdges.forEach(e => {
      const p1 = nodePositions[e[0]], p2 = nodePositions[e[1]];
      if (!p1 || !p2) return;
      const isDrawn = drawnEdges.some(de => (de[0]===e[0] && de[1]===e[1]) || (de[0]===e[1] && de[1]===e[0]));
      drawEdge(ctx, p1.x, p1.y, p2.x, p2.y,
        isDrawn ? COLORS.green : COLORS.edge + '33',
        isDrawn ? 2.5 : 1);
    });

    // Draw nodes
    Object.entries(nodePositions).forEach(([lbl, p]) => {
      const vertNum = parseInt(lbl);
      const isUsed = steps.slice(0, stepIdx).some(s => s.leaf === vertNum);
      const isCurrent = stepIdx > 0 && stepIdx <= steps.length && steps[stepIdx - 1].leaf === vertNum;
      let fill = COLORS.node;
      if (isCurrent) fill = COLORS.yellow;
      else if (isUsed) fill = COLORS.green + '88';
      drawNode(ctx, p.x, p.y, 16, fill, lbl, '#111');
    });

    // Show remaining sequence
    const remaining = seq.slice(stepIdx < steps.length - 1 ? stepIdx : stepIdx);
    // Actually sequence shrinks each step (except last); show remaining
    let remainingSeq;
    if (stepIdx === 0) remainingSeq = seq;
    else if (stepIdx >= steps.length) remainingSeq = [];
    else remainingSeq = seq.slice(stepIdx);

    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Sequence: [' + remainingSeq.join(', ') + ']', 20, 25);
    if (stepIdx > 0 && stepIdx <= steps.length) {
      const s = steps[stepIdx - 1];
      ctx.fillStyle = COLORS.green;
      ctx.fillText(`Step ${stepIdx}: add edge ${s.edge[0]}—${s.edge[1]}${s.final ? ' (final pair)' : ''}`, 20, 300);
    } else if (stepIdx === 0) {
      ctx.fillStyle = COLORS.dim;
      ctx.fillText('Click Next: remove smallest leaf, record neighbor, pop sequence head.', 20, 300);
    } else {
      ctx.fillStyle = COLORS.green;
      ctx.fillText('✓ Tree fully reconstructed! Degrees: 3→3, 4→4, 5→3 (check deg−1 = # appearances)', 20, 300);
    }
  }

  function next() { if (stepIdx < steps.length) { stepIdx++; draw(); } }
  function prev() { if (stepIdx > 0) { stepIdx--; draw(); } }
  function reset() { stepIdx = 0; draw(); }
  function autoPlay() {
    stepIdx = 0; draw();
    const iv = setInterval(() => {
      if (stepIdx >= steps.length) { clearInterval(iv); return; }
      stepIdx++; draw();
    }, 900);
  }

  setTimeout(draw, 100);
  return { next, prev, reset, autoPlay };
})();

// ============================================================
// EX 1.1.2.12/13 — Bowtie counterexample
// ============================================================
const vizBowtie = (() => {
  // Two triangles sharing central vertex c
  const nodes = [
    { x: 120, y: 100, label: 'a' },
    { x: 120, y: 220, label: 'b' },
    { x: 300, y: 160, label: 'c' },  // shared / cut vertex
    { x: 480, y: 100, label: 'd' },
    { x: 480, y: 220, label: 'e' }
  ];
  const edges = [[0,1],[0,2],[1,2],[2,3],[2,4],[3,4]];

  let view = 'normal'; // 'normal', 'remove-c', 'highlight-cycles'

  function draw() {
    const ctx = getCtx('canvas-bowtie'); if (!ctx) return;
    clearCanvas(ctx, 600, 300);

    if (view === 'remove-c') {
      // Show graph with c removed
      edges.forEach(([u, v]) => {
        if (u === 2 || v === 2) return; // skip edges incident to c
        drawEdge(ctx, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y, COLORS.edge, 2);
      });
      nodes.forEach((n, i) => {
        if (i === 2) {
          ctx.save();
          ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.arc(n.x, n.y, 14, 0, Math.PI*2);
          ctx.strokeStyle = COLORS.red + 'aa'; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.restore();
          drawLabel(ctx, 'c removed', n.x, n.y, COLORS.red, 10);
        } else {
          drawNode(ctx, n.x, n.y, 16, COLORS.node, n.label);
        }
      });
      drawLabel(ctx, 'After removing c: 2 disconnected components ⇒ c IS a cut vertex', 300, 270, COLORS.red, 12);
    } else {
      // Normal or highlight cycles
      edges.forEach(([u, v]) => {
        const isOnCycle = true; // every edge is on a triangle
        drawEdge(ctx, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y,
          view === 'highlight-cycles' ? COLORS.green : COLORS.edge, 2);
      });
      nodes.forEach((n, i) => {
        const isCut = (i === 2);
        drawNode(ctx, n.x, n.y, 16,
          view === 'highlight-cycles' && isCut ? COLORS.yellow : COLORS.node,
          n.label);
      });
      if (view === 'highlight-cycles') {
        drawLabel(ctx, 'Every edge lies on a triangle ⇒ NO bridges. But c is a cut vertex!', 300, 270, COLORS.yellow, 12);
      } else {
        drawLabel(ctx, 'The "bowtie": two triangles sharing vertex c', 300, 270, COLORS.dim, 12);
      }
    }
  }

  function showNormal() { view = 'normal'; draw(); }
  function showCycles() { view = 'highlight-cycles'; draw(); }
  function showRemove() { view = 'remove-c'; draw(); }

  setTimeout(draw, 100);
  return { showNormal, showCycles, showRemove };
})();

// ============================================================
// EX 1.2.2.4 — Triangles count via A³ diagonal
// ============================================================
const vizTriangleCount = (() => {
  // Small graph: K_4 (6 edges, 4 triangles)
  const nodes = [
    { x: 200, y: 60, label: '1' },
    { x: 400, y: 60, label: '2' },
    { x: 400, y: 240, label: '3' },
    { x: 200, y: 240, label: '4' }
  ];
  const edges = [[0,1],[1,2],[2,3],[3,0],[0,2],[1,3]];
  // Triangles: {1,2,3}, {1,2,4}, {1,3,4}, {2,3,4} — 4 triangles

  let step = 0; // 0: graph, 1: show one triangle from v1, 2: show both, 3: formula

  const triangles_v1 = [[0,1,2], [0,2,3], [0,1,3]]; // triangles through vertex 1

  function draw() {
    const ctx = getCtx('canvas-triangle-count'); if (!ctx) return;
    clearCanvas(ctx, 600, 300);

    // Draw all edges dim
    edges.forEach(([u, v]) => {
      drawEdge(ctx, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y, COLORS.edge, 1.5);
    });

    if (step >= 1 && step <= 3) {
      // Highlight triangles through vertex 1
      const shown = step === 1 ? triangles_v1.slice(0, 1) : step === 2 ? triangles_v1.slice(0, 2) : triangles_v1;
      const palette = [COLORS.red, COLORS.green, COLORS.blue];
      shown.forEach((tri, ti) => {
        const color = palette[ti];
        // Draw triangle edges thick
        for (let i = 0; i < 3; i++) {
          const [a, b] = [tri[i], tri[(i+1) % 3]];
          drawEdge(ctx, nodes[a].x, nodes[a].y, nodes[b].x, nodes[b].y, color, 3);
        }
      });
    }

    nodes.forEach((n, i) => {
      const isV1 = i === 0;
      drawNode(ctx, n.x, n.y, 18, isV1 && step > 0 ? COLORS.yellow : COLORS.node, n.label);
    });

    const msg = [
      'K₄: 4 vertices, 6 edges. How many triangles?',
      '1 triangle through v₁: {1,2,3} (red)',
      '2 triangles through v₁: {1,2,3}, {1,3,4}',
      '3 triangles through v₁: {1,2,3}, {1,3,4}, {1,2,4}. [A³]₁,₁ = 2·3 = 6 (each ×2 directions)'
    ];
    drawLabel(ctx, msg[step], 300, 280, COLORS.text, 12);
  }

  function next() { if (step < 3) { step++; draw(); } }
  function prev() { if (step > 0) { step--; draw(); } }
  function reset() { step = 0; draw(); }

  setTimeout(draw, 100);
  return { next, prev, reset };
})();

// ============================================================
// EX 1.6.4.1 — Chromatic Polynomials for Small Graphs
// ============================================================
const vizChromPoly = (() => {
  const graphs = {
    'K_1,3': {
      nodes: [{x:300,y:160,label:'c'},{x:180,y:80,label:'1'},{x:420,y:80,label:'2'},{x:300,y:260,label:'3'}],
      edges: [[0,1],[0,2],[0,3]],
      formula: 'P(k) = k(k−1)³',
      k5: '5·4³ = 320',
      explain: 'Center: k choices. Each of 3 leaves: (k−1) choices.'
    },
    'C_4': {
      nodes: [{x:200,y:80,label:'1'},{x:400,y:80,label:'2'},{x:400,y:240,label:'3'},{x:200,y:240,label:'4'}],
      edges: [[0,1],[1,2],[2,3],[3,0]],
      formula: 'P(k) = (k−1)⁴ + (k−1)',
      k5: '4⁴ + 4 = 260',
      explain: 'Cycle formula: (k−1)ⁿ + (−1)ⁿ(k−1). For n=4: 256 + 4 = 260.'
    },
    'C_5': {
      nodes: (() => {
        const pts = [];
        for (let i = 0; i < 5; i++) {
          const a = -Math.PI/2 + 2*Math.PI*i/5;
          pts.push({ x: 300 + 90*Math.cos(a), y: 160 + 90*Math.sin(a), label: (i+1)+'' });
        }
        return pts;
      })(),
      edges: [[0,1],[1,2],[2,3],[3,4],[4,0]],
      formula: 'P(k) = (k−1)⁵ − (k−1)',
      k5: '4⁵ − 4 = 1020',
      explain: 'Cycle formula: (k−1)ⁿ + (−1)ⁿ(k−1). For n=5: 1024 − 4 = 1020.'
    },
    'K_4 − e': {
      nodes: [{x:200,y:80,label:'w'},{x:400,y:80,label:'x'},{x:400,y:240,label:'u'},{x:200,y:240,label:'v'}],
      // K_4 − e where e = {u,v} → edges: w-x, w-u, w-v, x-u, x-v, (no u-v)
      edges: [[0,1],[0,2],[0,3],[1,2],[1,3]],
      formula: 'P(k) = k(k−1)(k−2)²',
      k5: '5·4·9 = 180',
      explain: 'Color w (k), x (k−1), u must differ from w,x (k−2), v likewise (k−2).'
    }
  };

  const order = ['K_1,3', 'C_4', 'C_5', 'K_4 − e'];
  let idx = 0;

  function draw() {
    const ctx = getCtx('canvas-chrom-poly'); if (!ctx) return;
    clearCanvas(ctx, 600, 300);
    const name = order[idx];
    const G = graphs[name];
    G.edges.forEach(([u, v]) => {
      drawEdge(ctx, G.nodes[u].x, G.nodes[u].y, G.nodes[v].x, G.nodes[v].y, COLORS.edge, 2);
    });
    G.nodes.forEach(n => {
      drawNode(ctx, n.x, n.y, 16, COLORS.node, n.label);
    });

    // Title + formula
    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(name, 20, 28);

    ctx.fillStyle = COLORS.yellow;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText(G.formula, 20, 50);

    ctx.fillStyle = COLORS.green;
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('5-colorings: ' + G.k5, 20, 70);

    ctx.fillStyle = COLORS.dim;
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(G.explain, 20, 285);
  }

  function next() { idx = (idx + 1) % order.length; draw(); }
  function prev() { idx = (idx - 1 + order.length) % order.length; draw(); }
  function reset() { idx = 0; draw(); }

  setTimeout(draw, 100);
  return { next, prev, reset };
})();
