import type { WeekPlan } from '../types';

export const PLAN_DATA: WeekPlan[] = [
  {
    week: 1,
    title: "Arrays Foundation",
    topic: "Arrays",
    days: [
      { day: 1, weekday: "Mon", topic: "Arrays Basics", type: "regular", problems: [
        { id: "p1", name: "Two Sum", lcNumber: 1, difficulty: "Easy", url: "https://leetcode.com/problems/two-sum/", note: "#1 asked question — hashmap lookup technique." },
        { id: "p2", name: "Best Time to Buy and Sell Stock", lcNumber: 121, difficulty: "Easy", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", note: "Single-pass min tracking pattern." },
        { id: "p3", name: "Contains Duplicate", lcNumber: 217, difficulty: "Easy", url: "https://leetcode.com/problems/contains-duplicate/", note: "Hash set for O(1) existence checks." }
      ]},
      { day: 2, weekday: "Tue", topic: "Array Manipulation", type: "regular", problems: [
        { id: "p4", name: "Move Zeroes", lcNumber: 283, difficulty: "Easy", url: "https://leetcode.com/problems/move-zeroes/", note: "In-place write pointer partitioning." },
        { id: "p5", name: "Merge Sorted Array", lcNumber: 88, difficulty: "Easy", url: "https://leetcode.com/problems/merge-sorted-array/", note: "Reverse two-pointer merging trick." },
        { id: "p6", name: "Maximum Subarray", lcNumber: 53, difficulty: "Medium", url: "https://leetcode.com/problems/maximum-subarray/", note: "Kadane's algorithm entry point." }
      ]},
      { day: 3, weekday: "Wed", topic: "Prefix Sums", type: "regular", problems: [
        { id: "p7", name: "Running Sum of 1d Array", lcNumber: 1480, difficulty: "Easy", url: "https://leetcode.com/problems/running-sum-of-1d-array/", note: "Prefix array foundation." },
        { id: "p8", name: "Product of Array Except Self", lcNumber: 238, difficulty: "Medium", url: "https://leetcode.com/problems/product-of-array-except-self/", note: "Prefix + suffix product combo without division." },
        { id: "p9", name: "Subarray Sum Equals K", lcNumber: 560, difficulty: "Medium", url: "https://leetcode.com/problems/subarray-sum-equals-k/", note: "Prefix sum + hashmap count logic." }
      ]},
      { day: 4, weekday: "Thu", topic: "Review & Re-solve", type: "review", problems: [
        { id: "p10", name: "Two Sum (BLIND RE-SOLVE)", lcNumber: 1, difficulty: "Easy", url: "https://leetcode.com/problems/two-sum/", note: "No peeking! Write O(N) solution from clean scratch.", isReview: true },
        { id: "p11", name: "Maximum Subarray (BLIND RE-SOLVE)", lcNumber: 53, difficulty: "Medium", url: "https://leetcode.com/problems/maximum-subarray/", note: "Write Kadane's algorithm without notes.", isReview: true },
        { id: "p12", name: "Maximum Product Subarray", lcNumber: 152, difficulty: "Medium", url: "https://leetcode.com/problems/maximum-product-subarray/", note: "Kadane variant tracking both min and max." }
      ]},
      { day: 5, weekday: "Fri", topic: "Array Reversals", type: "regular", problems: [
        { id: "p13", name: "Remove Duplicates from Sorted Array", lcNumber: 26, difficulty: "Easy", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/", note: "Two pointer overwrite pattern." },
        { id: "p14", name: "Rotate Array", lcNumber: 189, difficulty: "Medium", url: "https://leetcode.com/problems/rotate-array/", note: "3-reversal algorithm." },
        { id: "p15", name: "Find the Duplicate Number", lcNumber: 287, difficulty: "Medium", url: "https://leetcode.com/problems/find-the-duplicate-number/", note: "Floyd's cycle detection in array." }
      ]},
      { day: 6, weekday: "Sat", topic: "LeetCode Weekly Contest", type: "contest", problems: [
        { id: "p16", name: "LeetCode Live Contest", lcNumber: 0, difficulty: "Medium", url: "https://leetcode.com/contest/", note: "Solve 2-3 problems under live timer!" }
      ]},
      { day: 7, weekday: "Sun", topic: "Rest Day & Personal Project", type: "rest", problems: [] }
    ]
  },
  {
    week: 2,
    title: "Two Pointers & Sliding Window",
    topic: "Two Pointers",
    days: [
      { day: 8, weekday: "Mon", topic: "Two Pointers Basics", type: "regular", problems: [
        { id: "p17", name: "Valid Palindrome", lcNumber: 125, difficulty: "Easy", url: "https://leetcode.com/problems/valid-palindrome/", note: "Inward moving pointers." },
        { id: "p18", name: "Two Sum II - Input Array Is Sorted", lcNumber: 167, difficulty: "Medium", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/", note: "Sorted array two pointer O(1) space." },
        { id: "p19", name: "3Sum", lcNumber: 15, difficulty: "Medium", url: "https://leetcode.com/problems/3sum/", note: "Fix outer element + inner two pointer loop." }
      ]},
      { day: 9, weekday: "Tue", topic: "Advanced Pointers", type: "regular", problems: [
        { id: "p20", name: "Container With Most Water", lcNumber: 11, difficulty: "Medium", url: "https://leetcode.com/problems/container-with-most-water/", note: "Greedy pointer movement based on heights." },
        { id: "p21", name: "Sort Colors", lcNumber: 75, difficulty: "Medium", url: "https://leetcode.com/problems/sort-colors/", note: "Dutch National Flag 3-way partition." },
        { id: "p22", name: "Trapping Rain Water", lcNumber: 42, difficulty: "Hard", url: "https://leetcode.com/problems/trapping-rain-water/", note: "Classic two pointer max boundary tracking." }
      ]},
      { day: 10, weekday: "Wed", topic: "Fixed & Dynamic Window", type: "regular", problems: [
        { id: "p23", name: "Maximum Average Subarray I", lcNumber: 643, difficulty: "Easy", url: "https://leetcode.com/problems/maximum-average-subarray-i/", note: "Fixed size sliding window template." },
        { id: "p24", name: "Longest Substring Without Repeating Characters", lcNumber: 3, difficulty: "Medium", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", note: "Dynamic window with set." },
        { id: "p25", name: "Minimum Size Subarray Sum", lcNumber: 209, difficulty: "Medium", url: "https://leetcode.com/problems/minimum-size-subarray-sum/", note: "Shrink window while condition holds." }
      ]},
      { day: 11, weekday: "Thu", topic: "Review & Hard Window", type: "review", problems: [
        { id: "p26", name: "3Sum (BLIND RE-SOLVE)", lcNumber: 15, difficulty: "Medium", url: "https://leetcode.com/problems/3sum/", note: "Re-solve avoiding duplicate triplets.", isReview: true },
        { id: "p27", name: "Container With Most Water (BLIND RE-SOLVE)", lcNumber: 11, difficulty: "Medium", url: "https://leetcode.com/problems/container-with-most-water/", note: "Re-solve with clear pointer logic explanation.", isReview: true },
        { id: "p28", name: "Minimum Window Substring", lcNumber: 76, difficulty: "Hard", url: "https://leetcode.com/problems/minimum-window-substring/", note: "Hardest sliding window pattern." }
      ]},
      { day: 12, weekday: "Fri", topic: "Frequency Windows", type: "regular", problems: [
        { id: "p29", name: "Permutation in String", lcNumber: 567, difficulty: "Medium", url: "https://leetcode.com/problems/permutation-in-string/", note: "Frequency match in sliding window." },
        { id: "p30", name: "Find All Anagrams in a String", lcNumber: 438, difficulty: "Medium", url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/", note: "Sliding window frequency array." },
        { id: "p31", name: "Longest Repeating Character Replacement", lcNumber: 424, difficulty: "Medium", url: "https://leetcode.com/problems/longest-repeating-character-replacement/", note: "Window length minus max frequency." }
      ]},
      { day: 13, weekday: "Sat", topic: "LeetCode Contest", type: "contest", problems: [
        { id: "p32", name: "Weekly / Biweekly Contest", lcNumber: 0, difficulty: "Medium", url: "https://leetcode.com/contest/", note: "Push for Q1 and Q2 speed!" }
      ]},
      { day: 14, weekday: "Sun", topic: "Rest Day & Personal Project", type: "rest", problems: [] }
    ]
  },
  {
    week: 3,
    title: "Linked List & Stack",
    topic: "Linked List & Stack",
    days: [
      { day: 15, weekday: "Mon", topic: "Linked List Core", type: "regular", problems: [
        { id: "p33", name: "Reverse Linked List", lcNumber: 206, difficulty: "Easy", url: "https://leetcode.com/problems/reverse-linked-list/", note: "Pointer reversal (prev, curr, next)." },
        { id: "p34", name: "Merge Two Sorted Lists", lcNumber: 21, difficulty: "Easy", url: "https://leetcode.com/problems/merge-two-sorted-lists/", note: "Dummy head pointer technique." },
        { id: "p35", name: "Linked List Cycle", lcNumber: 141, difficulty: "Easy", url: "https://leetcode.com/problems/linked-list-cycle/", note: "Floyd's fast and slow pointer." }
      ]},
      { day: 16, weekday: "Tue", topic: "LL Mutations", type: "regular", problems: [
        { id: "p36", name: "Middle of the Linked List", lcNumber: 876, difficulty: "Easy", url: "https://leetcode.com/problems/middle-of-the-linked-list/", note: "Slow/fast pointer midpoint search." },
        { id: "p37", name: "Remove Nth Node From End of List", lcNumber: 19, difficulty: "Medium", url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", note: "Two pointer gap technique." },
        { id: "p38", name: "Reorder List", lcNumber: 143, difficulty: "Medium", url: "https://leetcode.com/problems/reorder-list/", note: "Midpoint + Reversal + Interleave." }
      ]},
      { day: 17, weekday: "Wed", topic: "Stack Core", type: "regular", problems: [
        { id: "p39", name: "Valid Parentheses", lcNumber: 20, difficulty: "Easy", url: "https://leetcode.com/problems/valid-parentheses/", note: "LIFO matching stack." },
        { id: "p40", name: "Min Stack", lcNumber: 155, difficulty: "Medium", url: "https://leetcode.com/problems/min-stack/", note: "Auxiliary min stack design." },
        { id: "p41", name: "Evaluate Reverse Polish Notation", lcNumber: 150, difficulty: "Medium", url: "https://leetcode.com/problems/evaluate-reverse-polish-notation/", note: "Postfix stack evaluation." }
      ]},
      { day: 18, weekday: "Thu", topic: "Review & Monotonic Stack", type: "review", problems: [
        { id: "p42", name: "Reverse Linked List (BLIND RE-SOLVE)", lcNumber: 206, difficulty: "Easy", url: "https://leetcode.com/problems/reverse-linked-list/", note: "Re-solve recursively and iteratively.", isReview: true },
        { id: "p43", name: "Valid Parentheses (BLIND RE-SOLVE)", lcNumber: 20, difficulty: "Easy", url: "https://leetcode.com/problems/valid-parentheses/", note: "Re-solve with zero syntax errors.", isReview: true },
        { id: "p44", name: "Daily Temperatures", lcNumber: 739, difficulty: "Medium", url: "https://leetcode.com/problems/daily-temperatures/", note: "Monotonic decreasing stack entry." }
      ]},
      { day: 19, weekday: "Fri", topic: "Advanced Monotonic Stack", type: "regular", problems: [
        { id: "p45", name: "Next Greater Element I", lcNumber: 496, difficulty: "Easy", url: "https://leetcode.com/problems/next-greater-element-i/", note: "Monotonic stack template." },
        { id: "p46", name: "Implement Queue using Stacks", lcNumber: 232, difficulty: "Easy", url: "https://leetcode.com/problems/implement-queue-using-stacks/", note: "Amortized O(1) queue using 2 stacks." },
        { id: "p47", name: "Largest Rectangle in Histogram", lcNumber: 84, difficulty: "Hard", url: "https://leetcode.com/problems/largest-rectangle-in-histogram/", note: "Classic hard stack problem." }
      ]},
      { day: 20, weekday: "Sat", topic: "LeetCode Contest", type: "contest", problems: [
        { id: "p48", name: "Weekly / Biweekly Contest", lcNumber: 0, difficulty: "Medium", url: "https://leetcode.com/contest/", note: "Solve Q1+Q2!" }
      ]},
      { day: 21, weekday: "Sun", topic: "Rest Day & Personal Project", type: "rest", problems: [] }
    ]
  },
  {
    week: 4,
    title: "Binary Search & Matrix",
    topic: "Binary Search & Matrix",
    days: [
      { day: 22, weekday: "Mon", topic: "Binary Search Core", type: "regular", problems: [
        { id: "p49", name: "Binary Search", lcNumber: 704, difficulty: "Easy", url: "https://leetcode.com/problems/binary-search/", note: "Master search range template." },
        { id: "p50", name: "Search Insert Position", lcNumber: 35, difficulty: "Easy", url: "https://leetcode.com/problems/search-insert-position/", note: "Lower bound binary search." },
        { id: "p51", name: "First Bad Version", lcNumber: 278, difficulty: "Easy", url: "https://leetcode.com/problems/first-bad-version/", note: "Binary search on predicate." }
      ]},
      { day: 23, weekday: "Tue", topic: "BS on Answers & Rotated", type: "regular", problems: [
        { id: "p52", name: "Find Minimum in Rotated Sorted Array", lcNumber: 153, difficulty: "Medium", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", note: "Binary search inflection point." },
        { id: "p53", name: "Search in Rotated Sorted Array", lcNumber: 33, difficulty: "Medium", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/", note: "Rotated sorted array condition logic." },
        { id: "p54", name: "Koko Eating Bananas", lcNumber: 875, difficulty: "Medium", url: "https://leetcode.com/problems/koko-eating-bananas/", note: "Binary search on solution space." }
      ]},
      { day: 24, weekday: "Wed", topic: "Matrix Fundamentals", type: "regular", problems: [
        { id: "p55", name: "Reshape the Matrix", lcNumber: 566, difficulty: "Easy", url: "https://leetcode.com/problems/reshape-the-matrix/", note: "Index mapping r * C + c." },
        { id: "p56", name: "Search a 2D Matrix", lcNumber: 74, difficulty: "Medium", url: "https://leetcode.com/problems/search-a-2d-matrix/", note: "Treat 2D grid as 1D array binary search." },
        { id: "p57", name: "Rotate Image", lcNumber: 48, difficulty: "Medium", url: "https://leetcode.com/problems/rotate-image/", note: "Transpose then reverse columns." }
      ]},
      { day: 25, weekday: "Thu", topic: "Review & Spiral Matrix", type: "review", problems: [
        { id: "p58", name: "Search in Rotated Sorted Array (BLIND)", lcNumber: 33, difficulty: "Medium", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/", note: "Re-solve checking correct half bounds.", isReview: true },
        { id: "p59", name: "Search a 2D Matrix (BLIND)", lcNumber: 74, difficulty: "Medium", url: "https://leetcode.com/problems/search-a-2d-matrix/", note: "Re-solve with zero lookup.", isReview: true },
        { id: "p60", name: "Spiral Matrix", lcNumber: 54, difficulty: "Medium", url: "https://leetcode.com/problems/spiral-matrix/", note: "Boundary tracking simulation." }
      ]},
      { day: 26, weekday: "Fri", topic: "Advanced Matrix & Search", type: "regular", problems: [
        { id: "p61", name: "Set Matrix Zeroes", lcNumber: 73, difficulty: "Medium", url: "https://leetcode.com/problems/set-matrix-zeroes/", note: "In-place zeroing using 1st row/col flags." },
        { id: "p62", name: "Valid Sudoku", lcNumber: 36, difficulty: "Medium", url: "https://leetcode.com/problems/valid-sudoku/", note: "Hash set tracking for rows, cols, boxes." },
        { id: "p63", name: "Median of Two Sorted Arrays", lcNumber: 4, difficulty: "Hard", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/", note: "Hard binary search partitioning." }
      ]},
      { day: 27, weekday: "Sat", topic: "LeetCode Contest", type: "contest", problems: [
        { id: "p64", name: "Weekly / Biweekly Contest", lcNumber: 0, difficulty: "Medium", url: "https://leetcode.com/contest/", note: "Maintain momentum!" }
      ]},
      { day: 28, weekday: "Sun", topic: "Rest Day & Personal Project", type: "rest", problems: [] }
    ]
  },
  {
    week: 5,
    title: "Trees — BST, DFS, BFS",
    topic: "Trees",
    days: [
      { day: 29, weekday: "Mon", topic: "Tree Basics", type: "regular", problems: [
        { id: "p65", name: "Maximum Depth of Binary Tree", lcNumber: 104, difficulty: "Easy", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", note: "Recursive DFS height calculation." },
        { id: "p66", name: "Invert Binary Tree", lcNumber: 226, difficulty: "Easy", url: "https://leetcode.com/problems/invert-binary-tree/", note: "Recursive child pointer swap." },
        { id: "p67", name: "Same Tree", lcNumber: 100, difficulty: "Easy", url: "https://leetcode.com/problems/same-tree/", note: "Simultaneous structural DFS." }
      ]},
      { day: 30, weekday: "Tue", topic: "Traversals & BFS", type: "regular", problems: [
        { id: "p68", name: "Binary Tree Inorder Traversal", lcNumber: 94, difficulty: "Easy", url: "https://leetcode.com/problems/binary-tree-inorder-traversal/", note: "Left -> Root -> Right traversal." },
        { id: "p69", name: "Symmetric Tree", lcNumber: 101, difficulty: "Easy", url: "https://leetcode.com/problems/symmetric-tree/", note: "Mirror tree comparison logic." },
        { id: "p70", name: "Binary Tree Level Order Traversal", lcNumber: 102, difficulty: "Medium", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/", note: "Queue based BFS template." }
      ]},
      { day: 31, weekday: "Wed", topic: "BST Properties", type: "regular", problems: [
        { id: "p71", name: "Validate Binary Search Tree", lcNumber: 98, difficulty: "Medium", url: "https://leetcode.com/problems/validate-binary-search-tree/", note: "Min/Max range propagation DFS." },
        { id: "p72", name: "Lowest Common Ancestor of a BST", lcNumber: 235, difficulty: "Medium", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/", note: "BST split property navigation." },
        { id: "p73", name: "Kth Smallest Element in a BST", lcNumber: 230, difficulty: "Medium", url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/", note: "Inorder traversal counter." }
      ]},
      { day: 32, weekday: "Thu", topic: "Review & Tree Views", type: "review", problems: [
        { id: "p74", name: "Maximum Depth of Binary Tree (BLIND)", lcNumber: 104, difficulty: "Easy", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", note: "Re-solve with BFS and DFS.", isReview: true },
        { id: "p75", name: "Validate Binary Search Tree (BLIND)", lcNumber: 98, difficulty: "Medium", url: "https://leetcode.com/problems/validate-binary-search-tree/", note: "Re-solve boundary checking.", isReview: true },
        { id: "p76", name: "Binary Tree Right Side View", lcNumber: 199, difficulty: "Medium", url: "https://leetcode.com/problems/binary-tree-right-side-view/", note: "BFS level end element tracking." }
      ]},
      { day: 33, weekday: "Fri", topic: "Tree Paths", type: "regular", problems: [
        { id: "p77", name: "Path Sum", lcNumber: 112, difficulty: "Easy", url: "https://leetcode.com/problems/path-sum/", note: "Subtract node value down path." },
        { id: "p78", name: "Diameter of Binary Tree", lcNumber: 543, difficulty: "Easy", url: "https://leetcode.com/problems/diameter-of-binary-tree/", note: "Global max update in depth recursion." },
        { id: "p79", name: "Subtree of Another Tree", lcNumber: 572, difficulty: "Easy", url: "https://leetcode.com/problems/subtree-of-another-tree/", note: "Same tree logic applied at each node." }
      ]},
      { day: 34, weekday: "Sat", topic: "LeetCode Contest", type: "contest", problems: [
        { id: "p80", name: "Weekly / Biweekly Contest", lcNumber: 0, difficulty: "Medium", url: "https://leetcode.com/contest/", note: "Tree problems in contest!" }
      ]},
      { day: 35, weekday: "Sun", topic: "Rest Day & Personal Project", type: "rest", problems: [] }
    ]
  },
  {
    week: 6,
    title: "Trees Advanced, Heap & Trie",
    topic: "Heaps & Tries",
    days: [
      { day: 36, weekday: "Mon", topic: "Hard Trees", type: "regular", problems: [
        { id: "p81", name: "Construct Binary Tree from Preorder & Inorder", lcNumber: 105, difficulty: "Medium", url: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/", note: "Preorder root lookup in inorder map." },
        { id: "p82", name: "Binary Tree Maximum Path Sum", lcNumber: 124, difficulty: "Hard", url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/", note: "Global max path update during DFS." },
        { id: "p83", name: "Serialize and Deserialize Binary Tree", lcNumber: 297, difficulty: "Hard", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", note: "Preorder string stream encoding." }
      ]},
      { day: 37, weekday: "Tue", topic: "Heap Basics", type: "regular", problems: [
        { id: "p84", name: "Last Stone Weight", lcNumber: 1046, difficulty: "Easy", url: "https://leetcode.com/problems/last-stone-weight/", note: "Max heap simulation." },
        { id: "p85", name: "Kth Largest Element in an Array", lcNumber: 215, difficulty: "Medium", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/", note: "Min heap size K or quickselect." },
        { id: "p86", name: "K Closest Points to Origin", lcNumber: 973, difficulty: "Medium", url: "https://leetcode.com/problems/k-closest-points-to-origin/", note: "Max heap / distance comparator." }
      ]},
      { day: 38, weekday: "Wed", topic: "Heap Patterns", type: "regular", problems: [
        { id: "p87", name: "Top K Frequent Elements", lcNumber: 347, difficulty: "Medium", url: "https://leetcode.com/problems/top-k-frequent-elements/", note: "Frequency map + heap or bucket sort." },
        { id: "p88", name: "Reorganize String", lcNumber: 767, difficulty: "Medium", url: "https://leetcode.com/problems/reorganize-string/", note: "Max heap character placement." },
        { id: "p89", name: "Find Median from Data Stream", lcNumber: 295, difficulty: "Hard", url: "https://leetcode.com/problems/find-median-from-data-stream/", note: "Dual heap balancing mechanism." }
      ]},
      { day: 39, weekday: "Thu", topic: "Review & Heap Merging", type: "review", problems: [
        { id: "p90", name: "Construct Tree Preorder & Inorder (BLIND)", lcNumber: 105, difficulty: "Medium", url: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/", note: "Re-solve tree building.", isReview: true },
        { id: "p91", name: "Kth Largest Element (BLIND)", lcNumber: 215, difficulty: "Medium", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/", note: "Re-solve with min-heap.", isReview: true },
        { id: "p92", name: "Merge k Sorted Lists", lcNumber: 23, difficulty: "Hard", url: "https://leetcode.com/problems/merge-k-sorted-lists/", note: "Min heap of list node heads." }
      ]},
      { day: 40, weekday: "Fri", topic: "Trie Data Structure", type: "regular", problems: [
        { id: "p93", name: "Implement Trie (Prefix Tree)", lcNumber: 208, difficulty: "Medium", url: "https://leetcode.com/problems/implement-trie-prefix-tree/", note: "TrieNode children map/array structure." },
        { id: "p94", name: "Design Add and Search Words", lcNumber: 211, difficulty: "Medium", url: "https://leetcode.com/problems/design-add-and-search-words-data-structure/", note: "Trie + wildcard DFS." },
        { id: "p95", name: "Word Search II", lcNumber: 212, difficulty: "Hard", url: "https://leetcode.com/problems/word-search-ii/", note: "Grid DFS + Trie prefix pruning." }
      ]},
      { day: 41, weekday: "Sat", topic: "LeetCode Contest", type: "contest", problems: [
        { id: "p96", name: "Weekly / Biweekly Contest", lcNumber: 0, difficulty: "Medium", url: "https://leetcode.com/contest/", note: "Solve 2+ problems!" }
      ]},
      { day: 42, weekday: "Sun", topic: "Rest Day & Personal Project", type: "rest", problems: [] }
    ]
  },
  {
    week: 7,
    title: "Backtracking",
    topic: "Backtracking",
    days: [
      { day: 43, weekday: "Mon", topic: "Backtracking Fundamentals", type: "regular", problems: [
        { id: "p97", name: "Subsets", lcNumber: 78, difficulty: "Medium", url: "https://leetcode.com/problems/subsets/", note: "Include/exclude decision tree." },
        { id: "p98", name: "Permutations", lcNumber: 46, difficulty: "Medium", url: "https://leetcode.com/problems/permutations/", note: "Used array / element swap backtrack." },
        { id: "p99", name: "Combination Sum", lcNumber: 39, difficulty: "Medium", url: "https://leetcode.com/problems/combination-sum/", note: "Unlimited candidate reuse index." }
      ]},
      { day: 44, weekday: "Tue", topic: "Handling Duplicates", type: "regular", problems: [
        { id: "p100", name: "Subsets II", lcNumber: 90, difficulty: "Medium", url: "https://leetcode.com/problems/subsets-ii/", note: "Sort + skip adjacent equal elements." },
        { id: "p101", name: "Combination Sum II", lcNumber: 40, difficulty: "Medium", url: "https://leetcode.com/problems/combination-sum-ii/", note: "Single-use elements with duplicate skipping." },
        { id: "p102", name: "Permutations II", lcNumber: 47, difficulty: "Medium", url: "https://leetcode.com/problems/permutations-ii/", note: "Duplicate permutation pruning." }
      ]},
      { day: 45, weekday: "Wed", topic: "String Backtracking", type: "regular", problems: [
        { id: "p103", name: "Letter Combinations of a Phone Number", lcNumber: 17, difficulty: "Medium", url: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/", note: "Digit to character mapping." },
        { id: "p104", name: "Generate Parentheses", lcNumber: 22, difficulty: "Medium", url: "https://leetcode.com/problems/generate-parentheses/", note: "Open/close count bracket constraint." },
        { id: "p105", name: "Palindrome Partitioning", lcNumber: 131, difficulty: "Medium", url: "https://leetcode.com/problems/palindrome-partitioning/", note: "Substring palindrome check + backtrack." }
      ]},
      { day: 46, weekday: "Thu", topic: "Review & Board Puzzles", type: "review", problems: [
        { id: "p106", name: "Subsets (BLIND RE-SOLVE)", lcNumber: 78, difficulty: "Medium", url: "https://leetcode.com/problems/subsets/", note: "Re-solve recursively.", isReview: true },
        { id: "p107", name: "Combination Sum (BLIND RE-SOLVE)", lcNumber: 39, difficulty: "Medium", url: "https://leetcode.com/problems/combination-sum/", note: "Re-solve state tree.", isReview: true },
        { id: "p108", name: "N-Queens", lcNumber: 51, difficulty: "Hard", url: "https://leetcode.com/problems/n-queens/", note: "Col & diagonal constraint tracking." }
      ]},
      { day: 47, weekday: "Fri", topic: "Hard Backtracking", type: "regular", problems: [
        { id: "p109", name: "Combinations", lcNumber: 77, difficulty: "Medium", url: "https://leetcode.com/problems/combinations/", note: "Choose K elements out of N." },
        { id: "p110", name: "Restore IP Addresses", lcNumber: 93, difficulty: "Medium", url: "https://leetcode.com/problems/restore-ip-addresses/", note: "4-octet string splitting." },
        { id: "p111", name: "Sudoku Solver", lcNumber: 37, difficulty: "Hard", url: "https://leetcode.com/problems/sudoku-solver/", note: "9x9 cell constraint resolution." }
      ]},
      { day: 48, weekday: "Sat", topic: "LeetCode Contest", type: "contest", problems: [
        { id: "p112", name: "Weekly / Biweekly Contest", lcNumber: 0, difficulty: "Medium", url: "https://leetcode.com/contest/", note: "Time pressure test!" }
      ]},
      { day: 49, weekday: "Sun", topic: "Rest Day & Personal Project", type: "rest", problems: [] }
    ]
  },
  {
    week: 8,
    title: "Graphs — BFS & DFS",
    topic: "Graphs",
    days: [
      { day: 50, weekday: "Mon", topic: "Grid Graphs", type: "regular", problems: [
        { id: "p113", name: "Flood Fill", lcNumber: 733, difficulty: "Easy", url: "https://leetcode.com/problems/flood-fill/", note: "Basic grid pixel traversal." },
        { id: "p114", name: "Number of Islands", lcNumber: 200, difficulty: "Medium", url: "https://leetcode.com/problems/number-of-islands/", note: "Classic connected component grid DFS." },
        { id: "p115", name: "Max Area of Island", lcNumber: 695, difficulty: "Medium", url: "https://leetcode.com/problems/max-area-of-island/", note: "Component size accumulator." }
      ]},
      { day: 51, weekday: "Tue", topic: "Graph DFS", type: "regular", problems: [
        { id: "p116", name: "Clone Graph", lcNumber: 133, difficulty: "Medium", url: "https://leetcode.com/problems/clone-graph/", note: "Visited hash map graph cloning." },
        { id: "p117", name: "Surrounded Regions", lcNumber: 130, difficulty: "Medium", url: "https://leetcode.com/problems/surrounded-regions/", note: "Boundary-connected island protection." },
        { id: "p118", name: "Pacific Atlantic Water Flow", lcNumber: 417, difficulty: "Medium", url: "https://leetcode.com/problems/pacific-atlantic-water-flow/", note: "Reverse ocean flow reachability." }
      ]},
      { day: 52, weekday: "Wed", topic: "Multi-source BFS", type: "regular", problems: [
        { id: "p119", name: "Rotting Oranges", lcNumber: 994, difficulty: "Medium", url: "https://leetcode.com/problems/rotting-oranges/", note: "Multi-source BFS queue initialization." },
        { id: "p120", name: "01 Matrix", lcNumber: 542, difficulty: "Medium", url: "https://leetcode.com/problems/01-matrix/", note: "Distance BFS starting from all 0s." },
        { id: "p121", name: "Shortest Path in Binary Matrix", lcNumber: 1091, difficulty: "Medium", url: "https://leetcode.com/problems/shortest-path-in-binary-matrix/", note: "8-directional grid BFS." }
      ]},
      { day: 53, weekday: "Thu", topic: "Review & Word Ladders", type: "review", problems: [
        { id: "p122", name: "Number of Islands (BLIND RE-SOLVE)", lcNumber: 200, difficulty: "Medium", url: "https://leetcode.com/problems/number-of-islands/", note: "Re-solve with BFS and DFS.", isReview: true },
        { id: "p123", name: "Rotting Oranges (BLIND RE-SOLVE)", lcNumber: 994, difficulty: "Medium", url: "https://leetcode.com/problems/rotting-oranges/", note: "Re-solve multi-source BFS.", isReview: true },
        { id: "p124", name: "Word Ladder", lcNumber: 127, difficulty: "Hard", url: "https://leetcode.com/problems/word-ladder/", note: "BFS shortest path on word transformations." }
      ]},
      { day: 54, weekday: "Fri", topic: "Topological Sort", type: "regular", problems: [
        { id: "p125", name: "Course Schedule", lcNumber: 207, difficulty: "Medium", url: "https://leetcode.com/problems/course-schedule/", note: "Cycle detection in directed graph (Kahn's / DFS)." },
        { id: "p126", name: "Course Schedule II", lcNumber: 210, difficulty: "Medium", url: "https://leetcode.com/problems/course-schedule-ii/", note: "Indegree array topological order extraction." },
        { id: "p127", name: "Is Graph Bipartite?", lcNumber: 785, difficulty: "Medium", url: "https://leetcode.com/problems/is-graph-bipartite/", note: "Graph 2-coloring via BFS/DFS." }
      ]},
      { day: 55, weekday: "Sat", topic: "LeetCode Contest", type: "contest", problems: [
        { id: "p128", name: "Weekly / Biweekly Contest", lcNumber: 0, difficulty: "Medium", url: "https://leetcode.com/contest/", note: "Graph problems test!" }
      ]},
      { day: 56, weekday: "Sun", topic: "Rest Day & Personal Project", type: "rest", problems: [] }
    ]
  },
  {
    week: 9,
    title: "Graphs — Union Find & Shortest Path",
    topic: "Advanced Graphs",
    days: [
      { day: 57, weekday: "Mon", topic: "Union Find (DSU)", type: "regular", problems: [
        { id: "p129", name: "Number of Provinces", lcNumber: 547, difficulty: "Medium", url: "https://leetcode.com/problems/number-of-provinces/", note: "Disjoint set union by rank." },
        { id: "p130", name: "Redundant Connection", lcNumber: 684, difficulty: "Medium", url: "https://leetcode.com/problems/redundant-connection/", note: "Cycle detection in undirected graph via DSU." },
        { id: "p131", name: "Accounts Merge", lcNumber: 721, difficulty: "Medium", url: "https://leetcode.com/problems/accounts-merge/", note: "Email component unioning." }
      ]},
      { day: 58, weekday: "Tue", topic: "Dijkstra Algorithm", type: "regular", problems: [
        { id: "p132", name: "Network Delay Time", lcNumber: 743, difficulty: "Medium", url: "https://leetcode.com/problems/network-delay-time/", note: "Classic single-source Dijkstra template." },
        { id: "p133", name: "Cheapest Flights Within K Stops", lcNumber: 787, difficulty: "Medium", url: "https://leetcode.com/problems/cheapest-flights-within-k-stops/", note: "Bellman-Ford / Modified BFS with step count." },
        { id: "p134", name: "Path with Maximum Probability", lcNumber: 1514, difficulty: "Medium", url: "https://leetcode.com/problems/path-with-maximum-probability/", note: "Max heap modified Dijkstra." }
      ]},
      { day: 59, weekday: "Wed", topic: "Advanced Graph Concepts", type: "regular", problems: [
        { id: "p135", name: "Minimum Height Trees", lcNumber: 310, difficulty: "Medium", url: "https://leetcode.com/problems/minimum-height-trees/", note: "Leaf trimming topological algorithm." },
        { id: "p136", name: "Reconstruct Itinerary", lcNumber: 332, difficulty: "Hard", url: "https://leetcode.com/problems/reconstruct-itinerary/", note: "Eulerian path / Hierholzer's algorithm." },
        { id: "p137", name: "Swim in Rising Water", lcNumber: 778, difficulty: "Hard", url: "https://leetcode.com/problems/swim-in-rising-water/", note: "Dijkstra on grid or Binary Search + BFS." }
      ]},
      { day: 60, weekday: "Thu", topic: "Review & Grid Memoization", type: "review", problems: [
        { id: "p138", name: "Course Schedule (BLIND RE-SOLVE)", lcNumber: 207, difficulty: "Medium", url: "https://leetcode.com/problems/course-schedule/", note: "Re-solve topological order.", isReview: true },
        { id: "p139", name: "Network Delay Time (BLIND RE-SOLVE)", lcNumber: 743, difficulty: "Medium", url: "https://leetcode.com/problems/network-delay-time/", note: "Re-solve priority queue Dijkstra.", isReview: true },
        { id: "p140", name: "Longest Increasing Path in a Matrix", lcNumber: 329, difficulty: "Hard", url: "https://leetcode.com/problems/longest-increasing-path-in-a-matrix/", note: "Grid DFS + DP Memoization." }
      ]},
      { day: 61, weekday: "Fri", topic: "Bridges & Reachability", type: "regular", problems: [
        { id: "p141", name: "Keys and Rooms", lcNumber: 841, difficulty: "Medium", url: "https://leetcode.com/problems/keys-and-rooms/", note: "Simple reachability traversal." },
        { id: "p142", name: "Find Eventual Safe States", lcNumber: 802, difficulty: "Medium", url: "https://leetcode.com/problems/find-eventual-safe-states/", note: "Cycle detection in reverse graph." },
        { id: "p143", name: "Critical Connections in a Network", lcNumber: 1192, difficulty: "Hard", url: "https://leetcode.com/problems/critical-connections-in-a-network/", note: "Tarjan's strongly connected bridge algorithm." }
      ]},
      { day: 62, weekday: "Sat", topic: "LeetCode Contest", type: "contest", problems: [
        { id: "p144", name: "Weekly / Biweekly Contest", lcNumber: 0, difficulty: "Medium", url: "https://leetcode.com/contest/", note: "2 months mark!" }
      ]},
      { day: 63, weekday: "Sun", topic: "Rest Day & Personal Project", type: "rest", problems: [] }
    ]
  },
  {
    week: 10,
    title: "Dynamic Programming — 1D",
    topic: "DP 1D",
    days: [
      { day: 64, weekday: "Mon", topic: "1D DP Basics", type: "regular", problems: [
        { id: "p145", name: "Climbing Stairs", lcNumber: 70, difficulty: "Easy", url: "https://leetcode.com/problems/climbing-stairs/", note: "Fibonacci state transition dp[i] = dp[i-1] + dp[i-2]." },
        { id: "p146", name: "Fibonacci Number", lcNumber: 509, difficulty: "Easy", url: "https://leetcode.com/problems/fibonacci-number/", note: "Tabulation vs memoization template." },
        { id: "p147", name: "House Robber", lcNumber: 198, difficulty: "Medium", url: "https://leetcode.com/problems/house-robber/", note: "dp[i] = max(dp[i-1], dp[i-2] + val)." }
      ]},
      { day: 65, weekday: "Tue", topic: "State Transition DP", type: "regular", problems: [
        { id: "p148", name: "Min Cost Climbing Stairs", lcNumber: 746, difficulty: "Easy", url: "https://leetcode.com/problems/min-cost-climbing-stairs/", note: "Cost optimization 1D DP." },
        { id: "p149", name: "House Robber II", lcNumber: 213, difficulty: "Medium", url: "https://leetcode.com/problems/house-robber-ii/", note: "Circular DP — run robber on two slice ranges." },
        { id: "p150", name: "Decode Ways", lcNumber: 91, difficulty: "Medium", url: "https://leetcode.com/problems/decode-ways/", note: "1-digit and 2-digit valid sequence splits." }
      ]},
      { day: 66, weekday: "Wed", topic: "Subsequences & Knapsack", type: "regular", problems: [
        { id: "p151", name: "Longest Increasing Subsequence", lcNumber: 300, difficulty: "Medium", url: "https://leetcode.com/problems/longest-increasing-subsequence/", note: "O(N^2) DP or O(N log N) patience sort." },
        { id: "p152", name: "Coin Change", lcNumber: 322, difficulty: "Medium", url: "https://leetcode.com/problems/coin-change/", note: "Unbounded knapsack min coins state." },
        { id: "p153", name: "Word Break", lcNumber: 139, difficulty: "Medium", url: "https://leetcode.com/problems/word-break/", note: "String slicing boolean DP." }
      ]},
      { day: 67, weekday: "Thu", topic: "Review & Palindromes", type: "review", problems: [
        { id: "p154", name: "House Robber (BLIND RE-SOLVE)", lcNumber: 198, difficulty: "Medium", url: "https://leetcode.com/problems/house-robber/", note: "Re-solve with O(1) memory variables.", isReview: true },
        { id: "p155", name: "Coin Change (BLIND RE-SOLVE)", lcNumber: 322, difficulty: "Medium", url: "https://leetcode.com/problems/coin-change/", note: "Re-solve setting base array.", isReview: true },
        { id: "p156", name: "Longest Palindromic Substring", lcNumber: 5, difficulty: "Medium", url: "https://leetcode.com/problems/longest-palindromic-substring/", note: "Expand center technique or 2D DP." }
      ]},
      { day: 68, weekday: "Fri", topic: "0/1 Knapsack Variants", type: "regular", problems: [
        { id: "p157", name: "Maximum Length of Repeated Subarray", lcNumber: 718, difficulty: "Medium", url: "https://leetcode.com/problems/maximum-length-of-repeated-subarray/", note: "2D array match extension." },
        { id: "p158", name: "Perfect Squares", lcNumber: 279, difficulty: "Medium", url: "https://leetcode.com/problems/perfect-squares/", note: "Min squares summing to N." },
        { id: "p159", name: "Partition Equal Subset Sum", lcNumber: 416, difficulty: "Medium", url: "https://leetcode.com/problems/partition-equal-subset-sum/", note: "0/1 Knapsack sum target / 2." }
      ]},
      { day: 69, weekday: "Sat", topic: "LeetCode Contest", type: "contest", problems: [
        { id: "p160", name: "Weekly / Biweekly Contest", lcNumber: 0, difficulty: "Medium", url: "https://leetcode.com/contest/", note: "Identify DP problems live!" }
      ]},
      { day: 70, weekday: "Sun", topic: "Rest Day & Personal Project", type: "rest", problems: [] }
    ]
  },
  {
    week: 11,
    title: "Dynamic Programming — 2D",
    topic: "DP 2D",
    days: [
      { day: 71, weekday: "Mon", topic: "Grid DP", type: "regular", problems: [
        { id: "p161", name: "Unique Paths", lcNumber: 62, difficulty: "Medium", url: "https://leetcode.com/problems/unique-paths/", note: "dp[i][j] = dp[i-1][j] + dp[i][j-1]." },
        { id: "p162", name: "Unique Paths II", lcNumber: 63, difficulty: "Medium", url: "https://leetcode.com/problems/unique-paths-ii/", note: "Grid DP with obstacle zeros." },
        { id: "p163", name: "Minimum Path Sum", lcNumber: 64, difficulty: "Medium", url: "https://leetcode.com/problems/minimum-path-sum/", note: "Min path cost accumulator." }
      ]},
      { day: 72, weekday: "Tue", topic: "String 2D DP", type: "regular", problems: [
        { id: "p164", name: "Longest Common Subsequence", lcNumber: 1143, difficulty: "Medium", url: "https://leetcode.com/problems/longest-common-subsequence/", note: "LCS matrix table template." },
        { id: "p165", name: "Edit Distance", lcNumber: 72, difficulty: "Medium", url: "https://leetcode.com/problems/edit-distance/", note: "Insert, delete, replace transition operations." },
        { id: "p166", name: "Interleaving String", lcNumber: 97, difficulty: "Medium", url: "https://leetcode.com/problems/interleaving-string/", note: "2D boolean string interleaving matrix." }
      ]},
      { day: 73, weekday: "Wed", topic: "2D Matrix DP", type: "regular", problems: [
        { id: "p167", name: "Maximal Square", lcNumber: 221, difficulty: "Medium", url: "https://leetcode.com/problems/maximal-square/", note: "min(top, left, top-left) + 1." },
        { id: "p168", name: "Target Sum", lcNumber: 494, difficulty: "Medium", url: "https://leetcode.com/problems/target-sum/", note: "Subset sum partition transformation." },
        { id: "p169", name: "Ones and Zeroes", lcNumber: 474, difficulty: "Medium", url: "https://leetcode.com/problems/ones-and-zeroes/", note: "3D Knapsack with two constraints." }
      ]},
      { day: 74, weekday: "Thu", topic: "Review & Distinct Strings", type: "review", problems: [
        { id: "p170", name: "Longest Common Subsequence (BLIND)", lcNumber: 1143, difficulty: "Medium", url: "https://leetcode.com/problems/longest-common-subsequence/", note: "Re-solve matrix construction.", isReview: true },
        { id: "p171", name: "Edit Distance (BLIND)", lcNumber: 72, difficulty: "Medium", url: "https://leetcode.com/problems/edit-distance/", note: "Re-solve with clear index checks.", isReview: true },
        { id: "p172", name: "Distinct Subsequences", lcNumber: 115, difficulty: "Hard", url: "https://leetcode.com/problems/distinct-subsequences/", note: "Count string matches DP." }
      ]},
      { day: 75, weekday: "Fri", topic: "Hard String DP", type: "regular", problems: [
        { id: "p173", name: "Palindromic Substrings", lcNumber: 647, difficulty: "Medium", url: "https://leetcode.com/problems/palindromic-substrings/", note: "Count palindromic substrings." },
        { id: "p174", name: "Longest Palindromic Subsequence", lcNumber: 516, difficulty: "Medium", url: "https://leetcode.com/problems/longest-palindromic-subsequence/", note: "LCS between string and reverse." },
        { id: "p175", name: "Regular Expression Matching", lcNumber: 10, difficulty: "Hard", url: "https://leetcode.com/problems/regular-expression-matching/", note: "Dot & Star regex state matching." }
      ]},
      { day: 76, weekday: "Sat", topic: "LeetCode Contest", type: "contest", problems: [
        { id: "p176", name: "Weekly / Biweekly Contest", lcNumber: 0, difficulty: "Medium", url: "https://leetcode.com/contest/", note: "DP confidence test!" }
      ]},
      { day: 77, weekday: "Sun", topic: "Rest Day & Personal Project", type: "rest", problems: [] }
    ]
  },
  {
    week: 12,
    title: "Greedy & Intervals",
    topic: "Greedy & Intervals",
    days: [
      { day: 78, weekday: "Mon", topic: "Greedy Core", type: "regular", problems: [
        { id: "p177", name: "Assign Cookies", lcNumber: 455, difficulty: "Easy", url: "https://leetcode.com/problems/assign-cookies/", note: "Sort & match greedy greedy." },
        { id: "p178", name: "Lemonade Change", lcNumber: 860, difficulty: "Easy", url: "https://leetcode.com/problems/lemonade-change/", note: "Use largest bill change strategy." },
        { id: "p179", name: "Jump Game", lcNumber: 55, difficulty: "Medium", url: "https://leetcode.com/problems/jump-game/", note: "Farthest reach tracker." }
      ]},
      { day: 79, weekday: "Tue", topic: "Greedy Decisions", type: "regular", problems: [
        { id: "p180", name: "Jump Game II", lcNumber: 45, difficulty: "Medium", url: "https://leetcode.com/problems/jump-game-ii/", note: "Greedy BFS step boundary transition." },
        { id: "p181", name: "Gas Station", lcNumber: 134, difficulty: "Medium", url: "https://leetcode.com/problems/gas-station/", note: "Net gas accumulators." },
        { id: "p182", name: "Hand of Straights", lcNumber: 846, difficulty: "Medium", url: "https://leetcode.com/problems/hand-of-straights/", note: "Min element consecutive grouping." }
      ]},
      { day: 80, weekday: "Wed", topic: "Interval Scheduling", type: "regular", problems: [
        { id: "p183", name: "Merge Intervals", lcNumber: 56, difficulty: "Medium", url: "https://leetcode.com/problems/merge-intervals/", note: "Sort by start time & merge overlapping." },
        { id: "p184", name: "Insert Interval", lcNumber: 57, difficulty: "Medium", url: "https://leetcode.com/problems/insert-interval/", note: "Non-overlapping insertion logic." },
        { id: "p185", name: "Non-overlapping Intervals", lcNumber: 435, difficulty: "Medium", url: "https://leetcode.com/problems/non-overlapping-intervals/", note: "Sort by end time activity selection." }
      ]},
      { day: 81, weekday: "Thu", topic: "Review & Arrows", type: "review", problems: [
        { id: "p186", name: "Jump Game (BLIND RE-SOLVE)", lcNumber: 55, difficulty: "Medium", url: "https://leetcode.com/problems/jump-game/", note: "Re-solve with single pass.", isReview: true },
        { id: "p187", name: "Merge Intervals (BLIND RE-SOLVE)", lcNumber: 56, difficulty: "Medium", url: "https://leetcode.com/problems/merge-intervals/", note: "Re-solve with zero array bugs.", isReview: true },
        { id: "p188", name: "Minimum Number of Arrows to Burst Balloons", lcNumber: 452, difficulty: "Medium", url: "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/", note: "Sort by end coordinate." }
      ]},
      { day: 82, weekday: "Fri", topic: "Advanced Greedy", type: "regular", problems: [
        { id: "p189", name: "Partition Labels", lcNumber: 763, difficulty: "Medium", url: "https://leetcode.com/problems/partition-labels/", note: "Last char occurrence boundary." },
        { id: "p190", name: "Queue Reconstruction by Height", lcNumber: 406, difficulty: "Medium", url: "https://leetcode.com/problems/queue-reconstruction-by-height/", note: "Sort tall first, insert at index." },
        { id: "p191", name: "Interval List Intersections", lcNumber: 986, difficulty: "Medium", url: "https://leetcode.com/problems/interval-list-intersections/", note: "Two pointer interval overlap max/min." }
      ]},
      { day: 83, weekday: "Sat", topic: "LeetCode Contest", type: "contest", problems: [
        { id: "p192", name: "Weekly / Biweekly Contest", lcNumber: 0, difficulty: "Medium", url: "https://leetcode.com/contest/", note: "Greedy contest speed!" }
      ]},
      { day: 84, weekday: "Sun", topic: "Rest Day & Personal Project", type: "rest", problems: [] }
    ]
  },
  {
    week: 13,
    title: "Advanced DP & Bit Manipulation",
    topic: "Bit Manipulation & Advanced DP",
    days: [
      { day: 85, weekday: "Mon", topic: "Bitwise Operators", type: "regular", problems: [
        { id: "p193", name: "Single Number", lcNumber: 136, difficulty: "Easy", url: "https://leetcode.com/problems/single-number/", note: "XOR cancellation property a ^ a = 0." },
        { id: "p194", name: "Number of 1 Bits", lcNumber: 191, difficulty: "Easy", url: "https://leetcode.com/problems/number-of-1-bits/", note: "n & (n - 1) bit clearing trick." },
        { id: "p195", name: "Counting Bits", lcNumber: 338, difficulty: "Easy", url: "https://leetcode.com/problems/counting-bits/", note: "DP bit transition dp[i] = dp[i >> 1] + (i & 1)." }
      ]},
      { day: 86, weekday: "Tue", topic: "Bit Tricks", type: "regular", problems: [
        { id: "p196", name: "Reverse Bits", lcNumber: 190, difficulty: "Easy", url: "https://leetcode.com/problems/reverse-bits/", note: "32-bit shift and OR construction." },
        { id: "p197", name: "Missing Number", lcNumber: 268, difficulty: "Easy", url: "https://leetcode.com/problems/missing-number/", note: "XOR index with value." },
        { id: "p198", name: "Sum of Two Integers", lcNumber: 371, difficulty: "Medium", url: "https://leetcode.com/problems/sum-of-two-integers/", note: "Addition via XOR sum and AND carry." }
      ]},
      { day: 87, weekday: "Wed", topic: "Interval DP & Games", type: "regular", problems: [
        { id: "p199", name: "Stone Game", lcNumber: 877, difficulty: "Medium", url: "https://leetcode.com/problems/stone-game/", note: "Minimax minimax game DP." },
        { id: "p200", name: "Burst Balloons", lcNumber: 312, difficulty: "Hard", url: "https://leetcode.com/problems/burst-balloons/", note: "Think backwards — last balloon burst MCM." },
        { id: "p201", name: "Minimum Cost to Cut a Stick", lcNumber: 1547, difficulty: "Hard", url: "https://leetcode.com/problems/minimum-cost-to-cut-a-stick/", note: "Matrix chain multiplication interval DP." }
      ]},
      { day: 88, weekday: "Thu", topic: "Review & Divisibility", type: "review", problems: [
        { id: "p202", name: "Single Number (BLIND RE-SOLVE)", lcNumber: 136, difficulty: "Easy", url: "https://leetcode.com/problems/single-number/", note: "Re-solve explaining bitwise XOR.", isReview: true },
        { id: "p203", name: "Burst Balloons (BLIND RE-SOLVE)", lcNumber: 312, difficulty: "Hard", url: "https://leetcode.com/problems/burst-balloons/", note: "Re-solve interval state logic.", isReview: true },
        { id: "p204", name: "Largest Divisible Subset", lcNumber: 368, difficulty: "Medium", url: "https://leetcode.com/problems/largest-divisible-subset/", note: "Sorted DP + parent pointer tracking." }
      ]},
      { day: 89, weekday: "Fri", topic: "Bit Ranges & Hard DP", type: "regular", problems: [
        { id: "p205", name: "Bitwise AND of Numbers Range", lcNumber: 201, difficulty: "Medium", url: "https://leetcode.com/problems/bitwise-and-of-numbers-range/", note: "Shift until common prefix." },
        { id: "p206", name: "Longest Valid Parentheses", lcNumber: 32, difficulty: "Hard", url: "https://leetcode.com/problems/longest-valid-parentheses/", note: "Stack or 1D DP valid length accumulator." },
        { id: "p207", name: "Palindrome Partitioning II", lcNumber: 132, difficulty: "Hard", url: "https://leetcode.com/problems/palindrome-partitioning-ii/", note: "Min cut count palindrome DP." }
      ]},
      { day: 90, weekday: "Sat", topic: "LeetCode Contest", type: "contest", problems: [
        { id: "p208", name: "Weekly / Biweekly Contest", lcNumber: 0, difficulty: "Medium", url: "https://leetcode.com/contest/", note: "All foundational topics complete!" }
      ]},
      { day: 91, weekday: "Sun", topic: "Rest Day & Personal Project", type: "rest", problems: [] }
    ]
  },
  {
    week: 14,
    title: "System Design Prep",
    topic: "System Design",
    days: [
      { day: 92, weekday: "Mon", topic: "DDIA Foundations & Scalability", type: "regular", problems: [
        { id: "sd1", name: "Read DDIA Chapter 1 & 2", lcNumber: 0, difficulty: "Easy", url: "https://github.com/donnemartin/system-design-primer", note: "Reliability, Scalability, Maintainability." }
      ]},
      { day: 93, weekday: "Tue", topic: "Design TinyURL / URL Shortener", type: "regular", problems: [
        { id: "sd2", name: "System Design: URL Shortener", lcNumber: 0, difficulty: "Medium", url: "https://github.com/donnemartin/system-design-primer", note: "Base62 encoding, hashing, DB sharding." }
      ]},
      { day: 94, weekday: "Wed", topic: "Design Pastebin & Consistent Hashing", type: "regular", problems: [
        { id: "sd3", name: "System Design: Pastebin", lcNumber: 0, difficulty: "Medium", url: "https://github.com/donnemartin/system-design-primer", note: "Object storage (S3) + TTL keys." }
      ]},
      { day: 95, weekday: "Thu", topic: "Design Rate Limiter (Redis)", type: "review", problems: [
        { id: "sd4", name: "System Design: Rate Limiter", lcNumber: 0, difficulty: "Medium", url: "https://github.com/donnemartin/system-design-primer", note: "Token bucket & sliding window in Redis (Relevant to MARI!)." }
      ]},
      { day: 96, weekday: "Fri", topic: "Design Notification Service", type: "regular", problems: [
        { id: "sd5", name: "System Design: Notification System", lcNumber: 0, difficulty: "Medium", url: "https://github.com/donnemartin/system-design-primer", note: "Message queues & worker fan-out." }
      ]},
      { day: 97, weekday: "Sat", topic: "LeetCode Contest", type: "contest", problems: [
        { id: "p209", name: "Weekly / Biweekly Contest", lcNumber: 0, difficulty: "Medium", url: "https://leetcode.com/contest/", note: "Keep coding speed alive!" }
      ]},
      { day: 98, weekday: "Sun", topic: "Rest Day & Personal Project", type: "rest", problems: [] }
    ]
  },
  {
    week: 15,
    title: "Company-Specific Grinding — Part 1",
    topic: "Company Patterns",
    days: [
      { day: 99, weekday: "Mon", topic: "LRU & String Formatting", type: "regular", problems: [
        { id: "p210", name: "LRU Cache", lcNumber: 146, difficulty: "Medium", url: "https://leetcode.com/problems/lru-cache/", note: "#1 FAANG question — Hashmap + Doubly Linked List." },
        { id: "p211", name: "String to Integer (atoi)", lcNumber: 8, difficulty: "Medium", url: "https://leetcode.com/problems/string-to-integer-atoi/", note: "Microsoft favorite string parsing edge cases." },
        { id: "p212", name: "Zigzag Conversion", lcNumber: 6, difficulty: "Medium", url: "https://leetcode.com/problems/zigzag-conversion/", note: "Row tracking array string simulation." }
      ]},
      { day: 100, weekday: "Tue", topic: "Design Data Structures", type: "regular", problems: [
        { id: "p213", name: "Basic Calculator II", lcNumber: 227, difficulty: "Medium", url: "https://leetcode.com/problems/basic-calculator-ii/", note: "Stack precedence operator evaluation." },
        { id: "p214", name: "Snapshot Array", lcNumber: 1146, difficulty: "Medium", url: "https://leetcode.com/problems/snapshot-array/", note: "Binary search on historical snap IDs." },
        { id: "p215", name: "Time Based Key-Value Store", lcNumber: 981, difficulty: "Medium", url: "https://leetcode.com/problems/time-based-key-value-store/", note: "Map + binary search timestamps." }
      ]},
      { day: 101, weekday: "Wed", topic: "Classic FAANG", type: "regular", problems: [
        { id: "p216", name: "Add Two Numbers", lcNumber: 2, difficulty: "Medium", url: "https://leetcode.com/problems/add-two-numbers/", note: "Linked list carry addition." },
        { id: "p217", name: "Reverse Integer", lcNumber: 7, difficulty: "Medium", url: "https://leetcode.com/problems/reverse-integer/", note: "Integer overflow detection logic." },
        { id: "p218", name: "Integer to Roman", lcNumber: 12, difficulty: "Medium", url: "https://leetcode.com/problems/integer-to-roman/", note: "Greedy value map array lookup." }
      ]},
      { day: 102, weekday: "Thu", topic: "Review & Twitter Design", type: "review", problems: [
        { id: "p219", name: "LRU Cache (BLIND RE-SOLVE)", lcNumber: 146, difficulty: "Medium", url: "https://leetcode.com/problems/lru-cache/", note: "Write DLL + Map in under 15 minutes!", isReview: true },
        { id: "p220", name: "Add Two Numbers (BLIND RE-SOLVE)", lcNumber: 2, difficulty: "Medium", url: "https://leetcode.com/problems/add-two-numbers/", note: "Re-solve with dummy head.", isReview: true },
        { id: "p221", name: "Design Twitter", lcNumber: 355, difficulty: "Medium", url: "https://leetcode.com/problems/design-twitter/", note: "Newsfeed k-way heap merge." }
      ]},
      { day: 103, weekday: "Fri", topic: "FinTech Stock Patterns", type: "regular", problems: [
        { id: "p222", name: "Best Time to Buy & Sell Stock Cooldown", lcNumber: 309, difficulty: "Medium", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/", note: "Razorpay / PhonePe favorite state machine DP." },
        { id: "p223", name: "Best Time to Buy & Sell Stock Fee", lcNumber: 714, difficulty: "Medium", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/", note: "Fee deduction greedy/DP." },
        { id: "p224", name: "Maximum Profit in Job Scheduling", lcNumber: 1235, difficulty: "Hard", url: "https://leetcode.com/problems/maximum-profit-in-job-scheduling/", note: "DP + binary search weighted scheduling." }
      ]},
      { day: 104, weekday: "Sat", topic: "LeetCode Contest", type: "contest", problems: [
        { id: "p225", name: "Weekly / Biweekly Contest", lcNumber: 0, difficulty: "Medium", url: "https://leetcode.com/contest/", note: "Push hard!" }
      ]},
      { day: 105, weekday: "Sun", topic: "Rest Day & Personal Project", type: "rest", problems: [] }
    ]
  },
  {
    week: 16,
    title: "Company-Specific Grinding — Part 2",
    topic: "Hard Company Problems",
    days: [
      { day: 106, weekday: "Mon", topic: "Hard String & Array Tricks", type: "regular", problems: [
        { id: "p226", name: "Text Justification", lcNumber: 68, difficulty: "Hard", url: "https://leetcode.com/problems/text-justification/", note: "Google line space packing." },
        { id: "p227", name: "First Missing Positive", lcNumber: 41, difficulty: "Hard", url: "https://leetcode.com/problems/first-missing-positive/", note: "In-place cyclic sort index mapping." },
        { id: "p228", name: "Candy", lcNumber: 135, difficulty: "Hard", url: "https://leetcode.com/problems/candy/", note: "Left-to-right & right-to-left greedy pass." }
      ]},
      { day: 107, weekday: "Tue", topic: "Advanced Data Structure Hard", type: "regular", problems: [
        { id: "p229", name: "Count of Smaller Numbers After Self", lcNumber: 315, difficulty: "Hard", url: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/", note: "Merge sort counting / Fenwick tree." },
        { id: "p230", name: "Sliding Window Maximum", lcNumber: 239, difficulty: "Hard", url: "https://leetcode.com/problems/sliding-window-maximum/", note: "Monotonic deque window tracker." },
        { id: "p231", name: "The Skyline Problem", lcNumber: 218, difficulty: "Hard", url: "https://leetcode.com/problems/the-skyline-problem/", note: "Sweep line + max heap events." }
      ]},
      { day: 108, weekday: "Wed", topic: "Hard String Match & DP", type: "regular", problems: [
        { id: "p232", name: "Wildcard Matching", lcNumber: 44, difficulty: "Hard", url: "https://leetcode.com/problems/wildcard-matching/", note: "DP matching for ? and *." },
        { id: "p233", name: "Minimum Cost to Merge Stones", lcNumber: 1000, difficulty: "Hard", url: "https://leetcode.com/problems/minimum-cost-to-merge-stones/", note: "K-step interval DP." },
        { id: "p234", name: "Dungeon Game", lcNumber: 174, difficulty: "Hard", url: "https://leetcode.com/problems/dungeon-game/", note: "Bottom-right reverse HP DP." }
      ]},
      { day: 109, weekday: "Thu", topic: "Review & Envelopes", type: "review", problems: [
        { id: "p235", name: "Job Scheduling (BLIND RE-SOLVE)", lcNumber: 1235, difficulty: "Hard", url: "https://leetcode.com/problems/maximum-profit-in-job-scheduling/", note: "Re-solve binary search DP.", isReview: true },
        { id: "p236", name: "Sliding Window Maximum (BLIND)", lcNumber: 239, difficulty: "Hard", url: "https://leetcode.com/problems/sliding-window-maximum/", note: "Re-solve monotonic deque.", isReview: true },
        { id: "p237", name: "Russian Doll Envelopes", lcNumber: 354, difficulty: "Hard", url: "https://leetcode.com/problems/russian-doll-envelopes/", note: "2D sorting + 1D LIS patience sort." }
      ]},
      { day: 110, weekday: "Fri", topic: "3D Grid & Histogram Hard", type: "regular", problems: [
        { id: "p238", name: "Trapping Rain Water II", lcNumber: 407, difficulty: "Hard", url: "https://leetcode.com/problems/trapping-rain-water-ii/", note: "Min heap BFS from 3D boundary." },
        { id: "p239", name: "Smallest Range Covering K Lists", lcNumber: 632, difficulty: "Hard", url: "https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/", note: "Heap min pointer window tracking." },
        { id: "p240", name: "Maximal Rectangle", lcNumber: 85, difficulty: "Hard", url: "https://leetcode.com/problems/maximal-rectangle/", note: "Row-by-row histogram stack." }
      ]},
      { day: 111, weekday: "Sat", topic: "LeetCode Contest", type: "contest", problems: [
        { id: "p241", name: "Weekly / Biweekly Contest", lcNumber: 0, difficulty: "Medium", url: "https://leetcode.com/contest/", note: "Aim for Q3 solve!" }
      ]},
      { day: 112, weekday: "Sun", topic: "Rest Day & Personal Project", type: "rest", problems: [] }
    ]
  },
  {
    week: 17,
    title: "Mock Interviews & Weak Topics — P1",
    topic: "Mock Revision",
    days: [
      { day: 113, weekday: "Mon", topic: "Array Revisit", type: "regular", problems: [
        { id: "p242", name: "4Sum", lcNumber: 18, difficulty: "Medium", url: "https://leetcode.com/problems/4sum/", note: "N-sum recursion reduction." },
        { id: "p243", name: "Next Permutation", lcNumber: 31, difficulty: "Medium", url: "https://leetcode.com/problems/next-permutation/", note: "Rightmost pivot search & reverse suffix." },
        { id: "p244", name: "Spiral Matrix II", lcNumber: 59, difficulty: "Medium", url: "https://leetcode.com/problems/spiral-matrix-ii/", note: "Grid generation matrix." }
      ]},
      { day: 114, weekday: "Tue", topic: "Tree & Graph Revisit", type: "regular", problems: [
        { id: "p245", name: "Binary Tree Zigzag Level Order", lcNumber: 103, difficulty: "Medium", url: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/", note: "BFS alternating queue." },
        { id: "p246", name: "All Nodes Distance K in Binary Tree", lcNumber: 863, difficulty: "Medium", url: "https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/", note: "Tree to undirected graph BFS." },
        { id: "p247", name: "Shortest Bridge", lcNumber: 934, difficulty: "Medium", url: "https://leetcode.com/problems/shortest-bridge/", note: "Island DFS + boundary expanding BFS." }
      ]},
      { day: 115, weekday: "Wed", topic: "Mock Session 1", type: "regular", problems: [
        { id: "p248", name: "Random Pick with Weight", lcNumber: 528, difficulty: "Medium", url: "https://leetcode.com/problems/random-pick-with-weight/", note: "Prefix sums + binary search pick." },
        { id: "p249", name: "Design Underground System", lcNumber: 1396, difficulty: "Medium", url: "https://leetcode.com/problems/design-underground-system/", note: "Check-in/out average trip hashmap." },
        { id: "p250", name: "Decode String", lcNumber: 394, difficulty: "Medium", url: "https://leetcode.com/problems/decode-string/", note: "Nested bracket expression stack." }
      ]},
      { day: 116, weekday: "Thu", topic: "Review & Graph Rank", type: "review", problems: [
        { id: "p251", name: "Next Permutation (BLIND RE-SOLVE)", lcNumber: 31, difficulty: "Medium", url: "https://leetcode.com/problems/next-permutation/", note: "Re-solve with zero hints.", isReview: true },
        { id: "p252", name: "Decode String (BLIND RE-SOLVE)", lcNumber: 394, difficulty: "Medium", url: "https://leetcode.com/problems/decode-string/", note: "Re-solve stack parser.", isReview: true },
        { id: "p253", name: "Maximal Network Rank", lcNumber: 1615, difficulty: "Medium", url: "https://leetcode.com/problems/maximal-network-rank/", note: "Pairwise degree counting graph." }
      ]},
      { day: 117, weekday: "Fri", topic: "Mock Session 2", type: "regular", problems: [
        { id: "p254", name: "Design Circular Queue", lcNumber: 622, difficulty: "Medium", url: "https://leetcode.com/problems/design-circular-queue/", note: "Ring buffer array pointer math." },
        { id: "p255", name: "Evaluate Division", lcNumber: 399, difficulty: "Medium", url: "https://leetcode.com/problems/evaluate-division/", note: "Weighted graph path product DFS." },
        { id: "p256", name: "Remove K Digits", lcNumber: 402, difficulty: "Medium", url: "https://leetcode.com/problems/remove-k-digits/", note: "Monotonic increasing stack greedy." }
      ]},
      { day: 118, weekday: "Sat", topic: "LeetCode Contest", type: "contest", problems: [
        { id: "p257", name: "Weekly / Biweekly Contest", lcNumber: 0, difficulty: "Medium", url: "https://leetcode.com/contest/", note: "Timed performance test." }
      ]},
      { day: 119, weekday: "Sun", topic: "Rest Day & Personal Project", type: "rest", problems: [] }
    ]
  },
  {
    week: 18,
    title: "Mock Interviews & Weak Topics — P2",
    topic: "Mock Hard Revision",
    days: [
      { day: 120, weekday: "Mon", topic: "DP Revision", type: "regular", problems: [
        { id: "p258", name: "Coin Change II", lcNumber: 518, difficulty: "Medium", url: "https://leetcode.com/problems/coin-change-ii/", note: "Unbounded knapsack combinations count." },
        { id: "p259", name: "Best Time to Buy & Sell Stock III", lcNumber: 123, difficulty: "Hard", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/", note: "At most 2 transactions state DP." },
        { id: "p260", name: "Minimum Score Triangulation", lcNumber: 1039, difficulty: "Medium", url: "https://leetcode.com/problems/minimum-score-triangulation-of-polygon/", note: "Polygon interval MCM DP." }
      ]},
      { day: 121, weekday: "Tue", topic: "Greedy & Stack Revision", type: "regular", problems: [
        { id: "p261", name: "Valid Parenthesis String", lcNumber: 678, difficulty: "Medium", url: "https://leetcode.com/problems/valid-parenthesis-string/", note: "Min/Max open count tracking." },
        { id: "p262", name: "Car Fleet", lcNumber: 853, difficulty: "Medium", url: "https://leetcode.com/problems/car-fleet/", note: "Sort position + arrival time stack." },
        { id: "p263", name: "Minimum Number of Refueling Stops", lcNumber: 871, difficulty: "Hard", url: "https://leetcode.com/problems/minimum-number-of-refueling-stops/", note: "Max heap station fuel greedy." }
      ]},
      { day: 122, weekday: "Wed", topic: "Mock Session 3", type: "regular", problems: [
        { id: "p264", name: "Number of LIS", lcNumber: 673, difficulty: "Medium", url: "https://leetcode.com/problems/number-of-longest-increasing-subsequence/", note: "Length + count DP tracking." },
        { id: "p265", name: "Shortest Path Visiting All Nodes", lcNumber: 847, difficulty: "Hard", url: "https://leetcode.com/problems/shortest-path-visiting-all-nodes/", note: "BFS + Bitmask state graph." },
        { id: "p266", name: "Word Ladder II", lcNumber: 126, difficulty: "Hard", url: "https://leetcode.com/problems/word-ladder-ii/", note: "BFS shortest path + DFS backtrack paths." }
      ]},
      { day: 123, weekday: "Thu", topic: "Review & Sweepline", type: "review", problems: [
        { id: "p267", name: "Coin Change II (BLIND RE-SOLVE)", lcNumber: 518, difficulty: "Medium", url: "https://leetcode.com/problems/coin-change-ii/", note: "Re-solve outer coin loop logic.", isReview: true },
        { id: "p268", name: "Evaluate Division (BLIND RE-SOLVE)", lcNumber: 399, difficulty: "Medium", url: "https://leetcode.com/problems/evaluate-division/", note: "Re-solve weighted DFS.", isReview: true },
        { id: "p269", name: "Minimum Interval Each Query", lcNumber: 1851, difficulty: "Hard", url: "https://leetcode.com/problems/minimum-interval-to-include-each-query/", note: "Sweep line + Min heap queries." }
      ]},
      { day: 124, weekday: "Fri", topic: "Mock Session 4", type: "regular", problems: [
        { id: "p270", name: "Snakes and Ladders", lcNumber: 909, difficulty: "Medium", url: "https://leetcode.com/problems/snakes-and-ladders/", note: "Grid flatten BFS traversal." },
        { id: "p271", name: "Online Stock Span", lcNumber: 901, difficulty: "Medium", url: "https://leetcode.com/problems/online-stock-span/", note: "Streaming monotonic stack." },
        { id: "p272", name: "Maximum Frequency Stack", lcNumber: 895, difficulty: "Hard", url: "https://leetcode.com/problems/maximum-frequency-stack/", note: "Frequency stacks map data structure." }
      ]},
      { day: 125, weekday: "Sat", topic: "LeetCode Contest", type: "contest", problems: [
        { id: "p273", name: "Weekly / Biweekly Contest", lcNumber: 0, difficulty: "Medium", url: "https://leetcode.com/contest/", note: "November Sprint ending!" }
      ]},
      { day: 126, weekday: "Sun", topic: "Rest Day & Personal Project", type: "rest", problems: [] }
    ]
  },
  {
    week: 19,
    title: "Final Sprint — Part 1",
    topic: "Sprint P1",
    days: [
      { day: 127, weekday: "Mon", topic: "Hard DP Sprint", type: "regular", problems: [
        { id: "p274", name: "Cherry Pickup", lcNumber: 741, difficulty: "Hard", url: "https://leetcode.com/problems/cherry-pickup/", note: "Dual path 3D grid DP." },
        { id: "p275", name: "Frog Jump", lcNumber: 403, difficulty: "Hard", url: "https://leetcode.com/problems/frog-jump/", note: "DP + Set jump size state." },
        { id: "p276", name: "Profitable Schemes", lcNumber: 879, difficulty: "Hard", url: "https://leetcode.com/problems/profitable-schemes/", note: "3D Knapsack member & profit constraints." }
      ]},
      { day: 128, weekday: "Tue", topic: "State Machines & Grid Keys", type: "regular", problems: [
        { id: "p277", name: "Count Vowels Permutation", lcNumber: 1220, difficulty: "Medium", url: "https://leetcode.com/problems/count-vowels-permutation/", note: "Vowel transition state machine." },
        { id: "p278", name: "Shortest Path to Get All Keys", lcNumber: 864, difficulty: "Hard", url: "https://leetcode.com/problems/shortest-path-to-get-all-keys/", note: "BFS grid + bitmask key states." },
        { id: "p279", name: "Strange Printer", lcNumber: 664, difficulty: "Hard", url: "https://leetcode.com/problems/strange-printer/", note: "Interval DP printer transitions." }
      ]},
      { day: 129, weekday: "Wed", topic: "Binary Search & Subsequence", type: "regular", problems: [
        { id: "p280", name: "Capacity To Ship Packages", lcNumber: 1011, difficulty: "Medium", url: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/", note: "Binary search on min capacity." },
        { id: "p281", name: "Max Number of Events Attended", lcNumber: 1353, difficulty: "Medium", url: "https://leetcode.com/problems/maximum-number-of-events-that-can-be-attended/", note: "Greedy min heap end day." },
        { id: "p282", name: "Min Operations to Make Subsequence", lcNumber: 1713, difficulty: "Hard", url: "https://leetcode.com/problems/minimum-operations-to-make-a-subsequence/", note: "LCS reduction to LIS log N." }
      ]},
      { day: 130, weekday: "Thu", topic: "Review & Split Array", type: "review", problems: [
        { id: "p283", name: "Cherry Pickup (BLIND RE-SOLVE)", lcNumber: 741, difficulty: "Hard", url: "https://leetcode.com/problems/cherry-pickup/", note: "Re-solve 3D grid states.", isReview: true },
        { id: "p284", name: "Capacity To Ship (BLIND RE-SOLVE)", lcNumber: 1011, difficulty: "Medium", url: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/", note: "Re-solve feasibility check.", isReview: true },
        { id: "p285", name: "Split Array Largest Sum", lcNumber: 410, difficulty: "Hard", url: "https://leetcode.com/problems/split-array-largest-sum/", note: "Binary search on max array split sum." }
      ]},
      { day: 131, weekday: "Fri", topic: "Graph Paths & Prime Factors", type: "regular", problems: [
        { id: "p286", name: "Number of Ways to Arrive at Destination", lcNumber: 1976, difficulty: "Medium", url: "https://leetcode.com/problems/number-of-ways-to-arrive-at-destination/", note: "Dijkstra + shortest path counting." },
        { id: "p287", name: "Largest Component Size by Factor", lcNumber: 952, difficulty: "Hard", url: "https://leetcode.com/problems/largest-component-size-by-common-factor/", note: "DSU + prime factor unioning." },
        { id: "p288", name: "Minimum Difficulty of Job Schedule", lcNumber: 1335, difficulty: "Hard", url: "https://leetcode.com/problems/minimum-difficulty-of-a-job-schedule/", note: "Partition 1D array into D days DP." }
      ]},
      { day: 132, weekday: "Sat", topic: "LeetCode Contest", type: "contest", problems: [
        { id: "p289", name: "Weekly / Biweekly Contest", lcNumber: 0, difficulty: "Medium", url: "https://leetcode.com/contest/", note: "Sprint speed check!" }
      ]},
      { day: 133, weekday: "Sun", topic: "Rest Day & Personal Project", type: "rest", problems: [] }
    ]
  },
  {
    week: 20,
    title: "Final Sprint — Part 2 (THE FINISH LINE)",
    topic: "Sprint P2",
    days: [
      { day: 134, weekday: "Mon", topic: "Sliding Window Medians", type: "regular", problems: [
        { id: "p290", name: "Sliding Window Median", lcNumber: 480, difficulty: "Hard", url: "https://leetcode.com/problems/sliding-window-median/", note: "Dual heap lazy removal sliding window." },
        { id: "p291", name: "Count of Range Sum", lcNumber: 327, difficulty: "Hard", url: "https://leetcode.com/problems/count-of-range-sum/", note: "Prefix sums merge sort counting." },
        { id: "p292", name: "My Calendar I", lcNumber: 729, difficulty: "Medium", url: "https://leetcode.com/problems/my-calendar-i/", note: "Interval booking balanced tree." }
      ]},
      { day: 135, weekday: "Tue", topic: "Ratio Greedy & Race Cars", type: "regular", problems: [
        { id: "p293", name: "Minimum Cost to Hire K Workers", lcNumber: 857, difficulty: "Hard", url: "https://leetcode.com/problems/minimum-cost-to-hire-k-workers/", note: "Sort ratio + max heap quality total." },
        { id: "p294", name: "Race Car", lcNumber: 818, difficulty: "Hard", url: "https://leetcode.com/problems/race-car/", note: "Position/speed state BFS." },
        { id: "p295", name: "Find K-th Smallest Pair Distance", lcNumber: 719, difficulty: "Hard", url: "https://leetcode.com/problems/find-k-th-smallest-pair-distance/", note: "Binary search distance + two pointer count." }
      ]},
      { day: 136, weekday: "Wed", topic: "Interval Streams & Trie Hard", type: "regular", problems: [
        { id: "p296", name: "Data Stream as Disjoint Intervals", lcNumber: 352, difficulty: "Hard", url: "https://leetcode.com/problems/data-stream-as-disjoint-intervals/", note: "Dynamic interval merging tree." },
        { id: "p297", name: "Stamping The Sequence", lcNumber: 936, difficulty: "Hard", url: "https://leetcode.com/problems/stamping-the-sequence/", note: "Reverse stamp matching process." },
        { id: "p298", name: "Prefix and Suffix Search", lcNumber: 745, difficulty: "Hard", url: "https://leetcode.com/problems/prefix-and-suffix-search/", note: "Suffix # prefix trie wrapping." }
      ]},
      { day: 137, weekday: "Thu", topic: "Final Review & Swapped BST", type: "review", problems: [
        { id: "p299", name: "Split Array Largest Sum (BLIND)", lcNumber: 410, difficulty: "Hard", url: "https://leetcode.com/problems/split-array-largest-sum/", note: "Re-solve binary search check.", isReview: true },
        { id: "p300", name: "Min Cost Hire K Workers (BLIND)", lcNumber: 857, difficulty: "Hard", url: "https://leetcode.com/problems/minimum-cost-to-hire-k-workers/", note: "Re-solve heap trim.", isReview: true },
        { id: "p301", name: "Recover Binary Search Tree", lcNumber: 99, difficulty: "Medium", url: "https://leetcode.com/problems/recover-binary-search-tree/", note: "Inorder pointer swap repair." }
      ]},
      { day: 138, weekday: "Fri", topic: "THE FINAL SPRINT DAY 🏁", type: "regular", problems: [
        { id: "p302", name: "Subarrays with K Different Integers", lcNumber: 992, difficulty: "Hard", url: "https://leetcode.com/problems/subarrays-with-k-different-integers/", note: "exactly(K) = atMost(K) - atMost(K-1)." },
        { id: "p303", name: "Shortest Path Alternating Colors", lcNumber: 1129, difficulty: "Medium", url: "https://leetcode.com/problems/shortest-path-with-alternating-colors/", note: "Node + color state BFS." },
        { id: "p304", name: "Basic Calculator", lcNumber: 224, difficulty: "Hard", url: "https://leetcode.com/problems/basic-calculator/", note: "Full stack parenthesis sign evaluation." }
      ]},
      { day: 139, weekday: "Sat", topic: "FINAL CONTEST DAY 🏆", type: "contest", problems: [
        { id: "p305", name: "Final Live Contest", lcNumber: 0, difficulty: "Medium", url: "https://leetcode.com/contest/", note: "THE ULTIMATE TEST. Solve 3 problems!" }
      ]},
      { day: 140, weekday: "Sun", topic: "20 WEEKS COMPLETED — PLACEMENT READY! 🎉", type: "rest", problems: [] }
    ]
  }
];
