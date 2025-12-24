function isTree(nodes, links, rootId) {
  // An empty graph is considered a valid tree.
  if (nodes.length === 0) {
    return true;
  }

  // If there are nodes but no rootId is provided, it's not a tree
  // unless it's a single node with no links, which is also a valid tree.
  if (!rootId && nodes.length > 0) {
      if (nodes.length == 1 && links.length === 0)
          return true
    return false;
  }

  // Create an adjacency list to represent the graph for cycle detection and reachability.
  const adjacencyList = new Map();
  // Use a map to keep track of each node's parent to detect nodes with multiple parents.
  const parentMap = new Map();

  // Initialize adjacency list for all nodes.
  for (const node of nodes) {
    adjacencyList.set(node.id, []);
  }

  // Populate adjacency list and check for multiple parents.
  for (const link of links) {
    // Add directed edge from source to target.
    adjacencyList.get(link.source).push(link.target);
    
    // If the target node already has a parent, then it has two parents,
    // which violates the tree property.
    if (parentMap.has(link.target)) {
      return false;
    }
    // Record the parent of the target node.
    parentMap.set(link.target, link.source);
  }

  // Sets to keep track of visited nodes and nodes in the current recursion stack
  // for cycle detection using Depth First Search (DFS).
  const visited = new Set(); // Stores all visited nodes in DFS.
  const recursionStack = new Set(); // Stores nodes currently in the recursion stack (path from root).

  // Helper function to detect cycles in the graph using DFS.
  function hasCycle(nodeId) {
    visited.add(nodeId); // Mark the current node as visited.
    recursionStack.add(nodeId); // Add the current node to the recursion stack.

    // Get neighbors of the current node.
    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighborId of neighbors) {
      // If a neighbor has not been visited, recursively call hasCycle on it.
      if (!visited.has(neighborId)) {
        if (hasCycle(neighborId)) {
          return true; // Cycle found in a deeper path.
        }
      } else if (recursionStack.has(neighborId)) {
        return true; // Cycle detected: neighbor is in current recursion stack (back edge).
      }
    }

    recursionStack.delete(nodeId); // Remove the node from recursion stack as we backtrack.
    return false; // No cycle found from this node.
  }

  // Start DFS from the root to detect cycles and ensure all nodes are reachable.
  if (hasCycle(rootId)) {
    return false; // If a cycle is detected, it's not a tree.
  }

  // For a graph to be a tree, all nodes must be reachable from the root
  // and there should be no disconnected components.
  // The 'visited' set will contain all nodes reachable from the root.
  // If the size of 'visited' set is not equal to the total number of nodes,
  // it means some nodes are disconnected from the root, thus not a tree.
  return visited.size === nodes.length;
}

// For Node.js environment, export the function.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { isTree };
}