import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Binary Tree Maximum Path Sum – Interactive Visualizer (LeetCode 124)
 * ---------------------------------------------------------------
 * • Paste a LeetCode array (level-order with nulls), e.g.: [1,2,3] or [-10,9,20,null,null,15,7]
 * • Click Build Tree → Start to animate the DFS.
 * • Step lets you go one state at a time. Reset to clear.
 * • Speed slider controls animation speed.
 * • The final maximum path is highlighted boldly.
 *
 * Notes on the algorithm:
 *  - For each node, we compute leftGain = max(0, dfs(left)), rightGain = max(0, dfs(right)).
 *  - maxThroughNode = node.val + leftGain + rightGain → candidate for global maximum.
 *  - Return to parent: node.val + max(leftGain, rightGain) (only one branch goes up).
 */

// ----------------------------- Utility Types

type TreeNode = {
  id: number;
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  // layout
  x?: number;
  y?: number;
};

// State snapshot used for stepping/animation
interface Frame {
  type:
    | "visit" // visiting a node (pre)
    | "childDone" // child processed
    | "compute" // compute gains and local max
    | "updateGlobal" // possibly update global
    | "return" // return gain to parent
    | "finalPath"; // mark final path
  nodeId: number | null; // null allowed for finalPath
  payload?: any;
}

// ----------------------------- Tree Building (from LeetCode array)

function parseArray(input: string): (number | null)[] {
  // Accept inputs like: [1,2,3]   1,2,3   1, 2, null, 3
  const cleaned = input
    .trim()
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .split(/\s*,\s*/)
    .filter((s) => s.length > 0);
  return cleaned.map((s) => (s.toLowerCase() === "null" ? null : Number(s)));
}

let nextId = 1;
function buildTree(values: (number | null)[]): TreeNode | null {
  nextId = 1;
  if (!values.length) return null;
  const nodes: Array<TreeNode | null> = values.map((v) =>
    v === null || Number.isNaN(v)
      ? null
      : { id: nextId++, val: Number(v), left: null, right: null }
  );
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (!n) continue;
    const li = 2 * i + 1;
    const ri = 2 * i + 2;
    if (li < nodes.length) n.left = nodes[li];
    if (ri < nodes.length) n.right = nodes[ri];
  }
  return nodes[0];
}

// ----------------------------- Layout (simple tidy-style horizontal positioning)

function assignLayout(root: TreeNode | null, levelGap = 90, nodeGap = 40) {
  const depths: Record<number, number> = {};
  let maxDepth = 0;
  function depth(n: TreeNode | null, d: number) {
    if (!n) return;
    depths[n.id] = d;
    if (d > maxDepth) maxDepth = d;
    depth(n.left, d + 1);
    depth(n.right, d + 1);
  }
  depth(root, 0);

  // In-order traversal to assign x positions
  let xCounter = 0;
  function inorder(n: TreeNode | null) {
    if (!n) return;
    inorder(n.left);
    (n as any).x = xCounter++ * nodeGap;
    inorder(n.right);
  }
  inorder(root);

  // Add top padding and set Y coordinates
  const topPadding = 60;
  function setY(n: TreeNode | null) {
    if (!n) return;
    n.y = depths[n.id] * levelGap + topPadding;
    setY(n.left);
    setY(n.right);
  }
  setY(root);

  // Find bounds and add padding to ensure all coordinates are positive
  let minX = Infinity;
  let maxX = -Infinity;
  function findBounds(n: TreeNode | null) {
    if (!n) return;
    if ((n.x ?? 0) < minX) minX = n.x ?? 0;
    if ((n.x ?? 0) > maxX) maxX = n.x ?? 0;
    findBounds(n.left);
    findBounds(n.right);
  }
  findBounds(root);

  // Shift all nodes to ensure they're positive with padding
  const sidePadding = 80;
  function shift(n: TreeNode | null) {
    if (!n) return;
    n.x = (n.x ?? 0) - minX + sidePadding;
    shift(n.left);
    shift(n.right);
  }
  shift(root);

  const treeWidth = maxX - minX;
  return { width: Math.max(600, treeWidth + sidePadding * 2), height: (maxDepth + 1) * levelGap + topPadding + 60 };
}

// ----------------------------- DFS Tracer (produce frames to animate)

interface SolveResult {
  frames: Frame[];
  maxSum: number;
  bestPathNodeIds: number[]; // nodes on final max path
}

