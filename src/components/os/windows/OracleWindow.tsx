import React, { useState, useMemo } from 'react';
import { sounds } from '../../../utils/audio';

interface PatternTemplate {
  name: string;
  category: string;
  signature: string;
  timeComplexity: string;
  spaceComplexity: string;
  hint1: string;
  hint2: string;
  blueprints: {
    cpp: string;
    python: string;
    java: string;
  };
}

const CANONICAL_PATTERNS: PatternTemplate[] = [
  {
    name: 'SLIDING WINDOW (DYNAMIC)',
    category: 'ARRAYS',
    signature: 'Continuous subarray or substring problem asking for min/max length or target sum.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(K) where K is unique character count',
    hint1: 'Expand right pointer while condition holds. Contract left pointer as soon as constraint is violated.',
    hint2: 'Watch out for frequency hash map state updates during contraction.',
    blueprints: {
      cpp: `int left = 0, ans = 0;
for (int right = 0; right < n; right++) {
    state.add(nums[right]);
    while (isInvalid(state)) {
        state.remove(nums[left++]);
    }
    ans = max(ans, right - left + 1);
}`,
      python: `left = 0
ans = 0
for right in range(len(nums)):
    state[nums[right]] += 1
    while is_invalid(state):
        state[nums[left]] -= 1
        left += 1
    ans = max(ans, right - left + 1)`,
      java: `int left = 0, ans = 0;
for (int right = 0; right < nums.length; right++) {
    state.put(nums[right], state.getOrDefault(nums[right], 0) + 1);
    while (isInvalid(state)) {
        state.put(nums[left], state.get(nums[left]) - 1);
        left++;
    }
    ans = Math.max(ans, right - left + 1);
}`
    }
  },
  {
    name: 'TWO POINTERS (OPPOSITE ENDS)',
    category: 'ARRAYS',
    signature: 'Sorted array requiring pairs, triplets, or container boundary water trapping.',
    timeComplexity: 'O(N) or O(N log N) with sorting',
    spaceComplexity: 'O(1)',
    hint1: 'Place left at index 0 and right at index n - 1. Move the pointer that definitely cannot contribute to a better solution.',
    hint2: 'In 3Sum or N-Sum, remember to skip identical duplicate elements to prevent duplicate tuples.',
    blueprints: {
      cpp: `int left = 0, right = nums.size() - 1;
while (left < right) {
    int sum = nums[left] + nums[right];
    if (sum == target) return {left, right};
    else if (sum < target) left++;
    else right--;
}`,
      python: `left, right = 0, len(nums) - 1
while left < right:
    s = nums[left] + nums[right]
    if s == target: return [left, right]
    elif s < target: left += 1
    else: right -= 1`,
      java: `int left = 0, right = nums.length - 1;
while (left < right) {
    int sum = nums[left] + nums[right];
    if (sum == target) return new int[]{left, right};
    else if (sum < target) left++;
    else right--;
}`
    }
  },
  {
    name: 'FAST & SLOW POINTERS (CYCLE FINDING)',
    category: 'LINKED LIST',
    signature: 'Detecting cycles in linked lists, middle of linked list, or Floyd\'s cycle detection.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    hint1: 'Advance slow by 1 step, fast by 2 steps. If they meet, a cycle exists.',
    hint2: 'To find cycle entry point, reset slow to head after meeting, advance both by 1 step until they collide.',
    blueprints: {
      cpp: `ListNode *slow = head, *fast = head;
while (fast && fast->next) {
    slow = slow->next;
    fast = fast->next->next;
    if (slow == fast) return true; // Cycle detected
}`,
      python: `slow = fast = head
while fast and fast.next:
    slow = slow.next
    fast = fast.next.next
    if slow == fast:
        return True`,
      java: `ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow == fast) return true;
}`
    }
  },
  {
    name: 'MONOTONIC STACK',
    category: 'STACK',
    signature: 'Next Greater Element, Previous Greater Element, or Largest Rectangle in Histogram.',
    timeComplexity: 'O(N) - each element pushed & popped at most once',
    spaceComplexity: 'O(N)',
    hint1: 'Maintain indices in stack with strictly increasing or decreasing values.',
    hint2: 'When current element violates monotonic property, elements popped from stack find their answer.',
    blueprints: {
      cpp: `stack<int> st; // stores indices
for (int i = 0; i < n; i++) {
    while (!st.empty() && nums[i] > nums[st.top()]) {
        int idx = st.top(); st.pop();
        nextGreater[idx] = nums[i];
    }
    st.push(i);
}`,
      python: `st = [] # indices
for i in range(len(nums)):
    while st and nums[i] > nums[st[-1]]:
        idx = st.pop()
        next_greater[idx] = nums[i]
    st.append(i)`,
      java: `Deque<Integer> st = new ArrayDeque<>();
for (int i = 0; i < n; i++) {
    while (!st.isEmpty() && nums[i] > nums[st.peek()]) {
        int idx = st.pop();
        nextGreater[idx] = nums[i];
    }
    st.push(i);
}`
    }
  },
  {
    name: 'BINARY SEARCH ON ANSWER SPACE',
    category: 'BINARY SEARCH',
    signature: 'Optimization problem asking "min capacity", "max distance", or monotonic boolean predicate.',
    timeComplexity: 'O(N * log(Range))',
    spaceComplexity: 'O(1)',
    hint1: 'If a value K is feasible, all values > K (or < K) are also feasible. Search the monotonic boundary.',
    hint2: 'Define a boolean isValid(mid) helper function, then standard binary search on [low, high].',
    blueprints: {
      cpp: `long low = minVal, high = maxVal, ans = high;
while (low <= high) {
    long mid = low + (high - low) / 2;
    if (canFeasible(mid)) {
        ans = mid;
        high = mid - 1; // seek smaller valid
    } else {
        low = mid + 1;
    }
}`,
      python: `low, high = min_val, max_val
ans = high
while low <= high:
    mid = (low + high) // 2
    if can_feasible(mid):
        ans = mid
        high = mid - 1
    else:
        low = mid + 1`,
      java: `long low = minVal, high = maxVal, ans = high;
while (low <= high) {
    long mid = low + (high - low) / 2;
    if (canFeasible(mid)) {
        ans = mid;
        high = mid - 1;
    } else {
        low = mid + 1;
    }
}`
    }
  },
  {
    name: 'TOPOLOGICAL SORT (KAHN / BFS)',
    category: 'GRAPHS',
    signature: 'Course schedule, build dependency order, task scheduling with prerequisite graphs.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    hint1: 'Calculate in-degree for all vertices. Push all vertices with in-degree == 0 to a queue.',
    hint2: 'If processed node count < total vertices, a cycle exists (deadlock).',
    blueprints: {
      cpp: `queue<int> q;
for (int i = 0; i < n; i++) if (inDegree[i] == 0) q.push(i);
while (!q.empty()) {
    int curr = q.front(); q.pop();
    topoOrder.push_back(curr);
    for (int next : adj[curr]) {
        if (--inDegree[next] == 0) q.push(next);
    }
}`,
      python: `q = deque([i for i in range(n) if in_degree[i] == 0])
topo = []
while q:
    curr = q.popleft()
    topo.append(curr)
    for nxt in adj[curr]:
        in_degree[nxt] -= 1
        if in_degree[nxt] == 0:
            q.append(nxt)`,
      java: `Queue<Integer> q = new LinkedList<>();
for (int i = 0; i < n; i++) if (inDegree[i] == 0) q.offer(i);
while (!q.isEmpty()) {
    int curr = q.poll();
    topoOrder.add(curr);
    for (int next : adj.get(curr)) {
        if (--inDegree[next] == 0) q.offer(next);
    }
}`
    }
  },
  {
    name: 'DYNAMIC PROGRAMMING (0/1 KNAPSACK & SUBSETS)',
    category: 'DP',
    signature: 'Pick or skip each item with a capacity/target constraint without repetition.',
    timeComplexity: 'O(N * W)',
    spaceComplexity: 'O(W) with 1D reverse sweep',
    hint1: 'dp[w] represents whether target sum w is achievable with a subset of items.',
    hint2: 'In 1D space optimization, ALWAYS sweep the inner capacity loop backwards to avoid reusing the same item.',
    blueprints: {
      cpp: `vector<int> dp(target + 1, 0);
dp[0] = 1;
for (int num : nums) {
    for (int j = target; j >= num; j--) {
        dp[j] = dp[j] || dp[j - num];
    }
}`,
      python: `dp = [True] + [False] * target
for num in nums:
    for j in range(target, num - 1, -1):
        dp[j] = dp[j] or dp[j - num]`,
      java: `boolean[] dp = new boolean[target + 1];
dp[0] = true;
for (int num : nums) {
    for (int j = target; j >= num; j--) {
        dp[j] = dp[j] || dp[j - num];
    }
}`
    }
  },
  {
    name: 'BINARY TREE LEVEL-ORDER (BFS)',
    category: 'TREES',
    signature: 'Zigzag traversal, Right side view, Minimum depth, or level-by-level processing.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(W) where W is max tree width',
    hint1: 'Queue size at the start of each while loop iteration snapshot exactly one tree level.',
    hint2: 'Process all nodes in the current snapshot before moving to the next level.',
    blueprints: {
      cpp: `queue<TreeNode*> q;
if (root) q.push(root);
while (!q.empty()) {
    int sz = q.size();
    vector<int> level;
    for (int i = 0; i < sz; i++) {
        TreeNode* curr = q.front(); q.pop();
        level.push_back(curr->val);
        if (curr->left) q.push(curr->left);
        if (curr->right) q.push(curr->right);
    }
    levels.push_back(level);
}`,
      python: `q = deque([root]) if root else deque()
levels = []
while q:
    sz = len(q)
    level = []
    for _ in range(sz):
        curr = q.popleft()
        level.append(curr.val)
        if curr.left: q.append(curr.left)
        if curr.right: q.append(curr.right)
    levels.append(level)`,
      java: `Queue<TreeNode> q = new LinkedList<>();
if (root != null) q.offer(root);
while (!q.isEmpty()) {
    int sz = q.size();
    List<Integer> level = new ArrayList<>();
    for (int i = 0; i < sz; i++) {
        TreeNode curr = q.poll();
        level.add(curr.val);
        if (curr.left != null) q.offer(curr.left);
        if (curr.right != null) q.offer(curr.right);
    }
    levels.add(level);
}`
    }
  },
  {
    name: 'GRAPH SHORTEST PATH (DIJKSTRA)',
    category: 'GRAPHS',
    signature: 'Shortest path in non-negatively weighted directed or undirected graphs (Network delay, cheap flights).',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V + E)',
    hint1: 'Use a min-heap storing {distance, node}. Initialize dist array to infinity.',
    hint2: 'Skip popped pairs if popped dist > current best known dist[node] (lazy deletion).',
    blueprints: {
      cpp: `priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
vector<int> dist(n, 1e9);
dist[src] = 0;
pq.push({0, src});
while (!pq.empty()) {
    auto [d, u] = pq.top(); pq.pop();
    if (d > dist[u]) continue;
    for (auto [v, w] : adj[u]) {
        if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            pq.push({dist[v], v});
        }
    }
}`,
      python: `pq = [(0, src)]
dist = {i: float('inf') for i in range(n)}
dist[src] = 0
while pq:
    d, u = heapq.heappop(pq)
    if d > dist[u]: continue
    for v, w in adj[u]:
        if dist[u] + w < dist[v]:
            dist[v] = dist[u] + w
            heapq.heappush(pq, (dist[v], v))`,
      java: `PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));
int[] dist = new int[n];
Arrays.fill(dist, Integer.MAX_VALUE);
dist[src] = 0;
pq.offer(new int[]{0, src});
while (!pq.isEmpty()) {
    int[] curr = pq.poll();
    int d = curr[0], u = curr[1];
    if (d > dist[u]) continue;
    for (int[] edge : adj.get(u)) {
        int v = edge[0], w = edge[1];
        if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            pq.offer(new int[]{dist[v], v});
        }
    }
}`
    }
  },
  {
    name: 'DISJOINT SET UNION (UNION-FIND)',
    category: 'GRAPHS',
    signature: 'Connected components, Redundant connection detection, Kruskal\'s MST, Accounts merge.',
    timeComplexity: 'O(α(N)) ≈ O(1) per operation',
    spaceComplexity: 'O(N)',
    hint1: 'Path compression flattens tree on find(): parent[i] = find(parent[i]).',
    hint2: 'Union by rank attaches shorter tree under taller tree to keep tree shallow.',
    blueprints: {
      cpp: `int find(int i) {
    if (parent[i] == i) return i;
    return parent[i] = find(parent[i]); // Path compression
}
bool unite(int i, int j) {
    int rootI = find(i), rootJ = find(j);
    if (rootI == rootJ) return false;
    if (rank[rootI] < rank[rootJ]) parent[rootI] = rootJ;
    else if (rank[rootI] > rank[rootJ]) parent[rootJ] = rootI;
    else { parent[rootJ] = rootI; rank[rootI]++; }
    return true;
}`,
      python: `def find(i):
    if parent[i] == i: return i
    parent[i] = find(parent[i])
    return parent[i]

def union(i, j):
    root_i, root_j = find(i), find(j)
    if root_i == root_j: return False
    parent[root_i] = root_j
    return True`,
      java: `int find(int i) {
    if (parent[i] == i) return i;
    return parent[i] = find(parent[i]);
}
boolean union(int i, int j) {
    int rootI = find(i), rootJ = find(j);
    if (rootI == rootJ) return false;
    parent[rootI] = rootJ;
    return true;
}`
    }
  },
  {
    name: 'BACKTRACKING (SUBSETS & PERMUTATIONS)',
    category: 'RECURSION',
    signature: 'Combinations, Permutations, Sudoku solver, Word search, generating all valid states.',
    timeComplexity: 'O(2^N) or O(N!)',
    spaceComplexity: 'O(N) recursion stack',
    hint1: 'Three steps: Choose -> Explore (recurse) -> Unchoose (backtrack state).',
    hint2: 'In combinations / subsets without duplicates, pass start index (i + 1) to avoid re-generating permutations.',
    blueprints: {
      cpp: `void backtrack(int start, vector<int>& path) {
    res.push_back(path);
    for (int i = start; i < nums.size(); i++) {
        path.push_back(nums[i]);
        backtrack(i + 1, path);
        path.pop_back(); // Backtrack
    }
}`,
      python: `def backtrack(start, path):
    res.append(list(path))
    for i in range(start, len(nums)):
        path.append(nums[i])
        backtrack(i + 1, path)
        path.pop()`,
      java: `void backtrack(int start, List<Integer> path) {
    res.add(new ArrayList<>(path));
    for (int i = start; i < nums.length; i++) {
        path.add(nums[i]);
        backtrack(i + 1, path);
        path.remove(path.size() - 1);
    }
}`
    }
  },
  {
    name: 'MERGE INTERVALS (SORT + SWEEP)',
    category: 'INTERVALS',
    signature: 'Overlapping calendar bookings, meeting rooms, interval intersections, non-overlapping intervals.',
    timeComplexity: 'O(N log N)',
    spaceComplexity: 'O(N)',
    hint1: 'Sort intervals primarily by start time.',
    hint2: 'If curr.start <= prev.end, merge by setting prev.end = max(prev.end, curr.end). Otherwise, append new interval.',
    blueprints: {
      cpp: `sort(intervals.begin(), intervals.end());
vector<vector<int>> merged = {intervals[0]};
for (int i = 1; i < intervals.size(); i++) {
    if (intervals[i][0] <= merged.back()[1]) {
        merged.back()[1] = max(merged.back()[1], intervals[i][1]);
    } else {
        merged.push_back(intervals[i]);
    }
}`,
      python: `intervals.sort(key=lambda x: x[0])
merged = [intervals[0]]
for start, end in intervals[1:]:
    if start <= merged[-1][1]:
        merged[-1][1] = max(merged[-1][1], end)
    else:
        merged.append([start, end])`,
      java: `Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
List<int[]> merged = new ArrayList<>();
merged.add(intervals[0]);
for (int i = 1; i < intervals.length; i++) {
    int[] last = merged.get(merged.size() - 1);
    if (intervals[i][0] <= last[1]) {
        last[1] = Math.max(last[1], intervals[i][1]);
    } else {
        merged.add(intervals[i]);
    }
}`
    }
  }
];

