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
      ctx.strokeStyle = 'rgba(119,119,119,0.45)'; ctx.lineWidth = 1; ctx.stroke();
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
        both: 'K₉: 3 groups of 3 (Thm 1.69 lower bound). RED = inside each group. BLUE = between groups.',
        red: 'RED only: 3 disjoint K₃. Each red component has 3 vertices ⇒ no red T₄ (tree needs 4 in one component).',
        blue: 'BLUE only: complete tripartite K₃,₃,₃. χ(blue)=3 ⇒ no blue K₄ (needs 4-clique).'
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

// Factory to reuse bowtie for multiple canvases
function makeBowtie(canvasId) {
  const nodes = [
    { x: 120, y: 100, label: 'a' },
    { x: 120, y: 220, label: 'b' },
    { x: 300, y: 160, label: 'c' },
    { x: 480, y: 100, label: 'd' },
    { x: 480, y: 220, label: 'e' }
  ];
  const edges = [[0,1],[0,2],[1,2],[2,3],[2,4],[3,4]];
  let view = 'normal';

  function draw() {
    const ctx = getCtx(canvasId); if (!ctx) return;
    clearCanvas(ctx, 600, 300);
    if (view === 'remove-c') {
      edges.forEach(([u, v]) => {
        if (u === 2 || v === 2) return;
        drawEdge(ctx, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y, COLORS.edge, 2);
      });
      nodes.forEach((n, i) => {
        if (i === 2) {
          ctx.save(); ctx.setLineDash([3, 3]);
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
      edges.forEach(([u, v]) => {
        drawEdge(ctx, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y,
          view === 'highlight-cycles' ? COLORS.green : COLORS.edge, 2);
      });
      nodes.forEach((n, i) => {
        const isCut = (i === 2);
        drawNode(ctx, n.x, n.y, 16,
          view === 'highlight-cycles' && isCut ? COLORS.yellow : COLORS.node, n.label);
      });
      if (view === 'highlight-cycles') {
        drawLabel(ctx, 'Every vertex lies on a triangle ⇒ NO bridges. But c is a cut vertex!', 300, 270, COLORS.yellow, 12);
      } else {
        drawLabel(ctx, 'The "bowtie": two triangles sharing vertex c', 300, 270, COLORS.dim, 12);
      }
    }
  }

  setTimeout(draw, 100);
  return {
    showNormal() { view = 'normal'; draw(); },
    showCycles() { view = 'highlight-cycles'; draw(); },
    showRemove() { view = 'remove-c'; draw(); }
  };
}
const vizBowtie2 = makeBowtie('canvas-bowtie-2');

// Factory to reuse Ramsey-LB blob for multiple canvases
function makeRamseyLB(canvasId, labelId) {
  const BLOBS = 3, PER = 3;
  const CX = 300, CY = 150;
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
  let mode = 'both';
  function draw() {
    const ctx = getCtx(canvasId); if (!ctx) return;
    clearCanvas(ctx, 600, 300);
    // Thm 1.68 convention: RED = between-block (multipartite, χ = a, kills G)
    //                      BLUE = inside-block (disjoint K_b's, tiny components kill H)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const sameBlob = nodes[i].blob === nodes[j].blob;
        let color, width;
        if (sameBlob) {
          // inside-blob: BLUE
          if (mode === 'red') continue;
          color = COLORS.blue;
          width = mode === 'blue' ? 2.5 : 1.5;
        } else {
          // between-blob: RED
          if (mode === 'blue') continue;
          color = COLORS.red + (mode === 'both' ? '77' : 'cc');
          width = mode === 'both' ? 1 : 2;
        }
        drawEdge(ctx, nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y, color, width);
      }
    }
    for (let b = 0; b < BLOBS; b++) {
      const ang = -Math.PI / 2 + (2 * Math.PI * b) / BLOBS;
      const bx = CX + 95 * Math.cos(ang);
      const by = CY + 70 * Math.sin(ang);
      ctx.save(); ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.arc(bx, by, 55, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(119,119,119,0.45)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
      drawLabel(ctx, `K_${PER} (blue)`, bx, by + 72, COLORS.dim, 11);
    }
    nodes.forEach(n => drawNode(ctx, n.x, n.y, 8, COLORS.node, '', '#111'));
    const lbl = labelId ? document.getElementById(labelId) : null;
    if (lbl) {
      lbl.textContent = {
        both: 'K₉ = 3 blocks of 3. RED = between-block edges (multipartite). BLUE = inside-block edges (disjoint K₃).',
        red:  'RED only = K₃,₃,₃, chromatic number 3 = χ(G)−1 ⇒ no red G with χ(G)=4 fits.',
        blue: 'BLUE only = 3 disjoint K₃. Each blue component has 3 vertices ⇒ no blue H with largest component 4.'
      }[mode];
    }
  }
  setTimeout(draw, 100);
  return {
    showBoth() { mode = 'both'; draw(); },
    showRed()  { mode = 'red'; draw(); },
    showBlue() { mode = 'blue'; draw(); }
  };
}
const vizRamseyLB63 = makeRamseyLB('canvas-ramsey-63', 'ramsey-63-label');
const vizRamseyLB67 = makeRamseyLB('canvas-ramsey-67', 'ramsey-67-label');
const vizRamseyLB68 = makeRamseyLB('canvas-ramsey-68', 'ramsey-68-label');

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
// EX 1.2.2.5 — C₁₀ Bipartition (parity argument)
// ============================================================
const vizC10Bipartition = (() => {
  const CX = 300, CY = 160;
  const R = 120;
  const nodes = [];
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (2 * Math.PI * i) / 10;
    nodes.push({ x: CX + R * Math.cos(ang), y: CY + R * Math.sin(ang), label: 'v' + (i + 1), idx: i });
  }
  const edges = [];
  for (let i = 0; i < 10; i++) edges.push([i, (i + 1) % 10]);

  let mode = 'plain'; // 'plain', 'bipartition', 'walk'

  function draw() {
    const ctx = getCtx('canvas-c10'); if (!ctx) return;
    clearCanvas(ctx, 600, 320);

    edges.forEach(([u, v]) => {
      drawEdge(ctx, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y, COLORS.edge, 2);
    });

    nodes.forEach((n, i) => {
      let fill = COLORS.node;
      let textColor = '#111';
      if (mode === 'bipartition' || mode === 'walk') {
        // Partition A: v1,v3,v5,v7,v9 (even index i = 0,2,4,6,8)
        const isA = i % 2 === 0;
        fill = isA ? COLORS.red : COLORS.blue;
        textColor = '#fff';
      }
      if (mode === 'walk' && (i === 0 || i === 4)) {
        // v1 and v5 — highlight
        fill = COLORS.yellow;
        textColor = '#111';
      }
      drawNode(ctx, n.x, n.y, 18, fill, n.label, textColor);
    });

    // Labels
    ctx.fillStyle = COLORS.text;
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'left';
    if (mode === 'plain') {
      ctx.fillStyle = COLORS.dim;
      ctx.fillText('C₁₀ — cycle on 10 vertices. Compute [A²⁰⁰⁹]₁,₅.', 20, 25);
    } else if (mode === 'bipartition') {
      ctx.fillStyle = COLORS.red;
      ctx.fillText('A = {v₁, v₃, v₅, v₇, v₉} (red)', 20, 25);
      ctx.fillStyle = COLORS.blue;
      ctx.fillText('B = {v₂, v₄, v₆, v₈, v₁₀} (blue)', 20, 45);
      ctx.fillStyle = COLORS.dim;
      ctx.fillText('Every edge goes A↔B ⇒ C₁₀ is bipartite.', 20, 300);
    } else if (mode === 'walk') {
      ctx.fillStyle = COLORS.yellow;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('v₁ and v₅ are in the same bipartition class (highlighted).', 20, 25);
      ctx.font = '13px Inter, sans-serif';
      ctx.fillStyle = COLORS.text;
      ctx.fillText('A walk bounces A→B→A→B→... — each step flips partition.', 20, 270);
      ctx.fillText('To go from A to A: even # of steps required.', 20, 288);
      ctx.fillStyle = COLORS.red;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('2009 is ODD ⇒  [A²⁰⁰⁹]₁,₅ = 0', 20, 310);
    }
  }

  function showPlain() { mode = 'plain'; draw(); }
  function showBipartition() { mode = 'bipartition'; draw(); }
  function showWalk() { mode = 'walk'; draw(); }

  setTimeout(draw, 100);
  return { showPlain, showBipartition, showWalk };
})();

// ============================================================
// EX 1.6.4.4 — Tree coloring cascade: P(T, k) = k(k-1)^(n-1)
// ============================================================
const vizTreeColoring = (() => {
  // Small tree: root + branching structure
  //       1
  //      /|\
  //     2 3 4
  //    /|   \
  //   5 6    7
  const nodes = [
    { x: 300, y: 60,  label: '1', parent: -1 },
    { x: 150, y: 160, label: '2', parent: 0 },
    { x: 300, y: 160, label: '3', parent: 0 },
    { x: 450, y: 160, label: '4', parent: 0 },
    { x: 90,  y: 260, label: '5', parent: 1 },
    { x: 210, y: 260, label: '6', parent: 1 },
    { x: 450, y: 260, label: '7', parent: 3 }
  ];
  const edges = [[0,1],[0,2],[0,3],[1,4],[1,5],[3,6]];

  const k = 4; // use k = 4 colors for visualization
  let step = 0; // 0..7; 0 = nothing colored, i = vertex i-1 just colored

  // Precompute one valid coloring — each child picks color ≠ parent
  // Root gets 0; each child picks smallest color ≠ parent
  const colorPalette = [COLORS.red, COLORS.blue, COLORS.green, COLORS.yellow];
  const colors = new Array(nodes.length).fill(-1);
  // Deterministic: root = 0, child = (parent+1) % k; but we want realistic (varied)
  const assignment = [0, 1, 2, 1, 0, 2, 0]; // hand-picked, all valid

  function draw() {
    const ctx = getCtx('canvas-tree-color'); if (!ctx) return;
    clearCanvas(ctx, 600, 320);

    // Draw edges
    edges.forEach(([u, v]) => {
      const colored = step > u && step > v;
      drawEdge(ctx, nodes[u].x, nodes[u].y, nodes[v].x, nodes[v].y,
        colored ? COLORS.green : COLORS.edge, colored ? 2.5 : 2);
    });

    // Draw nodes
    nodes.forEach((n, i) => {
      const done = i < step;
      const current = i === step - 1;
      let fill = COLORS.node;
      let textColor = '#111';
      if (done) {
        fill = colorPalette[assignment[i]];
        textColor = '#fff';
      }
      if (current) {
        // ring around current
        ctx.beginPath();
        ctx.arc(n.x, n.y, 24, 0, Math.PI * 2);
        ctx.strokeStyle = COLORS.yellow; ctx.lineWidth = 2.5; ctx.stroke();
      }
      drawNode(ctx, n.x, n.y, 18, fill, n.label, textColor);
    });

    // Text labels
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'left';

    if (step === 0) {
      ctx.fillText('Tree of order 7. Use k = 4 colors.', 20, 25);
      ctx.fillStyle = COLORS.dim;
      ctx.font = '13px Inter, sans-serif';
      ctx.fillText('Click "Color Next" to color root, then each child.', 20, 48);
    } else if (step === nodes.length) {
      ctx.fillStyle = COLORS.green;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(`Done: P(T, k) = k(k−1)^${nodes.length - 1}  |  at k=4: 4·3^6 = 2916`, 20, 25);
    } else {
      const i = step - 1;
      ctx.fillStyle = colorPalette[assignment[i]];
      if (nodes[i].parent === -1) {
        ctx.fillText(`Root v${i+1}: ANY of k=4 colors ⇒ 4 choices.`, 20, 25);
      } else {
        ctx.fillText(`v${i+1}: any color ≠ parent's ⇒ (k−1) = 3 choices.`, 20, 25);
      }
    }

    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    const mult = step === 0 ? '—' : step === 1 ? 'k' : `k × (k−1)^${step - 1}`;
    const num = step === 0 ? '—' : step === 1 ? `${k}` : `${k} · ${k-1}^${step-1} = ${k * Math.pow(k-1, step-1)}`;
    ctx.fillText(`P(T, k) so far: ${mult}   =   ${num}`, 300, 302);
  }

  function next() { if (step < nodes.length) { step++; draw(); } }
  function prev() { if (step > 0) { step--; draw(); } }
  function reset() { step = 0; draw(); }
  function autoPlay() {
    step = 0; draw();
    const iv = setInterval(() => {
      if (step >= nodes.length) { clearInterval(iv); return; }
      step++; draw();
    }, 850);
  }

  setTimeout(draw, 100);
  return { next, prev, reset, autoPlay };
})();

// ============================================================
// EX 1.1.2.16 — Two copies of K_{n/2} (tight counterexample)
// ============================================================
const vizTwoCliques = (() => {
  // Two disjoint K_4's — so n = 8, each K_4 has δ = 3 = (n-2)/2 ✓
  const leftCenter = { x: 180, y: 160 };
  const rightCenter = { x: 420, y: 160 };
  const R = 75;
  const left = [];
  const right = [];
  for (let i = 0; i < 4; i++) {
    const ang = -Math.PI / 2 + (Math.PI * 2 * i) / 4;
    left.push({ x: leftCenter.x + R * Math.cos(ang), y: leftCenter.y + R * Math.sin(ang), label: 'a' + (i+1) });
    right.push({ x: rightCenter.x + R * Math.cos(ang), y: rightCenter.y + R * Math.sin(ang), label: 'b' + (i+1) });
  }

  function draw() {
    const ctx = getCtx('canvas-two-cliques'); if (!ctx) return;
    clearCanvas(ctx, 600, 320);

    // K_4 edges (all pairs)
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        drawEdge(ctx, left[i].x, left[i].y, left[j].x, left[j].y, COLORS.edge, 2);
        drawEdge(ctx, right[i].x, right[i].y, right[j].x, right[j].y, COLORS.edge, 2);
      }
    }

    left.forEach(n => drawNode(ctx, n.x, n.y, 16, COLORS.red, n.label, '#fff'));
    right.forEach(n => drawNode(ctx, n.x, n.y, 16, COLORS.blue, n.label, '#fff'));

    // Labels
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('K₄', leftCenter.x, leftCenter.y + 115);
    ctx.fillText('K₄', rightCenter.x, rightCenter.y + 115);

    ctx.fillStyle = COLORS.yellow;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('G = K₄ ∪ K₄:  n = 8,  δ(G) = 3 = (n−2)/2', 20, 25);
    ctx.fillStyle = COLORS.red;
    ctx.fillText('Disconnected! — shows the bound (n−2)/2 is NOT enough', 20, 48);
    ctx.fillStyle = COLORS.green;
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('Part (a) proof: if δ ≥ (n−1)/2, sum degrees across a split violates 2δ ≤ n−2.', 20, 298);
  }
  setTimeout(draw, 100);
  return { reset: draw };
})();