function solveWithFrames(root: TreeNode | null): SolveResult {
  const frames: Frame[] = [];
  let globalMax = -Infinity;
  // To reconstruct best path, record for the node where we set a new global max:
  // we keep its left/right chosen gains and pointers at that time.
  let bestPathLeafL: TreeNode | null = null;
  let bestPathLeafR: TreeNode | null = null;
  let bestPeak: TreeNode | null = null;

  function dfs(node: TreeNode | null): { gain: number; bestLeaf: TreeNode | null } {
    if (!node) return { gain: 0, bestLeaf: null };

    frames.push({ type: "visit", nodeId: node.id });

    const left = dfs(node.left);
    frames.push({ type: "childDone", nodeId: node.id, payload: { side: "left", ...left } });

    const right = dfs(node.right);
    frames.push({ type: "childDone", nodeId: node.id, payload: { side: "right", ...right } });

    const leftGain = Math.max(0, left.gain);
    const rightGain = Math.max(0, right.gain);
    const maxThroughNode = node.val + leftGain + rightGain;

    frames.push({
      type: "compute",
      nodeId: node.id,
      payload: { leftGain, rightGain, maxThroughNode, nodeVal: node.val },
    });

    if (maxThroughNode > globalMax) {
      globalMax = maxThroughNode;
      // capture pointer to reconstruct later: the leaves that gave these gains (only if gain > 0)
      bestPeak = node;
      bestPathLeafL = leftGain > 0 ? left.bestLeaf : null;
      bestPathLeafR = rightGain > 0 ? right.bestLeaf : null;
      frames.push({ type: "updateGlobal", nodeId: node.id, payload: { globalMax } });
    }

    // Return to parent: node.val + max(leftGain, rightGain)
    const chooseLeft = leftGain >= rightGain;
    const chosenGain = node.val + (chooseLeft ? leftGain : rightGain);
    const chosenLeaf = (chooseLeft && leftGain > 0 ? left.bestLeaf : rightGain > 0 ? right.bestLeaf : null) || node;

    frames.push({ type: "return", nodeId: node.id, payload: { returnGain: chosenGain } });

    // bestLeaf: where this chain ends if we keep extending downward
    return { gain: chosenGain, bestLeaf: chosenLeaf };
  }

  // To compute bestLeaf correctly, leaf of a single-node chain should be itself
  function seedLeaves(n: TreeNode | null) {
    if (!n) return;
    seedLeaves(n.left);
    seedLeaves(n.right);
    // Set default bestLeaf to itself
    (n as any).__seed = true; // marker
  }

  seedLeaves(root);

  // Override dfs to use seeded leaves where needed
  function dfsWithLeaves(node: TreeNode | null): { gain: number; bestLeaf: TreeNode | null } {
    if (!node) return { gain: 0, bestLeaf: null };
    frames.push({ type: "visit", nodeId: node.id });

    const left = dfsWithLeaves(node.left);
    frames.push({ type: "childDone", nodeId: node.id, payload: { side: "left", ...left } });

    const right = dfsWithLeaves(node.right);
    frames.push({ type: "childDone", nodeId: node.id, payload: { side: "right", ...right } });

    const leftGain = Math.max(0, left.gain);
    const rightGain = Math.max(0, right.gain);
    const maxThroughNode = node.val + leftGain + rightGain;

    frames.push({
      type: "compute",
      nodeId: node.id,
      payload: { leftGain, rightGain, maxThroughNode, nodeVal: node.val },
    });

    if (maxThroughNode > globalMax) {
      globalMax = maxThroughNode;
      bestPeak = node;
      bestPathLeafL = leftGain > 0 ? (left.bestLeaf || node.left) : null;
      bestPathLeafR = rightGain > 0 ? (right.bestLeaf || node.right) : null;
      frames.push({ type: "updateGlobal", nodeId: node.id, payload: { globalMax } });
    }

    const chooseLeft = leftGain >= rightGain;
    const chosenGain = node.val + (chooseLeft ? leftGain : rightGain);
    const chosenLeaf = (chooseLeft && leftGain > 0 ? left.bestLeaf || node.left : right.bestLeaf || node.right) || node;

    frames.push({ type: "return", nodeId: node.id, payload: { returnGain: chosenGain } });

    return { gain: chosenGain, bestLeaf: chosenLeaf };
  }

  dfsWithLeaves(root);

  // Reconstruct final best path from bestPeak through bestPathLeafL and bestPathLeafR
  const bestIds: number[] = [];
  if (bestPeak && root) {
    const peak: TreeNode = bestPeak; // Type assertion for narrowing
    const parents = buildParentMap(root);
    
    // gather path from left leaf -> peak
    const leftChain: TreeNode[] = pathUp(peak, bestPathLeafL, parents);
    const rightChain: TreeNode[] = pathUp(peak, bestPathLeafR, parents);
    
    // leftChain goes from leaf to peak: [leftLeaf, ..., peak]
    // rightChain goes from leaf to peak: [rightLeaf, ..., peak]
    // We want: leftLeaf -> ... -> peak -> ... -> rightLeaf
    // So: leftChain + reverse(rightChain excluding peak)
    
    const leftIds: number[] = leftChain.map((n: TreeNode) => n.id);
    const rightReversed = rightChain.slice(0, -1).reverse(); // exclude peak, then reverse to go from peak to rightLeaf
    const rightIds: number[] = rightReversed.map((n: TreeNode) => n.id);
    
    const combo: number[] = [...leftIds, ...rightIds];
    bestIds.push(...combo);
  }

  frames.push({ type: "finalPath", nodeId: null, payload: { bestIds, globalMax } });

  return { frames, maxSum: globalMax, bestPathNodeIds: bestIds };
}

