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
// 1.17 KRUSKAL'S ALGORITHM
// ============================================================
const vizKruskal = (() => {
  const nodes = [
    {id:0, x:150, y:120, label:'a'},
    {id:1, x:300, y:60,  label:'b'},
    {id:2, x:450, y:120, label:'c'},
    {id:3, x:220, y:220, label:'d'},
    {id:4, x:380, y:220, label:'e'}
  ];
  // edges sorted by weight
  const allEdges = [
    {u:0, v:3, w:1}, // a-d
    {u:2, v:4, w:2}, // c-e
    {u:1, v:4, w:3}, // b-e
    {u:1, v:2, w:4}, // b-c
    {u:3, v:4, w:5}, // d-e
    {u:0, v:1, w:6}, // a-b
    {u:1, v:3, w:7}  // b-d
  ];
  
  let disjointSet = [];
  let mstEdges = [];
  let evaluatedIdx = 0;
  let cycleEdge = null; // currently evaluating but forms cycle

  function find(i) {
    if(disjointSet[i] === i) return i;
    return disjointSet[i] = find(disjointSet[i]);
  }
  function union(i, j) {
    const rootI = find(i), rootJ = find(j);
    if(rootI !== rootJ) {
      disjointSet[rootI] = rootJ;
      return true;
    }
    return false;
  }

  function init() {
    disjointSet = nodes.map(n=>n.id);
    mstEdges = [];
    evaluatedIdx = 0;
    cycleEdge = null;
  }

  function draw() {
    const ctx = getCtx('canvas-kruskal'); if(!ctx) return;
    clearCanvas(ctx, 600, 320);

    // Draw all faint edges with weights
    allEdges.forEach((e, idx) => {
      let isMST = mstEdges.includes(idx);
      let isCycle = cycleEdge === idx;
      let isNext = evaluatedIdx === idx && !isCycle;
      
      let color = '#ffffff20';
      let width = 2;
      
      if(isMST) { color = COLORS.green; width = 4; }
      else if(isCycle) { color = COLORS.red; width = 3; }
      else if(isNext) { color = COLORS.yellow; width = 3; }
      else if(idx < evaluatedIdx) { color = '#333333'; width = 1; }

      const n1 = nodes[e.u], n2 = nodes[e.v];
      drawEdge(ctx, n1.x, n1.y, n2.x, n2.y, color, width);
      
      // mid point for weight
      const mx = (n1.x + n2.x)/2;
      const my = (n1.y + n2.y)/2 - 10;
      drawLabel(ctx, e.w, mx, my, isMST ? COLORS.green : (isCycle ? COLORS.red : COLORS.text), 14);
    });

    // Draw nodes
    nodes.forEach(n => {
      drawNode(ctx, n.x, n.y, 22, COLORS.node, n.label, '#111');
    });

    const lbl = document.getElementById('kruskal-label');
    if (cycleEdge !== null) {
      lbl.textContent = `Edge weight ${allEdges[cycleEdge].w} forms a cycle! Discarding.`;
    } else if (evaluatedIdx < allEdges.length) {
      const e = allEdges[evaluatedIdx];
      lbl.textContent = `Evaluating edge weight ${e.w}... click Next Edge to connect or discard.`;
    } else {
      const totalW = mstEdges.reduce((sum, idx) => sum + allEdges[idx].w, 0);
      lbl.textContent = `MST Complete! Total weight: ${totalW}`;
    }
  }

  function step() {
    if(cycleEdge !== null) {
      cycleEdge = null;
      evaluatedIdx++;
      draw();
      return;
    }
    if(evaluatedIdx >= allEdges.length || mstEdges.length === nodes.length - 1) {
      evaluatedIdx = allEdges.length; // force end
      draw();
      return;
    }
    
    const e = allEdges[evaluatedIdx];
    if(union(e.u, e.v)) {
      mstEdges.push(evaluatedIdx);
      evaluatedIdx++;
    } else {
      cycleEdge = evaluatedIdx; // will be drawn red, next step discards
    }
    draw();
  }

  function reset() { init(); draw(); }
  init(); setTimeout(draw, 100);
  
  return { step, reset };
})();

// ============================================================
// 1.25 GOODMAN-HEDETNIEMI (Forbidden Subgraphs)
// ============================================================
const vizGoodman = (() => {
  let mode = 'claw'; // 'claw' or 'z1'
  
  const w = {x: 300, y: 140, label: 'w'};
  const leaves = [
    {x: 200, y: 60, label: 'a'},
    {x: 400, y: 60, label: 'b'},
    {x: 300, y: 220, label: 'v'}
  ];

  function draw() {
    const ctx = getCtx('canvas-goodman'); if(!ctx) return;
    clearCanvas(ctx, 600, 300);

    // Edges
    leaves.forEach(l => drawEdge(ctx, w.x, w.y, l.x, l.y, '#ffffff40', 3));

    if(mode === 'z1') {
      drawEdge(ctx, leaves[0].x, leaves[0].y, leaves[1].x, leaves[1].y, COLORS.red, 4);
    }

    // Nodes
    drawNode(ctx, w.x, w.y, 25, COLORS.red, 'w', '#fff');
    drawLabel(ctx, '(center)', w.x, w.y + 35, COLORS.dim, 12);
    leaves.forEach(l => drawNode(ctx, l.x, l.y, 20, COLORS.node, l.label, '#111'));

    const lbl = document.getElementById('goodman-label');
    if(mode === 'claw') {
      lbl.textContent = `Showing Claw (K₁,₃) — 3 edges, NO edges between leaves`;
    } else {
      lbl.textContent = `Showing Z₁ (Claw + 1 edge) — 4 edges, ONE edge between leaves a and b`;
    }
  }

  function showClaw() { mode = 'claw'; draw(); }
  function showZ1() { mode = 'z1'; draw(); }
  function reset() { showClaw(); }
  
  setTimeout(draw, 100);
  return { showClaw, showZ1, reset };
})();
