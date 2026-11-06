// GrindOS — Algorithmic Pattern Intuitions
// Connects curriculum topics to core mental models, invariants, and FAANG interview frequencies.

export interface PatternIntuition {
  pattern: string;
  intuition: string;
  interviewFrequency: string; // e.g. '~75% of FAANG rounds'
  keyInvariant: string;
}

export const TOPIC_INTUITIONS: Record<string, PatternIntuition> = {
  // Linear & Hash
  'Arrays Basics': {
    pattern: 'Hash Lookup & Boundary Scan',
    intuition: 'Trades O(N) space for O(1) membership lookups, eliminating nested loops in pair-finding problems.',
    interviewFrequency: '~85% of phone screens',
    keyInvariant: 'Store seen elements in a hash set/map to evaluate target complement in a single forward pass.'
  },
  'Array Manipulation': {
    pattern: 'In-Place Partitioning & Write Pointers',
    intuition: 'Uses slow/fast pointer partitioning to mutate arrays in-place with O(1) auxiliary space.',
    interviewFrequency: '~65% of screen rounds',
    keyInvariant: 'Write pointer tracks destination boundary; read pointer scans elements without overwriting pending data.'
  },
  'Prefix Sums': {
    pattern: 'Range Query Precomputation',
    intuition: 'Computes cumulative sums to answer any subarray sum query in O(1) time instead of O(K).',
    interviewFrequency: '~70% of Tier-1 rounds',
    keyInvariant: 'subarraySum(i, j) = prefix[j + 1] - prefix[i]. Combine with Hashmap to find subarrays matching sum K in O(N).'
  },
  'Array Reversals': {
    pattern: 'Symmetry & Cyclic Shifts',
    intuition: 'Decomposes complex coordinate rotations into elementary 1D array reversals.',
    interviewFrequency: '~50% of technical rounds',
    keyInvariant: 'Reverse the entire array, then reverse segments [0..k-1] and [k..n-1] to achieve cyclic rotation in O(N) time and O(1) space.'
  },

  // Two Pointers & Window
  'Two Pointers Basics': {
    pattern: 'Opposite-End Convergence',
    intuition: 'Shrinks the search space monotonically from opposite ends in sorted arrays.',
    interviewFrequency: '~80% of Tier-1 rounds',
    keyInvariant: 'If sum < target, increment left pointer to increase sum; if sum > target, decrement right pointer.'
  },
  'Advanced Pointers': {
    pattern: 'Multi-Pointer Coordination',
    intuition: 'Fixes one or more outer elements to reduce 3-sum/4-sum problems into convergent two-pointer subproblems.',
    interviewFrequency: '~75% of interview rounds',
    keyInvariant: 'Always sort first to enable directionality and skip identical adjacent values to avoid duplicate combinations.'
  },
  'Sliding Window Basics': {
    pattern: 'Variable & Fixed Window Maintenance',
    intuition: 'Maintains state within an expanding and contracting subsegment, avoiding repeated subproblem evaluation.',
    interviewFrequency: '~85% of FAANG rounds',
    keyInvariant: 'Expand right pointer until condition is met or violated; contract left pointer to restore validity.'
  },
  'Advanced Sliding Window': {
    pattern: 'Auxiliary Monotonic State Window',
    intuition: 'Couples a sliding window with a deque or frequency table to query local extrema in O(1) amortized time.',
    interviewFrequency: '~70% of onsite rounds',
    keyInvariant: 'Elements entering the window maintain monotonic order in the auxiliary deque; expired indices are popped from the front.'
  },

  // Stacks & Linked Lists
  'Stack Fundamentals': {
    pattern: 'LIFO State Preservation',
    intuition: 'Preserves pending state for nested structures, bracket matching, and recursive call unrolling.',
    interviewFrequency: '~75% of phone screens',
    keyInvariant: 'Top of stack always represents the most recent unresolved open context or scope.'
  },
  'Monotonic Stack': {
    pattern: 'Next Greater / Lesser Element Scan',
    intuition: 'Maintains strictly increasing or decreasing elements to resolve nearest larger/smaller neighbors in O(N).',
    interviewFrequency: '~80% of Tier-1 onsites',
    keyInvariant: 'Pop elements from the stack that violate the monotonic invariant when a new element arrives.'
  },
  'Linked List Basics': {
    pattern: 'Pointer Rewiring & Dummy Sentinel Nodes',
    intuition: 'Eliminates boundary edge cases (head deletion/insertion) by attaching a permanent dummy node before the list head.',
    interviewFrequency: '~65% of screen rounds',
    keyInvariant: 'dummy.next points to the real head. Always manipulate .next references safely before advancing pointers.'
  },
  'Fast & Slow Pointers': {
    pattern: "Floyd's Tortoise and Hare Cycle Detection",
    intuition: 'Two pointers moving at different speeds (1x vs 2x) guarantee meeting inside any closed cycle without extra space.',
    interviewFrequency: '~70% of technical rounds',
    keyInvariant: 'Distance between pointers increases by 1 each step modulo cycle length C, guaranteeing collision within C steps.'
  },

  // Trees & Graphs
  'Binary Tree Traversal': {
    pattern: 'Recursive Tree Decomposition',
    intuition: 'Breaks tree problems into (left subtree, current node, right subtree) independent subproblems.',
    interviewFrequency: '~90% of FAANG rounds',
    keyInvariant: 'Base case is null node. Post-order aggregates results bottom-up; pre-order propagates context top-down.'
  },
  'Breadth-First Search': {
    pattern: 'Level-Order Shortest Path',
    intuition: 'Explores states outward in concentric rings, guaranteeing the shortest path in unweighted graphs or grids.',
    interviewFrequency: '~85% of interview rounds',
    keyInvariant: 'Process queue level by level (storing queue.length at loop start) to measure exact distance from origin.'
  },
  'Depth-First Search': {
    pattern: 'Exhaustive Graph Traversal & Connected Components',
    intuition: 'Follows paths deeply until dead-ends are reached, using a visited set to avoid cycles.',
    interviewFrequency: '~85% of interview rounds',
    keyInvariant: 'Mark node visited before recursion; process neighbors; backtrack state if enumerating all paths.'
  },

  // Dynamic Programming
  '1D Dynamic Programming': {
    pattern: 'Optimal Substructure & Memoization',
    intuition: 'Solves overlapping subproblems once and caches results, transforming exponential recursion into linear time.',
    interviewFrequency: '~80% of onsite rounds',
    keyInvariant: 'dp[i] represents optimal solution for problem size i; state depends only on a fixed window of earlier dp values.'
  },
  '2D Dynamic Programming': {
    pattern: 'Grid & Multi-Sequence State Transitions',
    intuition: 'Models subproblems with two parameters (e.g. prefix of string A and prefix of string B).',
    interviewFrequency: '~75% of Tier-1 onsites',
    keyInvariant: 'dp[i][j] transitions from {dp[i-1][j], dp[i][j-1], dp[i-1][j-1]} based on character match or grid decision.'
  },
};

