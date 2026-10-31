import React, { useState } from 'react';
import { sounds } from '../../../utils/audio';

interface PatternTemplate {
  name: string;
  signature: string;
  timeComplexity: string;
  spaceComplexity: string;
  hint1: string;
  hint2: string;
  blueprint: string;
}

const CANONICAL_PATTERNS: PatternTemplate[] = [
  {
    name: 'SLIDING WINDOW (DYNAMIC)',
    signature: 'Continuous subarray or substring problem asking for min/max length or target sum.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(K) where K is unique character count',
    hint1: 'Expand right pointer while condition holds. Contract left pointer as soon as constraint is violated.',
    hint2: 'Watch out for frequency hash map state updates during contraction.',
    blueprint: `int left = 0;
for (int right = 0; right < n; right++) {
    state.add(nums[right]);
    while (isInvalid(state)) {
        state.remove(nums[left++]);
    }
    ans = max(ans, right - left + 1);
}`,
  },
  {
    name: 'TWO POINTERS (OPPOSITE ENDS)',
    signature: 'Sorted array requiring pairs, triplets, or container boundary water trapping.',
    timeComplexity: 'O(N) or O(N log N) with sorting',
    spaceComplexity: 'O(1)',
    hint1: 'Place left at index 0 and right at index n - 1. Move the pointer that definitely cannot contribute to a better solution.',
    hint2: 'In 3Sum or N-Sum, remember to skip identical duplicate elements to prevent duplicate tuples.',
    blueprint: `int left = 0, right = nums.length - 1;
while (left < right) {
    int sum = nums[left] + nums[right];
    if (sum == target) return {left, right};
    else if (sum < target) left++;
    else right--;
}`,
  },
  {
    name: 'MONOTONIC STACK',
    signature: 'Next Greater Element, Previous Greater Element, or Largest Rectangle in Histogram.',
    timeComplexity: 'O(N) - each element pushed & popped at most once',
    spaceComplexity: 'O(N)',
    hint1: 'Maintain indices in stack with strictly increasing or decreasing values.',
    hint2: 'When current element violates monotonic property, elements popped from stack find their answer.',
    blueprint: `stack<int> st; // stores indices
for (int i = 0; i < n; i++) {
    while (!st.empty() && nums[i] > nums[st.top()]) {
        int idx = st.top(); st.pop();
        nextGreater[idx] = nums[i];
    }
    st.push(i);
}`,
  },
  {
    name: 'BINARY SEARCH ON ANSWER SPACE',
    signature: 'Optimization problem asking "min capacity", "max distance", or monotonic boolean predicate.',
    timeComplexity: 'O(N * log(Range))',
    spaceComplexity: 'O(1)',
    hint1: 'If a value K is feasible, all values > K (or < K) are also feasible. Search the monotonic boundary.',
    hint2: 'Define a boolean isValid(mid) helper function, then standard binary search on [low, high].',
    blueprint: `long low = minVal, high = maxVal, ans = high;
while (low <= high) {
    long mid = low + (high - low) / 2;
    if (canFeasible(mid)) {
        ans = mid;
        high = mid - 1; // seek smaller valid
    } else {
        low = mid + 1;
    }
}`,
  },
  {
    name: 'TOPOLOGICAL SORT (KAHN / BFS)',
    signature: 'Course schedule, build dependency order, task scheduling with prerequisite graphs.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    hint1: 'Calculate in-degree for all vertices. Push all vertices with in-degree == 0 to a queue.',
    hint2: 'If processed node count < total vertices, a cycle exists (deadlock).',
    blueprint: `queue<int> q;
for (int i = 0; i < n; i++) if (inDegree[i] == 0) q.push(i);
while (!q.empty()) {
    int curr = q.front(); q.pop();
    topoOrder.push_back(curr);
    for (int next : adj[curr]) {
        if (--inDegree[next] == 0) q.push(next);
    }
}`,
  },
];

interface OracleWindowProps {
  onLog: (msg: string, type?: 'ok' | 'warn' | 'dim') => void;
}

export const OracleWindow: React.FC<OracleWindowProps> = ({ onLog }) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [showBlueprint, setShowBlueprint] = useState<boolean>(false);
  const current = CANONICAL_PATTERNS[selectedIdx];

  const handleSelect = (idx: number) => {
    setSelectedIdx(idx);
    setShowBlueprint(false);
    sounds.playTickSound();
    onLog(`oracle: consulted pattern [${CANONICAL_PATTERNS[idx].name}]`, 'dim');
  };

  return (
    <div className="wbody" style={{ width: 560, maxWidth: '90vw' }}>
      {/* Pattern selector tabs */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
        {CANONICAL_PATTERNS.map((p, idx) => (
          <button
            key={p.name}
            className={`k small ${selectedIdx === idx ? '' : 'ghost'}`}
            onClick={() => handleSelect(idx)}
            style={{ fontSize: 10, padding: '2px 6px' }}
          >
            {p.name.split(' (')[0]}
          </button>
        ))}
      </div>

      {/* Pattern Details */}
      <div style={{ border: '1px solid var(--fg)', padding: 12, background: 'rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
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

        <div style={{ marginTop: 10 }}>
          <button
            className="k small"
            onClick={() => {
              setShowBlueprint(!showBlueprint);
              sounds.playTickSound();
            }}
          >
            {showBlueprint ? 'HIDE BLUEPRINT' : 'REVEAL PATTERN SKELETON'}
          </button>
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
            {current.blueprint}
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
