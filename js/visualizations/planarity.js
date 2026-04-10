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
// 1.40 KURATOWSKI'S THEOREM
// ============================================================
const vizKura = (() => {
  let mode = 'k5'; // 'k5' or 'k33'
  
  function drawK5(ctx) {
    const cx = 300, cy = 160, r = 110;
    const pts = [];
    for(let i=0; i<5; i++) {
      const angle = -Math.PI/2 + (Math.PI*2*i/5);
      pts.push({x: cx + r*Math.cos(angle), y: cy + r*Math.sin(angle)});
    }
    
    // Draw edges
    for(let i=0; i<5; i++) {
        for(let j=i+1; j<5; j++) {
            // Highlight a crossing (e.g. 0-2 and 1-4)
            let isCrossing = (i===0 && j===2) || (i===1 && j===4);
            drawEdge(ctx, pts[i].x, pts[i].y, pts[j].x, pts[j].y, isCrossing ? COLORS.red : '#ffffff40', isCrossing ? 4 : 2);
        }
    }
    
    // Nodes
    pts.forEach((p, i) => drawNode(ctx, p.x, p.y, 20, COLORS.node, String.fromCharCode(97+i), '#111'));
    
    document.getElementById('kura-label').textContent = `Showing K₅, the clique of 5 with an unavoidable crossing in red`;
  }
  
  function drawK33(ctx) {
    const left = [ {x:200, y:60}, {x:200, y:160}, {x:200, y:260} ];
    const right = [ {x:400, y:60}, {x:400, y:160}, {x:400, y:260} ];
    
    // Draw underlying curve to make it look non-trivial, but straight lines are fine to show a direct crossing
    for(let i=0; i<3; i++) {
        for(let j=0; j<3; j++) {
            // Highlight a crossing (e.g. L0-R1 and L1-R0)
            let isCrossing = (i===0 && j===1) || (i===1 && j===0);
            drawEdge(ctx, left[i].x, left[i].y, right[j].x, right[j].y, isCrossing ? COLORS.red : '#ffffff40', isCrossing ? 4 : 2);
        }
    }
    
    // Nodes
    left.forEach((p,i) => drawNode(ctx, p.x, p.y, 22, COLORS.node, `H${i+1}`, '#111'));
    right.forEach((p,i) => drawNode(ctx, p.x, p.y, 22, COLORS.green, `U${i+1}`, '#111'));
    
    document.getElementById('kura-label').textContent = `Showing K₃,₃, the 3-houses 3-utilities puzzle with an unavoidable crossing in red`;
  }

  function draw() {
    const ctx = getCtx('canvas-kura'); if(!ctx) return;
    clearCanvas(ctx, 600, 320);
    if(mode === 'k5') drawK5(ctx);
    else drawK33(ctx);
  }

  function showK5() { mode = 'k5'; draw(); }
  function showK33() { mode = 'k33'; draw(); }
  
  setTimeout(draw, 100);
  return { showK5, showK33 };
})();