interface OracleWindowProps {
  onLog: (msg: string, type?: 'ok' | 'warn' | 'dim') => void;
}

export const OracleWindow: React.FC<OracleWindowProps> = ({ onLog }) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [showBlueprint, setShowBlueprint] = useState<boolean>(false);
  const [lang, setLang] = useState<'cpp' | 'python' | 'java'>('cpp');
  const [query, setQuery] = useState<string>('');

  const filteredPatterns = useMemo(() => {
    if (!query.trim()) return CANONICAL_PATTERNS;
    const q = query.toLowerCase();
    return CANONICAL_PATTERNS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.signature.toLowerCase().includes(q)
    );
  }, [query]);

  const current = filteredPatterns[selectedIdx] || filteredPatterns[0] || CANONICAL_PATTERNS[0];

  const handleSelect = (idx: number) => {
    setSelectedIdx(idx);
    setShowBlueprint(false);
    sounds.playTickSound();
    onLog(`oracle: consulted pattern [${filteredPatterns[idx]?.name || 'UNKNOWN'}]`, 'dim');
  };

  return (
    <div className="wbody" style={{ width: 580, maxWidth: '90vw' }}>
      {/* Search Input */}
      <div style={{ marginBottom: 8 }}>
        <input
          type="text"
          className="retro-input"
          placeholder="SEARCH 12 PATTERNS (e.g. DP, Dijkstra, Trees, Intervals)..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIdx(0);
          }}
        />
      </div>

      {/* Pattern selector tabs */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10, maxHeight: '18vh', overflowY: 'auto' }}>
        {filteredPatterns.map((p, idx) => (
          <button
            key={p.name}
            className={`k small ${selectedIdx === idx ? '' : 'ghost'}`}
            onClick={() => handleSelect(idx)}
            style={{ fontSize: 9, padding: '2px 6px', margin: 0 }}
          >
            {p.name.split(' (')[0]}
          </button>
        ))}
      </div>

      {/* Pattern Details */}
      <div style={{ border: '1px solid var(--fg)', padding: 12, background: 'rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 6 }}>
          <h4 style={{ color: 'var(--fg)', margin: 0 }}>▸ {current.name}</h4>
          <span style={{ fontSize: 10, color: 'var(--amb)' }}>
            TIME: {current.timeComplexity} · SPACE: {current.spaceComplexity}
          </span>
        </div>

        <div style={{ fontSize: 11, color: 'var(--fg)', marginTop: 8 }}>
          <b>SIGNATURE:</b> {current.signature}
        </div>

        <hr />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
          <div>
            <b style={{ color: 'var(--amb)' }}>[HINT 1 MENTAL MODEL]</b> {current.hint1}
          </div>
          <div>
            <b style={{ color: 'var(--red)' }}>[HINT 2 INVARIANT / TRAPS]</b> {current.hint2}
          </div>
        </div>

        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            className="k small"
            onClick={() => {
              setShowBlueprint(!showBlueprint);
              sounds.playTickSound();
            }}
          >
            {showBlueprint ? 'HIDE BLUEPRINT' : 'REVEAL PATTERN SKELETON'}
          </button>

          {showBlueprint && (
            <div style={{ display: 'flex', gap: 4 }}>
              {(['cpp', 'python', 'java'] as const).map((l) => (
                <button
                  key={l}
                  className={`k small ${lang === l ? '' : 'ghost'}`}
                  style={{ fontSize: 9, padding: '1px 6px', margin: 0 }}
                  onClick={() => {
                    setLang(l);
                    sounds.playTickSound();
                  }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {showBlueprint && (
          <pre
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              lineHeight: 1.6,
              background: '#000',
              border: '1px solid var(--line)',
              padding: 8,
              marginTop: 8,
              color: 'var(--fg)',
              overflowX: 'auto',
            }}
          >
            {current.blueprints[lang]}
          </pre>
        )}
      </div>

      <hr />
      <div className="dimtxt" style={{ fontSize: 10 }}>
        RULE: ABSORB THE MENTAL MODEL. WRITE THE CODE WITH YOUR OWN HANDS. NEVER COPY-PASTE.
      </div>
    </div>
  );
};