// ============================================================
// THMs 1.32 & 1.34 — Planarity edge counting
// ============================================================
const vizK33Planar = (() => {
  const OX = 320;
  const top = [{x:OX+0,y:70,label:'h₁'},{x:OX+90,y:70,label:'h₂'},{x:OX+180,y:70,label:'h₃'}];
  const bot = [{x:OX+0,y:230,label:'u₁'},{x:OX+90,y:230,label:'u₂'},{x:OX+180,y:230,label:'u₃'}];
  const edgeMuted = 'rgba(136,136,136,0.55)';

  function draw() {
    const ctx = getCtx('canvas-k33'); if (!ctx) return;
    clearCanvas(ctx, 600, 320);

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        drawEdge(ctx, top[i].x, top[i].y, bot[j].x, bot[j].y, edgeMuted, 1.5);
      }
    }

    top.forEach(n => drawNode(ctx, n.x, n.y, 16, COLORS.red, n.label, '#fff'));
    bot.forEach(n => drawNode(ctx, n.x, n.y, 16, COLORS.blue, n.label, '#fff'));

    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.accent;
    ctx.fillText('K₃,₃:  n=6,  E=9', 16, 22);
    ctx.font = '12px monospace';
    const lines = [
      'Assume planar. Euler: F = 2 − n + E = 5',
      'Bipartite ⇒ girth ≥ 4 ⇒ each face ≥ 4 edges',
      'Σ (face, edge) ≥ 4F = 20',
      'Each edge borders ≤ 2 faces: Σ ≤ 2E = 18',
      'Contradiction ⇒ K₃,₃ nonplanar'
    ];
    lines.forEach((l, i) => {
      ctx.fillStyle = i === lines.length - 1 ? COLORS.red : COLORS.text;
      ctx.font = i === lines.length - 1 ? 'bold 12px monospace' : '12px monospace';
      ctx.fillText(l, 16, 48 + i * 17);
    });
  }
  setTimeout(draw, 100);
  return { reset: draw };
})();

