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
