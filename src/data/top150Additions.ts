import type { Problem } from '../types';

/**
 * 60 Top Interview 150 problems that were not in the original custom plan.
 * Each entry specifies which day (1-140) to insert the problem into.
 * Problems are ordered by Top 150 first in the merged output.
 */
export interface Top150Addition {
  targetDay: number;
  problem: Problem;
}

export const TOP_150_ADDITIONS: Top150Addition[] = [
  // ── Week 1: Arrays Foundation ──────────────────────────────────
  { targetDay: 1, problem: { id: "t1", name: "Remove Element", lcNumber: 27, difficulty: "Easy", url: "https://leetcode.com/problems/remove-element/", note: "In-place element removal with write pointer." } },
  { targetDay: 1, problem: { id: "t2", name: "Contains Duplicate II", lcNumber: 219, difficulty: "Easy", url: "https://leetcode.com/problems/contains-duplicate-ii/", note: "Sliding window hash set within range k." } },
  { targetDay: 2, problem: { id: "t3", name: "Majority Element", lcNumber: 169, difficulty: "Easy", url: "https://leetcode.com/problems/majority-element/", note: "Boyer-Moore voting algorithm." } },
  { targetDay: 3, problem: { id: "t4", name: "Longest Common Prefix", lcNumber: 14, difficulty: "Easy", url: "https://leetcode.com/problems/longest-common-prefix/", note: "Vertical scan character-by-character." } },
  { targetDay: 5, problem: { id: "t5", name: "Best Time to Buy and Sell Stock II", lcNumber: 122, difficulty: "Easy", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/", note: "Greedy: collect every uphill profit." } },
  { targetDay: 5, problem: { id: "t6", name: "Roman to Integer", lcNumber: 13, difficulty: "Easy", url: "https://leetcode.com/problems/roman-to-integer/", note: "Map lookup + subtraction rule (IV = 4)." } },

  // ── Week 2: Two Pointers & Sliding Window ─────────────────────
  { targetDay: 8, problem: { id: "t7", name: "Is Subsequence", lcNumber: 392, difficulty: "Easy", url: "https://leetcode.com/problems/is-subsequence/", note: "Two pointer greedy subsequence check." } },
  { targetDay: 9, problem: { id: "t8", name: "Length of Last Word", lcNumber: 58, difficulty: "Easy", url: "https://leetcode.com/problems/length-of-last-word/", note: "Reverse scan past trailing spaces." } },
  { targetDay: 10, problem: { id: "t9", name: "Find the Index of First Occurrence", lcNumber: 28, difficulty: "Easy", url: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/", note: "String matching / KMP algorithm." } },
  { targetDay: 11, problem: { id: "t10", name: "Reverse Words in a String", lcNumber: 151, difficulty: "Medium", url: "https://leetcode.com/problems/reverse-words-in-a-string/", note: "Split, reverse array, rejoin." } },
  { targetDay: 12, problem: { id: "t11", name: "Valid Anagram", lcNumber: 242, difficulty: "Easy", url: "https://leetcode.com/problems/valid-anagram/", note: "Frequency counter comparison." } },
  { targetDay: 12, problem: { id: "t12", name: "Ransom Note", lcNumber: 383, difficulty: "Easy", url: "https://leetcode.com/problems/ransom-note/", note: "Character frequency availability check." } },
  { targetDay: 12, problem: { id: "t13", name: "Substring with Concatenation of All Words", lcNumber: 30, difficulty: "Hard", url: "https://leetcode.com/problems/substring-with-concatenation-of-all-words/", note: "Sliding window over fixed-size word chunks." } },

  // ── Week 3: Linked List & Stack ────────────────────────────────
  { targetDay: 15, problem: { id: "t14", name: "Copy List with Random Pointer", lcNumber: 138, difficulty: "Medium", url: "https://leetcode.com/problems/copy-list-with-random-pointer/", note: "Hashmap old→new node cloning." } },
  { targetDay: 16, problem: { id: "t15", name: "Reverse Linked List II", lcNumber: 92, difficulty: "Medium", url: "https://leetcode.com/problems/reverse-linked-list-ii/", note: "Reverse sublist between positions left-right." } },
  { targetDay: 16, problem: { id: "t16", name: "Partition List", lcNumber: 86, difficulty: "Medium", url: "https://leetcode.com/problems/partition-list/", note: "Two dummy heads split by pivot value." } },
  { targetDay: 17, problem: { id: "t17", name: "Simplify Path", lcNumber: 71, difficulty: "Medium", url: "https://leetcode.com/problems/simplify-path/", note: "Stack-based Unix path component resolution." } },
  { targetDay: 19, problem: { id: "t18", name: "Remove Duplicates from Sorted List II", lcNumber: 82, difficulty: "Medium", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-list-ii/", note: "Skip all nodes with duplicate values." } },
  { targetDay: 19, problem: { id: "t19", name: "Rotate List", lcNumber: 61, difficulty: "Medium", url: "https://leetcode.com/problems/rotate-list/", note: "Connect tail→head, break at n-k position." } },

  // ── Week 4: Binary Search & Matrix ─────────────────────────────
  { targetDay: 22, problem: { id: "t20", name: "Sqrt(x)", lcNumber: 69, difficulty: "Easy", url: "https://leetcode.com/problems/sqrtx/", note: "Binary search on integer square root." } },
  { targetDay: 23, problem: { id: "t21", name: "Find Peak Element", lcNumber: 162, difficulty: "Medium", url: "https://leetcode.com/problems/find-peak-element/", note: "Binary search toward ascending neighbor." } },
  { targetDay: 23, problem: { id: "t22", name: "Find First and Last Position", lcNumber: 34, difficulty: "Medium", url: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/", note: "Two binary searches: leftmost + rightmost." } },
  { targetDay: 24, problem: { id: "t23", name: "Game of Life", lcNumber: 289, difficulty: "Medium", url: "https://leetcode.com/problems/game-of-life/", note: "In-place state encoding (2 = was-alive, 3 = was-dead)." } },
  { targetDay: 26, problem: { id: "t24", name: "Remove Duplicates from Sorted Array II", lcNumber: 80, difficulty: "Medium", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/", note: "Write pointer allowing at most 2 duplicates." } },

  // ── Week 5: Trees — BST, DFS, BFS ─────────────────────────────
  { targetDay: 29, problem: { id: "t25", name: "Count Complete Tree Nodes", lcNumber: 222, difficulty: "Easy", url: "https://leetcode.com/problems/count-complete-tree-nodes/", note: "Binary height comparison for O(log²n)." } },
  { targetDay: 30, problem: { id: "t26", name: "Average of Levels in Binary Tree", lcNumber: 637, difficulty: "Easy", url: "https://leetcode.com/problems/average-of-levels-in-binary-tree/", note: "BFS level sum / level count." } },
  { targetDay: 31, problem: { id: "t27", name: "Lowest Common Ancestor of a Binary Tree", lcNumber: 236, difficulty: "Medium", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/", note: "Recursive search both subtrees — differs from BST version." } },
  { targetDay: 31, problem: { id: "t28", name: "Minimum Absolute Difference in BST", lcNumber: 530, difficulty: "Easy", url: "https://leetcode.com/problems/minimum-absolute-difference-in-bst/", note: "Inorder traversal tracking previous node." } },
  { targetDay: 33, problem: { id: "t29", name: "Sum Root to Leaf Numbers", lcNumber: 129, difficulty: "Medium", url: "https://leetcode.com/problems/sum-root-to-leaf-numbers/", note: "DFS path accumulator * 10 + node.val." } },
  { targetDay: 33, problem: { id: "t30", name: "Flatten Binary Tree to Linked List", lcNumber: 114, difficulty: "Medium", url: "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/", note: "Preorder rewiring using Morris-like right threading." } },

  // ── Week 6: Trees Advanced, Heap & Trie ────────────────────────
  { targetDay: 36, problem: { id: "t31", name: "Construct Binary Tree from Inorder and Postorder", lcNumber: 106, difficulty: "Medium", url: "https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/", note: "Postorder root lookup with inorder range split." } },
  { targetDay: 36, problem: { id: "t32", name: "Populating Next Right Pointers in Each Node II", lcNumber: 117, difficulty: "Medium", url: "https://leetcode.com/problems/populating-next-right-pointers-in-each-node-ii/", note: "BFS level-order next pointer wiring." } },
  { targetDay: 37, problem: { id: "t33", name: "Binary Search Tree Iterator", lcNumber: 173, difficulty: "Medium", url: "https://leetcode.com/problems/binary-search-tree-iterator/", note: "Controlled inorder traversal with stack." } },
  { targetDay: 38, problem: { id: "t34", name: "Find K Pairs with Smallest Sums", lcNumber: 373, difficulty: "Medium", url: "https://leetcode.com/problems/find-k-pairs-with-smallest-sums/", note: "Min-heap with (i,j) index pairs expansion." } },
  { targetDay: 39, problem: { id: "t35", name: "IPO", lcNumber: 502, difficulty: "Hard", url: "https://leetcode.com/problems/ipo/", note: "Greedy: sort by capital, max-heap profits." } },

  // ── Week 7: Backtracking ───────────────────────────────────────
  { targetDay: 43, problem: { id: "t36", name: "Word Search", lcNumber: 79, difficulty: "Medium", url: "https://leetcode.com/problems/word-search/", note: "Grid DFS backtrack with visited marking." } },
  { targetDay: 46, problem: { id: "t37", name: "N-Queens II", lcNumber: 52, difficulty: "Hard", url: "https://leetcode.com/problems/n-queens-ii/", note: "Count valid placements — col & diagonal bitsets." } },

  // ── Week 8: Graphs ─────────────────────────────────────────────
  { targetDay: 50, problem: { id: "t38", name: "Sort List", lcNumber: 148, difficulty: "Medium", url: "https://leetcode.com/problems/sort-list/", note: "Merge sort on linked list — slow/fast split." } },
  { targetDay: 51, problem: { id: "t39", name: "Minimum Genetic Mutation", lcNumber: 433, difficulty: "Medium", url: "https://leetcode.com/problems/minimum-genetic-mutation/", note: "BFS shortest mutation path (like Word Ladder)." } },

  // ── Week 10: Dynamic Programming 1D ────────────────────────────
  { targetDay: 64, problem: { id: "t40", name: "Maximum Sum Circular Subarray", lcNumber: 918, difficulty: "Medium", url: "https://leetcode.com/problems/maximum-sum-circular-subarray/", note: "max(Kadane normal, totalSum - minSubarray)." } },

  // ── Week 11: Dynamic Programming 2D ────────────────────────────
  { targetDay: 71, problem: { id: "t41", name: "Triangle", lcNumber: 120, difficulty: "Medium", url: "https://leetcode.com/problems/triangle/", note: "Bottom-up DP min path from base to apex." } },
  { targetDay: 73, problem: { id: "t42", name: "Best Time to Buy and Sell Stock IV", lcNumber: 188, difficulty: "Hard", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/", note: "At most k transactions state machine DP." } },

  // ── Week 12: Greedy & Intervals ────────────────────────────────
  { targetDay: 78, problem: { id: "t43", name: "Summary Ranges", lcNumber: 228, difficulty: "Easy", url: "https://leetcode.com/problems/summary-ranges/", note: "Consecutive run grouping." } },
  { targetDay: 82, problem: { id: "t44", name: "H-Index", lcNumber: 274, difficulty: "Medium", url: "https://leetcode.com/problems/h-index/", note: "Counting sort / bucket approach." } },

  // ── Week 13: Bits & Advanced DP ────────────────────────────────
  { targetDay: 85, problem: { id: "t45", name: "Add Binary", lcNumber: 67, difficulty: "Easy", url: "https://leetcode.com/problems/add-binary/", note: "Right-to-left carry addition on binary strings." } },
  { targetDay: 86, problem: { id: "t46", name: "Single Number II", lcNumber: 137, difficulty: "Medium", url: "https://leetcode.com/problems/single-number-ii/", note: "Bitwise counting modulo 3 per bit position." } },

  // ── Week 15: Company-Specific 1 ────────────────────────────────
  { targetDay: 99, problem: { id: "t47", name: "Insert Delete GetRandom O(1)", lcNumber: 380, difficulty: "Medium", url: "https://leetcode.com/problems/insert-delete-getrandom-o1/", note: "Array + hashmap swap-to-end removal." } },
  { targetDay: 100, problem: { id: "t48", name: "Pow(x, n)", lcNumber: 50, difficulty: "Medium", url: "https://leetcode.com/problems/powx-n/", note: "Binary exponentiation — O(log n)." } },
  { targetDay: 101, problem: { id: "t49", name: "Longest Consecutive Sequence", lcNumber: 128, difficulty: "Medium", url: "https://leetcode.com/problems/longest-consecutive-sequence/", note: "HashSet start-of-sequence detection." } },
  { targetDay: 103, problem: { id: "t50", name: "Plus One", lcNumber: 66, difficulty: "Easy", url: "https://leetcode.com/problems/plus-one/", note: "Right-to-left carry propagation." } },
  { targetDay: 103, problem: { id: "t51", name: "Palindrome Number", lcNumber: 9, difficulty: "Easy", url: "https://leetcode.com/problems/palindrome-number/", note: "Reverse half the digits comparison." } },

  // ── Week 16: Company-Specific 2 ────────────────────────────────
  { targetDay: 106, problem: { id: "t52", name: "Reverse Nodes in k-Group", lcNumber: 25, difficulty: "Hard", url: "https://leetcode.com/problems/reverse-nodes-in-k-group/", note: "Count k, reverse segment, reconnect recursively." } },
  { targetDay: 108, problem: { id: "t53", name: "Max Points on a Line", lcNumber: 149, difficulty: "Hard", url: "https://leetcode.com/problems/max-points-on-a-line/", note: "Slope hashmap per anchor point." } },
  { targetDay: 110, problem: { id: "t54", name: "Factorial Trailing Zeroes", lcNumber: 172, difficulty: "Medium", url: "https://leetcode.com/problems/factorial-trailing-zeroes/", note: "Count factors of 5: n/5 + n/25 + n/125..." } },

  // ── Week 17: Mock Interviews P1 ────────────────────────────────
  { targetDay: 113, problem: { id: "t55", name: "Construct Quad Tree", lcNumber: 427, difficulty: "Medium", url: "https://leetcode.com/problems/construct-quad-tree/", note: "Recursive grid subdivision." } },
  { targetDay: 115, problem: { id: "t56", name: "Isomorphic Strings", lcNumber: 205, difficulty: "Easy", url: "https://leetcode.com/problems/isomorphic-strings/", note: "Bidirectional character mapping." } },
  { targetDay: 115, problem: { id: "t57", name: "Word Pattern", lcNumber: 290, difficulty: "Easy", url: "https://leetcode.com/problems/word-pattern/", note: "Pattern to word bijection check." } },
  { targetDay: 117, problem: { id: "t58", name: "Group Anagrams", lcNumber: 49, difficulty: "Medium", url: "https://leetcode.com/problems/group-anagrams/", note: "Sorted-key hashmap grouping." } },

  // ── Week 18: Mock Interviews P2 ────────────────────────────────
  { targetDay: 120, problem: { id: "t59", name: "Happy Number", lcNumber: 202, difficulty: "Easy", url: "https://leetcode.com/problems/happy-number/", note: "Digit square sum cycle detection (Floyd's)." } },
  { targetDay: 122, problem: { id: "t60", name: "Convert Sorted Array to Binary Search Tree", lcNumber: 108, difficulty: "Easy", url: "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/", note: "Mid-element recursive balanced tree construction." } },
];