// Helper to build parent map for entire tree starting from root
function buildParentMap(root: TreeNode | null): Map<number, TreeNode | null> {
  const parents = new Map<number, TreeNode | null>();
  function setParents(n: TreeNode | null, p: TreeNode | null) {
    if (!n) return;
    parents.set(n.id, p);
    setParents(n.left, n);
    setParents(n.right, n);
  }
  setParents(root, null);
  return parents;
}

// Helper to find path from leaf up to target node
function pathUp(target: TreeNode, leaf: TreeNode | null, parents: Map<number, TreeNode | null>): TreeNode[] {
  if (!leaf) return [target];
  
  // Climb from leaf up to target
  const path: TreeNode[] = [];
  let current: TreeNode | null = leaf;
  
  while (current) {
    path.push(current);
    if (current.id === target.id) break;
    const parent = parents.get(current.id);
    current = parent || null;
  }
  
  return path;
}

// ----------------------------- Rendering Helpers

function NodeCircle({
  node,
  radius = 20,
  label,
  isActive,
  isOnBestPath,
  faded,
}: {
  node: TreeNode;
  radius?: number;
  label?: string;
  isActive?: boolean;
  isOnBestPath?: boolean;
  faded?: boolean;
}) {
  const stroke = isOnBestPath ? 4 : 2;
  const opacity = faded ? 0.35 : 1;
  return (
    <g transform={`translate(${node.x}, ${node.y})`}>
      <circle
        r={radius}
        className={`fill-white stroke-2 ${isOnBestPath ? "stroke-emerald-600" : "stroke-slate-400"}`}
        style={{ strokeWidth: stroke, opacity }}
      />
      <text textAnchor="middle" dominantBaseline="middle" className={`text-sm ${isActive ? "font-bold" : ""}`}>{node.val}</text>
      {label ? (
        <text textAnchor="middle" y={radius + 16} className="text-[10px] fill-slate-600">
          {label}
        </text>
      ) : null}
      {isActive ? (
        <circle r={radius + 6} className="fill-transparent stroke-blue-400 animate-pulse" />
      ) : null}
    </g>
  );
}

function Edge({ from, to, highlight }: { from: TreeNode; to: TreeNode; highlight?: boolean }) {
  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      className={highlight ? "stroke-emerald-500" : "stroke-slate-300"}
      strokeWidth={highlight ? 4 : 2}
    />
  );
}

// Flatten all nodes for iteration
function flatten(root: TreeNode | null): TreeNode[] {
  const out: TreeNode[] = [];
  function dfs(n: TreeNode | null) {
    if (!n) return;
    out.push(n);
    dfs(n.left);
    dfs(n.right);
  }
  dfs(root);
  return out;
}

// Build parent map (for reconstructing exact best path edges)
function parentMap(root: TreeNode | null): Map<number, TreeNode | null> {
  const m = new Map<number, TreeNode | null>();
  function dfs(n: TreeNode | null, p: TreeNode | null) {
    if (!n) return;
    m.set(n.id, p);
    dfs(n.left, n);
    dfs(n.right, n);
  }
  dfs(root, null);
  return m;
}

function collectPathIds(peakId: number, leftLeafId: number | null, rightLeafId: number | null, parents: Map<number, TreeNode | null>): number[] {
  // climb from left leaf to peak
  const leftUp: number[] = [];
  if (leftLeafId) {
    let cur: number | null = leftLeafId;
    while (cur !== null) {
      leftUp.push(cur);
      const p: TreeNode | null = parents.get(cur) || null;
      cur = p ? p.id : null;
      if (cur === peakId) { leftUp.push(cur); break; }
    }
  }
  // climb from right leaf to peak
  const rightUp: number[] = [];
  if (rightLeafId) {
    let cur: number | null = rightLeafId;
    while (cur !== null) {
      rightUp.push(cur);
      const p: TreeNode | null = parents.get(cur) || null;
      cur = p ? p.id : null;
      if (cur === peakId) { rightUp.push(cur); break; }
    }
  }
  // merge: left (excluding peak at end) + peak + right (excluding peak at end) reversed
  const leftPart = leftUp.length ? leftUp.slice(0, -1) : [];
  const rightPart = rightUp.length ? rightUp.slice(0, -1) : [];
  return [...leftPart, peakId, ...rightPart.reverse()];
}

