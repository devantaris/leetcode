// GrindOS — Company to Problem Mappings
// High-signal placement tag associations for top hiring tech companies

import type { CompanyTag } from '../types';

export const COMPANY_MAPPINGS: Record<number, CompanyTag[]> = {
  // Arrays & Strings
  1: ['amazon', 'google', 'microsoft', 'meta', 'apple', 'uber'], // Two Sum
  2: ['amazon', 'microsoft', 'google'], // Add Two Numbers
  3: ['amazon', 'google', 'microsoft', 'meta', 'uber'], // Longest Substring Without Repeating Characters
  4: ['google', 'amazon', 'microsoft'], // Median of Two Sorted Arrays
  5: ['amazon', 'microsoft', 'meta'], // Longest Palindromic Substring
  11: ['amazon', 'google', 'meta'], // Container With Most Water
  15: ['amazon', 'google', 'microsoft', 'meta', 'uber', 'apple'], // 3Sum
  20: ['amazon', 'microsoft', 'google', 'meta', 'apple'], // Valid Parentheses
  21: ['amazon', 'microsoft', 'apple', 'google'], // Merge Two Sorted Lists
  23: ['amazon', 'google', 'microsoft', 'meta'], // Merge k Sorted Lists
  26: ['amazon', 'microsoft'], // Remove Duplicates from Sorted Array
  33: ['amazon', 'google', 'meta', 'uber', 'microsoft'], // Search in Rotated Sorted Array
  42: ['google', 'amazon', 'meta', 'uber', 'apple'], // Trapping Rain Water
  49: ['amazon', 'meta', 'google', 'microsoft'], // Group Anagrams
  53: ['amazon', 'microsoft', 'apple', 'google'], // Maximum Subarray
  54: ['microsoft', 'google', 'uber'], // Spiral Matrix
  56: ['amazon', 'meta', 'google', 'microsoft', 'uber'], // Merge Intervals
  70: ['amazon', 'apple', 'google'], // Climbing Stairs
  72: ['google', 'amazon', 'microsoft'], // Edit Distance
  76: ['google', 'meta', 'amazon'], // Minimum Window Substring
  79: ['amazon', 'microsoft', 'google'], // Word Search
  84: ['google', 'amazon'], // Largest Rectangle in Histogram
  88: ['microsoft', 'amazon', 'meta'], // Merge Sorted Array
  98: ['amazon', 'microsoft', 'meta'], // Validate Binary Search Tree
  102: ['amazon', 'microsoft', 'meta'], // Binary Tree Level Order Traversal
  105: ['amazon', 'google', 'meta'], // Construct Binary Tree from Preorder and Inorder Traversal
  121: ['amazon', 'microsoft', 'meta', 'apple', 'google'], // Best Time to Buy and Sell Stock
  124: ['google', 'meta', 'uber', 'microsoft'], // Binary Tree Maximum Path Sum
  125: ['meta', 'microsoft', 'amazon'], // Valid Palindrome
  127: ['amazon', 'google'], // Word Ladder
  138: ['amazon', 'microsoft', 'meta'], // Copy List with Random Pointer
  139: ['amazon', 'meta', 'google', 'microsoft'], // Word Break
  146: ['amazon', 'google', 'microsoft', 'meta', 'uber', 'apple'], // LRU Cache
  152: ['amazon', 'google'], // Maximum Product Subarray
  155: ['amazon', 'microsoft', 'meta'], // Min Stack
  167: ['amazon', 'meta'], // Two Sum II
  189: ['amazon', 'microsoft'], // Rotate Array
  198: ['amazon', 'apple', 'google'], // House Robber
  199: ['meta', 'amazon'], // Binary Tree Right Side View
  200: ['amazon', 'google', 'microsoft', 'meta', 'uber', 'apple'], // Number of Islands
  206: ['amazon', 'microsoft', 'uber', 'apple'], // Reverse Linked List
  207: ['amazon', 'uber', 'google', 'microsoft'], // Course Schedule
  208: ['google', 'amazon', 'microsoft'], // Implement Trie
  215: ['meta', 'amazon', 'microsoft', 'uber'], // Kth Largest Element
  217: ['amazon', 'apple'], // Contains Duplicate
  226: ['google', 'amazon'], // Invert Binary Tree
  230: ['amazon', 'microsoft'], // Kth Smallest Element in a BST
  236: ['amazon', 'meta', 'microsoft'], // Lowest Common Ancestor
  238: ['amazon', 'meta', 'apple', 'microsoft'], // Product of Array Except Self
  239: ['amazon', 'google'], // Sliding Window Maximum
  253: ['amazon', 'uber', 'meta', 'google'], // Meeting Rooms II
  283: ['meta', 'apple', 'amazon'], // Move Zeroes
  287: ['amazon', 'google'], // Find the Duplicate Number
  295: ['amazon', 'google', 'meta'], // Find Median from Data Stream
  297: ['amazon', 'google', 'meta', 'microsoft'], // Serialize and Deserialize Binary Tree
  300: ['google', 'amazon', 'apple'], // Longest Increasing Subsequence
  322: ['amazon', 'microsoft', 'apple', 'google'], // Coin Change
  347: ['amazon', 'meta', 'google'], // Top K Frequent Elements
  543: ['meta', 'microsoft', 'amazon'], // Diameter of Binary Tree
  560: ['meta', 'amazon', 'google'], // Subarray Sum Equals K
  680: ['meta', 'amazon'], // Valid Palindrome II
  739: ['amazon', 'meta'], // Daily Temperatures
  973: ['meta', 'amazon', 'google'], // K Closest Points to Origin
  986: ['meta', 'amazon'], // Interval List Intersections
  1143: ['amazon', 'google'], // Longest Common Subsequence
  1235: ['uber', 'google'], // Maximum Profit in Job Scheduling

  // Additional High-Frequency Top 150 Mappings (Adobe, Netflix, Apple, Uber)
  13: ['adobe', 'amazon', 'apple'], // Roman to Integer
  14: ['adobe', 'apple', 'google'], // Longest Common Prefix
  122: ['amazon', 'netflix', 'meta'], // Best Time to Buy and Sell Stock II
  150: ['netflix', 'amazon', 'meta'], // Evaluate Reverse Polish Notation
  151: ['microsoft', 'adobe', 'apple'], // Reverse Words in a String
  191: ['apple', 'adobe', 'microsoft'], // Number of 1 Bits
  228: ['adobe', 'apple'], // Summary Ranges
  242: ['uber', 'adobe', 'amazon'], // Valid Anagram
  380: ['meta', 'netflix', 'amazon', 'google', 'uber'], // Insert Delete GetRandom O(1)
  383: ['amazon', 'apple', 'adobe'], // Ransom Note
  392: ['netflix', 'google'], // Is Subsequence
  399: ['google', 'amazon', 'uber'], // Evaluate Division
  452: ['adobe', 'amazon'], // Minimum Number of Arrows to Burst Balloons
  637: ['meta', 'adobe'], // Average of Levels in Binary Tree
  909: ['amazon', 'uber'], // Snakes and Ladders
  918: ['amazon', 'adobe'], // Maximum Sum Circular Subarray
};

export const COMPANY_LABELS: Record<CompanyTag, { name: string; color: string; badge: string }> = {
  amazon: { name: 'Amazon', color: 'border-amber-500/30 bg-amber-500/10 text-amber-400', badge: 'AMZN' },
  google: { name: 'Google', color: 'border-blue-500/30 bg-blue-500/10 text-blue-400', badge: 'GOOG' },
  microsoft: { name: 'Microsoft', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400', badge: 'MSFT' },
  meta: { name: 'Meta', color: 'border-sky-500/30 bg-sky-500/10 text-sky-400', badge: 'META' },
  apple: { name: 'Apple', color: 'border-slate-400/30 bg-slate-400/10 text-slate-300', badge: 'AAPL' },
  uber: { name: 'Uber', color: 'border-purple-500/30 bg-purple-500/10 text-purple-400', badge: 'UBER' },
  adobe: { name: 'Adobe', color: 'border-rose-500/30 bg-rose-500/10 text-rose-400', badge: 'ADBE' },
  netflix: { name: 'Netflix', color: 'border-red-500/30 bg-red-500/10 text-red-400', badge: 'NFLX' },
};