const vizK5Planar = (() => {
  const CX = 300, CY = 170;
  const R = 110;
  const nodes = [];
  for (let i = 0; i < 5; i++) {
    const ang = -Math.PI / 2 + (Math.PI * 2 * i) / 5;
    nodes.push({ x: CX + R * Math.cos(ang), y: CY + R * Math.sin(ang), label: 'v' + (i+1) });
  }

  function draw() {
    const ctx = getCtx('canvas-k5'); if (!ctx) return;
    clearCanvas(ctx, 600, 330);

    // All C(5,2) = 10 edges — some will cross
    const crossing = new Set(['0-2','1-3','2-4','0-3','1-4']);
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        const key = i + '-' + j;
        const isX = crossing.has(key);
        drawEdge(ctx, nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y,
          isX ? COLORS.red : COLORS.edge, isX ? 2.8 : 1.8);
      }
    }
    nodes.forEach(n => drawNode(ctx, n.x, n.y, 16, COLORS.node, n.label));

    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('K₅:  n=5,  E=10', 20, 25);
    ctx.font = '13px monospace';
    ctx.fillStyle = COLORS.text;
    const lines = [
      'Planar bound (Thm 1.33): E ≤ 3n − 6 = 3·5 − 6 = 9',
      'But K₅ has E = 10',
      '10 > 9 ✗  CONTRADICTION ⇒ K₅ is nonplanar'
    ];
    lines.forEach((l, i) => {
      ctx.fillStyle = i === 2 ? COLORS.red : COLORS.text;
      if (i === 2) ctx.font = 'bold 13px monospace';
      ctx.fillText(l, 20, 260 + i * 20);
    });
  }
  setTimeout(draw, 100);
  return { reset: draw };
})();