// ----------------------------- Main Component

export default function App() {
  const [arrayText, setArrayText] = useState("[-10,9,20,null,null,15,7]");
  const [root, setRoot] = useState<TreeNode | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(650);
  const [globalMax, setGlobalMax] = useState<number | null>(null);
  const [bestIds, setBestIds] = useState<number[]>([]);

  // Store layout size
  const size = useMemo(() => assignLayout(root), [root]);
  const allNodes = useMemo(() => flatten(root), [root]);
  const pmap = useMemo(() => parentMap(root), [root]);

  // Active highlights derived from current frame
  const activeNodeId = frames[frameIndex]?.nodeId ?? null;
  const current = frames[frameIndex];

  // Animation loop
  useEffect(() => {
    if (!playing) return;
    if (!frames.length) return;
    const id = setTimeout(() => {
      setFrameIndex((i) => {
        const next = i + 1;
        if (next >= frames.length) return i; // stop at end
        return next;
      });
    }, Math.max(60, speedMs));
    return () => clearTimeout(id);
  }, [playing, frames, speedMs, frameIndex]);

  // React to frame side effects
  useEffect(() => {
    const fr = frames[frameIndex];
    if (!fr) return;
    if (fr.type === "updateGlobal") {
      setGlobalMax(fr.payload.globalMax);
    }
    if (fr.type === "finalPath") {
      setBestIds(fr.payload.bestIds || []);
      setGlobalMax(fr.payload.globalMax ?? null);
    }
  }, [frames, frameIndex]);

  function onBuild() {
    try {
      const arr = parseArray(arrayText);
      const t = buildTree(arr);
      if (!t) {
        setRoot(null);
        setFrames([]);
        setFrameIndex(0);
        setPlaying(false);
        setGlobalMax(null);
        setBestIds([]);
        return;
      }
      assignLayout(t);
      const solved = solveWithFrames(t);
      setRoot(t);
      setFrames(solved.frames);
      setFrameIndex(0);
      setPlaying(false);
      setGlobalMax(null);
      setBestIds([]);
    } catch (e) {
      alert("Invalid input. Use an array like [1,2,3,null,4]");
    }
  }

  function onStart() {
    if (!frames.length) return;
    setPlaying(true);
  }
  function onPause() {
    setPlaying(false);
  }
  function onStep() {
    setPlaying(false);
    setFrameIndex((i) => Math.min(i + 1, frames.length - 1));
  }
  function onBack() {
    setPlaying(false);
    setFrameIndex((i) => Math.max(i - 1, 0));
  }
  function onReset() {
    setPlaying(false);
    setFrameIndex(0);
    setGlobalMax(null);
    setBestIds([]);
  }

  function setExample(ex: number) {
    const samples: Record<number, string> = {
      1: "[1,2,3]",
      2: "[-10,9,20,null,null,15,7]",
      3: "[2,-1]",
      4: "[9,6,-3,null,null,-6,2,null,null,2,null,-6,-6,-6]",
      5: "[-10,9,20,null,null,15,7,8,9,12,121,1,1221,21,21,2,121,21,21,33,99,100,200,150,170,42,111,311,411,511,611]",
    };
    setArrayText(samples[ex]);
  }

  // Determine best path highlight using the frame payload (finalPath) if available; otherwise empty
  const bestSet = new Set(bestIds);

  // Compute edge highlight for best path
  function isEdgeOnBest(a: TreeNode, b: TreeNode): boolean {
    return bestSet.has(a.id) && bestSet.has(b.id);
  }

  // Frame details text
  const infoText = useMemo(() => {
    if (!current) return "";
    const t = current.type;
    if (t === "visit") return `Visit node`;
    if (t === "childDone") return `Child processed (${current.payload.side})`;
    if (t === "compute")
      return `Compute: leftGain=${current.payload.leftGain}, rightGain=${current.payload.rightGain}, through=${current.payload.maxThroughNode}`;
    if (t === "updateGlobal") return `Update globalMax → ${current.payload.globalMax}`;
    if (t === "return") return `Return gain to parent: ${current.payload.returnGain}`;
    if (t === "finalPath") return `Done. Best sum = ${current.payload.globalMax}`;
    return "";
  }, [current]);

  // Canvas size
  const W = size.width;
  const H = size.height;

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Binary Tree Maximum Path Sum – Visualizer</h1>
        <p className="text-sm text-slate-600 mb-4">LeetCode 124 • DFS with gains • Visualize recursion, compute steps, and the final maximum path.</p>

        <div className="grid md:grid-cols-3 gap-3 md:gap-4 items-end mb-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1">LeetCode array (level-order with nulls)</label>
            <input
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={arrayText}
              onChange={(e) => setArrayText(e.target.value)}
              placeholder="[-10,9,20,null,null,15,7]"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800" onClick={onBuild}>Build Tree</button>
            <button className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300" onClick={() => setExample(2)}>Example</button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <button className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500" onClick={onStart} disabled={!frames.length || playing}>Start</button>
          <button className="px-4 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-400" onClick={onPause} disabled={!frames.length || !playing}>Pause</button>
          <button className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300" onClick={onBack} disabled={!frames.length}>◀︎ Back</button>
          <button className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300" onClick={onStep} disabled={!frames.length}>Step ▶︎</button>
          <button className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300" onClick={onReset} disabled={!frames.length}>Reset</button>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-xs">Speed</span>
            <input type="range" min={80} max={1200} value={speedMs} onChange={(e) => setSpeedMs(Number(e.target.value))} />
          </div>
          <div className="ml-auto text-sm font-semibold">{globalMax !== null ? `Best Sum: ${globalMax}` : "Best Sum: –"}</div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 items-center text-xs text-slate-700 mb-3">
          <div className="flex items-center gap-2"><span className="w-3 h-3 inline-block rounded-full bg-blue-400 animate-pulse"/> Active node</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 inline-block rounded-full bg-emerald-500"/> Best path edge</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 inline-block rounded-full bg-slate-300"/> Normal edge</div>
        </div>

        {/* SVG Tree Area */}
        <div className="w-full overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <svg width={W} height={H} className="block mx-auto">
            {/* Edges */}
            {root && (
              <EdgesSVG root={root} bestSet={bestSet} />
            )}
            {/* Nodes */}
            {allNodes.map((n) => (
              <NodeCircle
                key={n.id}
                node={n}
                isActive={activeNodeId === n.id}
                isOnBestPath={bestSet.has(n.id)}
              />
            ))}
          </svg>
        </div>

        {/* Frame info */}
        <div className="mt-4 p-3 rounded-xl bg-slate-100 border border-slate-200 text-sm">
          <div className="font-semibold mb-1">Step: {frames.length ? `${frameIndex + 1}/${frames.length}` : "–"}</div>
          <div className="text-slate-700">{infoText || "Click Build Tree, then Start or Step."}</div>
        </div>

        {/* Quick examples */}
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <button className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300" onClick={() => setExample(1)}>[1,2,3]</button>
          <button className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300" onClick={() => setExample(2)}>[ -10, 9, 20, null, null, 15, 7 ]</button>
          <button className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300" onClick={() => setExample(3)}>[ 2, -1 ]</button>
          <button className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300" onClick={() => setExample(4)}>[ 9, 6, -3, null, null, -6, 2, null, null, 2, null, -6, -6, -6 ]</button>
          <button className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300" onClick={() => setExample(5)}>Large Tree (31 nodes)</button>
        </div>

        <div className="mt-6 text-xs text-slate-500 leading-relaxed">
          <p><span className="font-semibold">How it works:</span> at each node we compute left/right gains (negatives clamped to 0), consider a local path passing through the node (left + node + right), update the global maximum if that local path is better, and return a single-branch gain (node + max(left, right)) to the parent.</p>
        </div>
      </div>
    </div>
  );
}

function EdgesSVG({ root, bestSet }: { root: TreeNode | null; bestSet: Set<number> }) {
  const edges: Array<{ a: TreeNode; b: TreeNode; onBest: boolean }> = [];
  function dfs(n: TreeNode | null) {
    if (!n) return;
    if (n.left) edges.push({ a: n, b: n.left, onBest: bestSet.has(n.id) && bestSet.has(n.left.id) });
    if (n.right) edges.push({ a: n, b: n.right, onBest: bestSet.has(n.id) && bestSet.has(n.right.id) });
    dfs(n.left);
    dfs(n.right);
  }
  dfs(root);
  return (
    <g>
      {edges.map((e, i) => (
        <Edge key={i} from={e.a} to={e.b} highlight={e.onBest} />
      ))}
    </g>
  );
}
