import { DetailedLessonModule } from "./types";

export const dsaModules: Record<string, DetailedLessonModule> = {
  // Phase 1.1: Big-O, Big-Omega & Asymptotic Bounds
  "big_o_asymptotic_bounds": {
    topicId: "dsa_1_1",
    title: "Big-O, Big-Omega & Asymptotic Bounds",
    subtitle: "Analyze worst-case (O), best-case (Ω), and tight-bound (Θ) time and space complexity.",
    domain: "Data Structures & Algorithms",
    phaseName: "Foundation",
    duration: "30m",
    type: "concept",
    keyObjectives: [
      "Distinguish Big-O (upper bound), Big-Omega (lower bound), and Big-Theta (tight bound).",
      "Analyze amortized time complexity in dynamically resizing arrays (geometric doubling).",
      "Calculate memory call stack frames in recursive algorithms.",
      "Recognize standard algorithmic complexity hierarchies: O(1) < O(log N) < O(N) < O(N log N) < O(N²) < O(2ⁿ).",
    ],
    deepDive: {
      overview:
        "Asymptotic analysis evaluates algorithmic efficiency as input size N grows toward infinity. It abstracts hardware clock speeds and compiler differences to provide a mathematical guarantee of scalability.",
      mentalModel:
        "Imagine measuring vehicle speed. Benchmarking measures how fast a car drives today in city traffic; asymptotic complexity describes the physical laws of aerodynamic drag on that car as speed approaches infinity.",
      coreConcepts: [
        {
          title: "Amortized Analysis & Dynamic Arrays",
          description:
            "When an array doubles its capacity from N to 2N, it incurs an O(N) copy cost. However, because this occurs only once every N operations, the amortized cost per append remains strictly O(1).",
          highlight: "Amortized O(1) guarantees average constant time over a sequence of operations.",
        },
      ],
      pitfalls: [
        "Confusing worst-case time with average-case time: QuickSort is O(N log N) average case, but O(N²) worst-case without randomized pivot selection.",
      ],
      realWorldApplications:
        "Engineers use asymptotic analysis to prevent algorithmic denial of service (DoS) attacks and choose optimal databases for read vs write workloads.",
    },
    codeBlueprint: {
      language: "python",
      languageBadge: "Python 3.12 • DSA",
      filename: "asymptotic_analysis.py",
      code: `def amortized_array_append_simulation(n_operations: int = 1000):
    """
    Demonstrates amortized O(1) cost of dynamic array resizing.
    """
    capacity = 1
    size = 0
    total_copies = 0

    for i in range(1, n_operations + 1):
        if size == capacity:
            # Geometric doubling: allocate 2 * capacity and copy elements
            capacity *= 2
            total_copies += size  # Cost of copying existing elements
        size += 1

    cost_per_op = (total_copies + n_operations) / n_operations
    print(f"Total Operations: {n_operations}")
    print(f"Final Capacity:   {capacity}")
    print(f"Average Amortized Operations per Append: {cost_per_op:.2f} (Strictly O(1))")

if __name__ == "__main__":
    amortized_array_append_simulation(100000)`,
      explanation: "Simulates dynamic array doubling and proves that the average operations per append converge to constant O(1).",
    },
    quizQuestions: [
      {
        question: "What is the amortized time complexity of appending an element to a dynamically resizing list?",
        options: [
          "Amortized O(1), because expensive O(N) resizes happen infrequently with geometric capacity doubling.",
          "Strict O(N) for every single append operation.",
          "O(log N) due to binary tree allocation.",
          "O(N²) due to garbage collection overhead.",
        ],
        correctIndex: 0,
        explanation:
          "Doubling capacity ensures that the sum of copy operations over N appends is approximately 2N, yielding ~2 operations per append (O(1)).",
      },
    ],
    resources: [
      {
        title: "MIT OpenCourseWare: Introduction to Algorithms (Asymptotic Complexity)",
        url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/",
        type: "video",
        description: "Official MIT lecture on mathematical asymptotic notation.",
      },
    ],
  },

  // Phase 1.2: Two-Pointer & Sliding Window Techniques
  "two_pointer_sliding_window": {
    topicId: "dsa_1_2",
    title: "Two-Pointer & Sliding Window Techniques",
    subtitle: "Optimize array and string traversal patterns from quadratic O(N²) to linear O(N).",
    domain: "Data Structures & Algorithms",
    phaseName: "Foundation",
    duration: "45m",
    type: "exercise",
    keyObjectives: [
      "Apply opposite-direction two pointers to sorted arrays (Pair Sum, Trapping Rain Water).",
      "Implement dynamic-size sliding windows with hash frequency maps (Longest Substring Without Repeating Characters).",
      "Formulate invariant window shrinkage conditions.",
      "Achieve strict O(N) time and O(1) or O(K) space complexity.",
    ],
    deepDive: {
      overview:
        "The Two-Pointer and Sliding Window patterns eliminate redundant nested loops by maintaining stateful boundaries that traverse an array unidirectionally. Since each pointer advances at most N times, the total runtime is guaranteed linear O(N).",
      mentalModel:
        "Think of a sliding window as an accordion being dragged across a sidewalk. The right hand stretches forward to swallow new sidewalk tiles, and the left hand contracts when the accordion becomes too full. Neither hand ever steps backwards.",
      coreConcepts: [
        {
          title: "Window Expansion vs Shrinkage",
          description:
            "Expand the right pointer to include elements until a target condition is met (or violated). Then increment the left pointer to restore the invariant, recording the maximum or minimum window length.",
          highlight: "Both pointers move monotonically forward; total pointer moves ≤ 2N.",
        },
      ],
      pitfalls: [
        "Moving the left pointer forward without decrementing its corresponding frequency count from the tracking hash map.",
      ],
      realWorldApplications:
        "Network packet rate limiting, audio signal processing framing, and genomic sequence matching.",
    },
    codeBlueprint: {
      language: "python",
      languageBadge: "Python 3.12 • DSA Pattern",
      filename: "sliding_window.py",
      code: `def length_of_longest_substring_k_distinct(s: str, k: int) -> int:
    """
    Finds length of longest substring with at most k distinct characters.
    Time: O(N) | Space: O(K)
    """
    if not s or k == 0:
        return 0

    char_freq: dict[str, int] = {}
    left = 0
    max_length = 0

    for right in range(len(s)):
        # Expand window: add s[right]
        right_char = s[right]
        char_freq[right_char] = char_freq.get(right_char, 0) + 1

        # Shrink window while distinct characters > k
        while len(char_freq) > k:
            left_char = s[left]
            char_freq[left_char] -= 1
            if char_freq[left_char] == 0:
                del char_freq[left_char]
            left += 1

        max_length = max(max_length, right - left + 1)

    return max_length

if __name__ == "__main__":
    test_str = "eceba"
    print(f"Longest substring with at most 2 distinct chars: {length_of_longest_substring_k_distinct(test_str, 2)}") # Output: 3 ("ece")`,
      explanation: "Classic sliding window pattern expanding right boundary and contracting left boundary while tracking distinct character frequency.",
    },
    quizQuestions: [
      {
        question: "Why is a two-pointer sliding window algorithm guaranteed to run in O(N) time even though it has a nested while loop?",
        options: [
          "Because both the left and right pointers only move forward, each visiting every array index at most once (2N total operations).",
          "Because Python dictionaries perform searches in O(0) time.",
          "Because the array is stored on the GPU.",
          "It is actually O(N²), but looks like O(N).",
        ],
        correctIndex: 0,
        explanation:
          "The inner while loop only increments the left pointer. Since left never moves backward and stops at N, the total number of while loop iterations across the entire algorithm cannot exceed N.",
      },
    ],
    resources: [
      {
        title: "LeetCode Explore: Two Pointers Technique Guide",
        url: "https://leetcode.com/explore/learn/card/array-and-string/205/array-two-pointer-technique/",
        type: "article",
        description: "Comprehensive guide to two-pointer patterns with visual diagrams.",
      },
    ],
  },

  // Phase 4.1: Graph Representations & BFS/DFS
  "graph_representations_bfs_dfs": {
    topicId: "dsa_4_1",
    title: "Graph Representations & BFS/DFS",
    subtitle: "Adjacency list, connected components, cycle detection, and topological sorting.",
    domain: "Data Structures & Algorithms",
    phaseName: "Practice & Projects",
    duration: "45m",
    type: "concept",
    keyObjectives: [
      "Compare Adjacency Matrix O(V²) vs Adjacency List O(V + E) space and traversal complexity.",
      "Implement Breadth-First Search (BFS) using a Queue to compute unweighted shortest paths.",
      "Implement Depth-First Search (DFS) iteratively and recursively with visited states.",
      "Detect cycles in directed graphs using 3-color states (White, Gray, Black) and Kahn's algorithm.",
    ],
    deepDive: {
      overview:
        "Graphs model non-linear relationships between entities (vertices) linked by connections (edges). Traversing graphs systematically requires tracking visited states to prevent infinite loops in cyclic topologies.",
      mentalModel:
        "Imagine dropping a drop of ink into water: BFS expands outward in concentric rings, finding the closest nodes first. DFS is a spelunker descending as deep into a cavern as possible along one tunnel before backtracking when hitting a dead end.",
      coreConcepts: [
        {
          title: "Cycle Detection with Tri-Color DFS",
          description:
            "In directed graphs, mark nodes as Unvisited (0), Currently Visiting on recursion stack (1), or Fully Processed (2). Encountering a node in state 1 indicates a back-edge and therefore a cycle.",
          highlight: "Encountering a node currently on the active recursion call stack proves the presence of a directed cycle.",
        },
      ],
      pitfalls: [
        "Using recursion for very deep graphs without increasing sys.setrecursionlimit(), triggering recursion overflow crashes.",
      ],
      realWorldApplications:
        "Dependency resolution engines (npm, cargo), social network friend recommendations, garbage collection reachability graphs, and route planning.",
    },
    codeBlueprint: {
      language: "python",
      languageBadge: "Python 3.12 • Graph Algorithms",
      filename: "graph_cycle_detection.py",
      code: `from collections import defaultdict

def has_cycle_directed_graph(num_nodes: int, edges: list[tuple[int, int]]) -> bool:
    """
    Detects cycles in a directed graph using 3-color DFS.
    Time: O(V + E) | Space: O(V)
    0 = Unvisited, 1 = Visiting (in current path), 2 = Visited
    """
    adj = defaultdict(list)
    for u, v in edges:
        adj[u].append(v)

    state = [0] * num_nodes

    def dfs(node: int) -> bool:
        state[node] = 1 # Mark as visiting
        for neighbor in adj[node]:
            if state[neighbor] == 1:
                return True # Back-edge found -> Cycle!
            if state[neighbor] == 0:
                if dfs(neighbor):
                    return True
        state[node] = 2 # Mark as fully processed
        return False

    for i in range(num_nodes):
        if state[i] == 0:
            if dfs(i):
                return True
    return False

if __name__ == "__main__":
    cyclic_edges = [(0, 1), (1, 2), (2, 0)]
    print(f"Has Cycle: {has_cycle_directed_graph(3, cyclic_edges)}") # True`,
      explanation: "Tri-color DFS traversal identifying back-edges in directed dependency graphs.",
    },
    quizQuestions: [
      {
        question: "Why is BFS preferred over DFS for finding the shortest path in an unweighted graph?",
        options: [
          "BFS explores nodes level by level, ensuring that the first time a target node is visited, it is via the minimum number of edges.",
          "BFS uses less memory than DFS.",
          "DFS cannot traverse graphs with cycles.",
          "BFS sorts edges by weight automatically.",
        ],
        correctIndex: 0,
        explanation:
          "Because queue FIFO order guarantees vertices at distance d are processed before vertices at distance d+1, the first discovery of any node is strictly its shortest path.",
      },
    ],
    resources: [
      {
        title: "Visualgo: Visualising Graph Structures and Traversals",
        url: "https://visualgo.net/en/dfsbfs",
        type: "repository",
        description: "Interactive visualizer for BFS, DFS, and cycle detection.",
      },
    ],
  },
};