// ============================================================
// EX 1.3.4.2 — Forward Prüfer: encode a given tree
// ============================================================
const vizPruferEncode = (() => {
  // Labeled tree shown in the book Fig 1.50 (left tree):
  //           1
  //          /|\
  //         2 3 4 5
  //        /| | | |\
  //       6 7 8 9 10 11
  // Approximation: vertex 1 is root, children 2,3,4,5; leaves 6,7 on 2; 8 on 3; 9,10,11 on ... hmm
  // Let's use a clear small tree: 1-2-3-4, 2-5, 3-6
  //       1 — 2 — 3 — 4
  //           |   |
  //           5   6
  // n=6, seq length 4
  const nodePositions = {
    1: { x: 120, y: 160 },
    2: { x: 240, y: 160 },
    3: { x: 360, y: 160 },
    4: { x: 480, y: 160 },
    5: { x: 240, y: 260 },
    6: { x: 360, y: 260 }
  };
  const edges = [[1,2],[2,3],[3,4],[2,5],[3,6]];
  const adj = {};
  edges.forEach(([u,v]) => {
    adj[u] = (adj[u]||[]).concat(v);
    adj[v] = (adj[v]||[]).concat(u);
  });

  // Encode Prüfer: repeatedly remove smallest-labeled leaf, record neighbor
  function encode() {
    const adjCopy = {};
    Object.keys(adj).forEach(k => adjCopy[k] = [...adj[k]]);
    const n = Object.keys(nodePositions).length;
    const steps = [];
    const remaining = new Set(Object.keys(nodePositions).map(Number));
    for (let it = 0; it < n - 2; it++) {
      let smallestLeaf = null;
      [...remaining].sort((a,b)=>a-b).forEach(v => {
        if (smallestLeaf === null && adjCopy[v] && adjCopy[v].length === 1) smallestLeaf = v;
      });
      const nbr = adjCopy[smallestLeaf][0];
      steps.push({ leaf: smallestLeaf, neighbor: nbr });
      adjCopy[nbr] = adjCopy[nbr].filter(x => x !== smallestLeaf);
      adjCopy[smallestLeaf] = [];
      remaining.delete(smallestLeaf);
    }
    return steps;
  }

  const steps = encode();
  let stepIdx = 0;

  function draw() {
    const ctx = getCtx('canvas-prufer-encode'); if (!ctx) return;
    clearCanvas(ctx, 600, 320);

    const removed = new Set(steps.slice(0, stepIdx).map(s => s.leaf));
    const currentLeaf = stepIdx > 0 && stepIdx <= steps.length ? steps[stepIdx - 1].leaf : null;
    const currentNbr = stepIdx > 0 && stepIdx <= steps.length ? steps[stepIdx - 1].neighbor : null;

    edges.forEach(([u, v]) => {
      if (removed.has(u) || removed.has(v)) return; // skip removed edges
      const color = ((u === currentLeaf && v === currentNbr) || (v === currentLeaf && u === currentNbr))
        ? COLORS.yellow : COLORS.edge;
      const width = color === COLORS.yellow ? 3 : 2;
      drawEdge(ctx, nodePositions[u].x, nodePositions[u].y, nodePositions[v].x, nodePositions[v].y, color, width);
    });

    Object.entries(nodePositions).forEach(([lbl, p]) => {
      const v = parseInt(lbl);
      if (removed.has(v)) {
        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, Math.PI*2);
        ctx.strokeStyle = 'rgba(119,119,119,0.55)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();
        drawLabel(ctx, lbl, p.x, p.y, 'rgba(119,119,119,0.75)', 11);
        return;
      }
      let fill = COLORS.node;
      if (v === currentLeaf) fill = COLORS.yellow;
      else if (v === currentNbr) fill = COLORS.blue;
      drawNode(ctx, p.x, p.y, 16, fill, lbl);
    });

    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    const seqSoFar = steps.slice(0, stepIdx).map(s => s.neighbor);
    ctx.fillText('Prüfer: [' + seqSoFar.join(', ') + (seqSoFar.length === steps.length ? '] ✓' : ', _]'), 20, 25);

    ctx.fillStyle = COLORS.dim;
    ctx.font = '12px Inter, sans-serif';
    if (stepIdx === 0) {
      ctx.fillText('Algorithm: at each step, find the smallest-labeled leaf, record its neighbor, remove leaf.', 20, 305);
    } else if (stepIdx <= steps.length) {
      const s = steps[stepIdx - 1];
      ctx.fillStyle = COLORS.yellow;
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillText(`Step ${stepIdx}: smallest leaf = v${s.leaf} (yellow). Record neighbor v${s.neighbor} (blue). Remove v${s.leaf}.`, 20, 305);
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
// EX 1.3.4.6 — K_n edge symmetry → each edge in 2n^(n-3) spanning trees
// ============================================================
const vizKnEdgeSymmetry = (() => {
  // K_5 with one edge highlighted
  const CX = 300, CY = 160;
  const R = 110;
  const nodes = [];
  for (let i = 0; i < 5; i++) {
    const ang = -Math.PI / 2 + (Math.PI * 2 * i) / 5;
    nodes.push({ x: CX + R * Math.cos(ang), y: CY + R * Math.sin(ang), label: 'v' + (i+1) });
  }
  const highlightedEdge = [0, 1]; // v1-v2

  function draw() {
    const ctx = getCtx('canvas-kn-symmetry'); if (!ctx) return;
    clearCanvas(ctx, 600, 300);

    // All edges
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        const isHi = (i === highlightedEdge[0] && j === highlightedEdge[1]);
        drawEdge(ctx, nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y,
          isHi ? COLORS.red : 'rgba(136,136,136,0.45)', isHi ? 3.5 : 2);
      }
    }
    nodes.forEach(n => drawNode(ctx, n.x, n.y, 16, COLORS.node, n.label));

    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('K_n edge symmetry (shown: K₅, edge e = v₁v₂)', 20, 25);

    ctx.font = '12px monospace';
    ctx.fillStyle = COLORS.text;
    const lines = [
      'Total spanning trees of K_n:   τ(K_n) = n^(n−2)   (Cayley)',
      'Each spanning tree has n−1 edges.',
      'Total (edge, tree) incidences = (n−1) · n^(n−2)',
      'By vertex-transitivity, each edge lies in the same # of trees.',
      '# edges = C(n,2) = n(n−1)/2',
      '⇒ each edge is in:  (n−1) · n^(n−2)  /  (n(n−1)/2)  =  2·n^(n−3)',
      '',
      'τ(K_n − e) = n^(n−2) − 2·n^(n−3) = (n−2) · n^(n−3)'
    ];
    lines.forEach((l, i) => {
      ctx.fillStyle = i === lines.length - 1 ? COLORS.green : COLORS.dim;
      if (i === lines.length - 1) ctx.font = 'bold 13px monospace';
      ctx.fillText(l, 20, 55 + i * 17);
    });
  }
  setTimeout(draw, 100);
  return { reset: draw };
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