/**
 * Fallback pattern intuition for any topic string
 */
export function getPatternIntuition(topic: string, weekTopic?: string): PatternIntuition {
  if (TOPIC_INTUITIONS[topic]) {
    return TOPIC_INTUITIONS[topic];
  }

  // Fallback by topic keyword matching
  const t = (topic + ' ' + (weekTopic || '')).toLowerCase();

  if (t.includes('pointer') || t.includes('window')) {
    return TOPIC_INTUITIONS['Two Pointers Basics'];
  }
  if (t.includes('stack')) {
    return TOPIC_INTUITIONS['Stack Fundamentals'];
  }
  if (t.includes('tree') || t.includes('bst')) {
    return TOPIC_INTUITIONS['Binary Tree Traversal'];
  }
  if (t.includes('graph') || t.includes('bfs') || t.includes('dfs')) {
    return TOPIC_INTUITIONS['Breadth-First Search'];
  }
  if (t.includes('dp') || t.includes('dynamic') || t.includes('memo')) {
    return TOPIC_INTUITIONS['1D Dynamic Programming'];
  }
  if (t.includes('prefix') || t.includes('subarray')) {
    return TOPIC_INTUITIONS['Prefix Sums'];
  }

  return {
    pattern: 'Algorithmic Problem Decomposition',
    intuition: 'Analyze constraints, identify brute force bottlenecks, and choose optimal data structures to minimize time/space complexity.',
    interviewFrequency: '~80% of technical screens',
    keyInvariant: 'State your invariant before coding; verify boundary conditions on empty/single-element inputs.'
  };
}
