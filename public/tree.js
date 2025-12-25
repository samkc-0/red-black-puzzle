const isTreeReasonCode = {
  NO_ROOT_PROVIDED: 'NO_ROOT_PROVIDED',
  MULTIPLE_PARENTS: 'MULTIPLE_PARENTS',
  CYCLE_DETECTED: 'CYCLE_DETECTED',
  DISCONNECTED_NODES: 'DISCONNECTED_NODES',
};

function isTree(vertices, edges, rootId) {
  // An empty graph is considered a valid tree.
  if (vertices.length === 0) {
    return { isTree: true };
  }

  // If there are vertices but no rootId is provided, it's not a tree
  // unless it's a single vertex with no edges, which is also a valid tree.
  if (!rootId && vertices.length > 0) {
      if (vertices.length == 1 && edges.length === 0)
          return { isTree: true };
    return { isTree: false, reason: { code: isTreeReasonCode.NO_ROOT_PROVIDED, detail: "Please specify a root vertex." }, vertexIds: vertices.map(v => v.id) };
  }

  // Create an adjacency list to represent the graph for cycle detection and reachability.
  const adjacencyList = new Map();
  // Use a map to keep track of each vertex's parent to detect vertices with multiple parents.
  const parentMap = new Map();

  // Initialize adjacency list for all vertices.
  for (const v of vertices) {
    adjacencyList.set(v.id, []);
  }

  console.log("EDGES");
  console.log(edges);
  console.log("ADJACENCY LIST");
  console.log(adjacencyList);

  // Populate adjacency list and check for multiple parents.
  for (const edge of edges) {
    // Add directed edge from source to target.
    adjacencyList.get(edge.source).push(edge.target);
    
    // If the target vertex already has a parent, then it has two parents,
    // which violates the tree property.
    if (parentMap.has(edge.target)) {
      return { isTree: false, reason: { code: isTreeReasonCode.MULTIPLE_PARENTS, detail: "A tree node shouldn't have multiple parents" }, vertexIds: [edge.source, parentMap.get(edge.target), edge.target] };
    }
    // Record the parent of the target vertex.
    parentMap.set(edge.target, edge.source);
  }

  // Sets to keep track of visited vertices and vertices in the current recursion stack
  // for cycle detection using Depth First Search (DFS).
  const visited = new Set(); // Stores all visited vertices in DFS.
  const recursionStack = new Set(); // Stores vertices currently in the recursion stack (path from root).

  // Helper function to detect cycles in the graph using DFS.
  function hasCycle(vertexId) {
    visited.add(vertexId); // Mark the current vertex as visited.
    recursionStack.add(vertexId); // Add the current vertex to the recursion stack.

    // Get neighbors of the current vertex.
    const neighbors = adjacencyList.get(vertexId) || [];
    for (const neighborId of neighbors) {
      // If a neighbor has not been visited, recursively call hasCycle on it.
      if (!visited.has(neighborId)) {
        const cycleResult = hasCycle(neighborId);
        if (cycleResult) {
          return cycleResult;
        }
      } else if (recursionStack.has(neighborId)) {
        return { isTree: false, reason: { code: isTreeReasonCode.CYCLE_DETECTED, detail: "A tree should not have any cycles." }, vertexIds: Array.from(recursionStack).concat([neighborId]) }; // Cycle detected: neighbor is in current recursion stack (back edge).
      }
    }

    recursionStack.delete(vertexId); // Remove the vertex from recursion stack as we backtrack.
    return false; // No cycle found from this vertex.
  }

  // Start DFS from the root to detect cycles and ensure all vertices are reachable.
  const cycleCheck = hasCycle(rootId);
  if (cycleCheck && cycleCheck.isTree === false) {
    return cycleCheck; // If a cycle is detected, it's not a tree.
  }

  // For a graph to be a tree, all vertices must be reachable from the root
  // and there should be no disconnected components.
  // The 'visited' set will contain all vertices reachable from the root.
  // If the size of 'visited' set is not equal to the total number of vertices,
  // it means some vertices are disconnected from the root, thus not a tree.
  if (visited.size !== vertices.length) {
    const disconnectedVertexIds = vertices.filter(v => !visited.has(v.id)).map(v => v.id);
    return { isTree: false, reason: { code: isTreeReasonCode.DISCONNECTED_NODES, detail: "A tree must be connected." }, vertexIds: disconnectedVertexIds };
  }
  return { isTree: true };
}
if (window)
  window.isTree = isTree;

// For Node.js environment, export the function.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { isTree, isTreeReasonCode };
}
