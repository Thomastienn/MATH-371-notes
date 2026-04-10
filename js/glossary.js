// ============================================================
// GLOSSARY DATA & RENDER
// ============================================================
const glossaryData = [
  { term: "Matching", def: "A set of edges with no shared endpoints. Maximum matching = largest possible." },
  { term: "Augmenting Path", def: "An alternating path (non-M, M, non-M, ...) whose endpoints are both unmatched by M. Flipping it grows M by 1." },
  { term: "Perfect Matching", def: "A matching that covers every vertex. Exists only when |V| is even." },
  { term: "Vertex Cover", def: "A set of vertices such that every edge has at least one endpoint in the set. Min cover = beta(G)." },
  { term: "Hall's Condition", def: "|N(S)| >= |S| for every S in X. Necessary and sufficient for X-saturating matching in bipartite graphs." },
  { term: "SDR", def: "System of Distinct Representatives: pick one element per set, all distinct. Equivalent to Hall's theorem via bipartite graph." },
  { term: "Ramsey Number R(p,q)", def: "Smallest n such that every red/blue coloring of K_n contains a red K_p or blue K_q." },
  { term: "Bipartite Graph", def: "Vertices split into two sets; every edge crosses between them. Equivalent to no odd cycles." },
  { term: "Chromatic Number chi(G)", def: "Minimum colors for a proper vertex coloring (no two adjacent vertices share a color)." },
  { term: "Chromatic Polynomial C_G(k)", def: "Polynomial giving the number of proper k-colorings of G." },
  { term: "Degree deg(v)", def: "Number of edges touching vertex v." },
  { term: "Deletion-Contraction", def: "C_G(k) = C_{G-e}(k) - C_{G/e}(k). Recursive method for chromatic polynomials." },
  { term: "Euler's Formula", def: "Connected planar graph: V - E + F = 2." },
  { term: "Eulerian Circuit", def: "Closed walk using every edge exactly once. Exists iff every vertex has even degree." },
  { term: "Kempe Chain", def: "Maximal 2-color subgraph. Swapping its colors preserves valid coloring." },
  { term: "Planar Graph", def: "Can be drawn without edge crossings. Satisfies E <= 3V - 6." },
  { term: "Tree", def: "Connected + acyclic. Has n-1 edges, at least 2 leaves." },
  { term: "Independence Number alpha(G)", def: "Largest set of pairwise non-adjacent vertices." },
  { term: "Walk vs Path", def: "Walk: vertices can repeat. Path: no repeated vertices. Every walk contains a path." },
  { term: "Claw (K_{1,3})", def: "Star with 1 center and 3 leaves. A common forbidden induced subgraph." }
];

const glossaryGrid = document.getElementById('glossary-grid');
glossaryData.forEach(item => {
  const el = document.createElement('div');
  el.className = 'glossary-item';
  el.innerHTML = `<div class="glossary-term">${item.term}</div><div class="glossary-def">${item.def}</div>`;
  glossaryGrid.appendChild(el);
});
