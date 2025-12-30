// public/is-bst.js

(function() {
  const reasonCode = {
    NO_ROOT_PROVIDED: 'NO_ROOT_PROVIDED',
    ROOT_NODE_NOT_FOUND: 'ROOT_NODE_NOT_FOUND',
    MULTIPLE_PARENTS: 'MULTIPLE_PARENTS',
    CYCLE_DETECTED: 'CYCLE_DETECTED', // Note: y-coordinate rule prevents parent-child cycles
    DISCONNECTED_NODES: 'DISCONNECTED_NODES',
    NOT_A_BST: 'NOT_A_BST',
    GEOMETRY_VIOLATION: 'GEOMETRY_VIOLATION',
    ADJACENCY_VIOLATION: 'ADJACENCY_VIOLATION',
    TOO_MANY_CHILDREN: 'TOO_MANY_CHILDREN',
    DUPLICATE_VALUES: 'DUPLICATE_VALUES',
  };

  function isBST(vertices, edges, rootId) {
    if (!vertices || vertices.length === 0) {
      return { isTree: true, reason: { detail: "Empty graph is a valid BST." } };
    }

    if (!rootId) {
      if (vertices.length === 1 && edges.length === 0) {
        return { isTree: true, reason: { detail: "Single node is a valid BST." } };
      }
      return { isTree: false, reason: { code: reasonCode.NO_ROOT_PROVIDED, detail: "Choose a root node by moving it into the dashed circle." }, vertexIds: vertices.map(v => v.id) };
    }
    
    const nodes = new Map(vertices.map(v => [v.id, {...v, inferredLeft: null, inferredRight: null}]));
    
    const rootNode = nodes.get(rootId);
    if (!rootNode) {
      throw new Error(`Invalid root node: ${rootId}`);
    }

    const adj = new Map();
    vertices.forEach(v => adj.set(v.id, new Set()));
    edges.forEach(edge => {
        if (adj.has(edge.source) && adj.has(edge.target)) {
            adj.get(edge.source).add(edge.target);
            adj.get(edge.target).add(edge.source);
        }
    });

    const valueSet = new Set();
    for (const v of vertices) {
        if (valueSet.has(v.value)) {
          const original = valueSet.get(v.value).id;
	  const dupe = v.id;
	  throw new Error(`Duplicata vertex values found with ids ${original} and ${dupe}.`);
        }
        valueSet.add(v.value);
    }

    const parents = new Map();
    const visited = new Set();
    const q = [rootNode];
    visited.add(rootNode.id);

    while (q.length > 0) {
        const p = q.shift();
        
        const adjacentIds = adj.get(p.id) || new Set();
        const candidateChildren = [...adjacentIds]
            .map(id => nodes.get(id))
            .filter(n => n && n.y > p.y);

        const leftChildren = candidateChildren.filter(c => c.x < p.x);
        const rightChildren = candidateChildren.filter(c => c.x > p.x);
        const centerChildren = candidateChildren.filter(c => c.x === p.x);

        if (centerChildren.length > 0) {
            return { isTree: false, reason: { code: reasonCode.GEOMETRY_VIOLATION, detail: `Is node ${centerChildren[0].value} a left or right child?` }, vertexIds: [p.id, centerChildren[0].id] };
        }
        if (leftChildren.length > 1) {
            return { isTree: false, reason: { code: reasonCode.TOO_MANY_CHILDREN, detail: `Node ${p.value} has too many left children.` }, vertexIds: [p.id, ...leftChildren.map(c => c.id)] };
        }
        if (rightChildren.length > 1) {
            return { isTree: false, reason: { code: reasonCode.TOO_MANY_CHILDREN, detail: `Node ${p.value} has too many right children.` }, vertexIds: [p.id, ...rightChildren.map(c => c.id)] };
        }

        const leftChild = leftChildren[0];
        const rightChild = rightChildren[0];
        
        p.inferredLeft = leftChild;
        p.inferredRight = rightChild;

        if (leftChild) {
            if (parents.has(leftChild.id)) {
                return { isTree: false, reason: { code: reasonCode.MULTIPLE_PARENTS, detail: `Node ${leftChild.value} has too many parents.` }, vertexIds: [leftChild.id, p.id, parents.get(leftChild.id)] };
            }
            parents.set(leftChild.id, p.id);
            visited.add(leftChild.id);
            q.push(leftChild);
        }
        if (rightChild) {
            if (parents.has(rightChild.id)) {
                return { isTree: false, reason: { code: reasonCode.MULTIPLE_PARENTS, detail: `Node ${rightChild.value} has too many parents.` }, vertexIds: [rightChild.id, p.id, parents.get(rightChild.id)] };
            }
            parents.set(rightChild.id, p.id);
            visited.add(rightChild.id);
            q.push(rightChild);
        }
    }

    if (visited.size !== vertices.length) {
        const disconnected = vertices.filter(v => !visited.has(v.id));
        return { isTree: false, reason: { code: reasonCode.DISCONNECTED_NODES, detail: "Parent nodes should point to child nodes. Child nodes should not point to parent nodes." }, vertexIds: disconnected.map(v => v.id) };
    }

    function checkBst(node, min, max) {
        if (!node) return null;
        if (node.value <= min) { 
            return { isTree: false, reason: { code: reasonCode.NOT_A_BST, detail: `Right children should to be smaller than their parents.` }, vertexIds: [node.id] };
        }
	if (node.value >= max) {
            return { isTree: false, reason: { code: reasonCode.NOT_A_BST, detail: `Left children should be smaller than their parents.` }, vertexIds: [node.id] };
	} 
        // Adjacency check is implicit in child inference, but we can double check child-parent adjacency.
        if (node.inferredLeft && !adj.get(node.id).has(node.inferredLeft.id)) {
             return { isTree: false, reason: { code: reasonCode.ADJACENCY_VIOLATION, detail: `Node ${node.inferredLeft.value} is not adjacent to its parent ${node.value}.`}, vertexIds: [node.id, node.inferredLeft.id] };
        }
        if (node.inferredRight && !adj.get(node.id).has(node.inferredRight.id)) {
             return { isTree: false, reason: { code: reasonCode.ADJACENCY_VIOLATION, detail: `Node ${node.inferredRight.value} is not adjacent to its parent ${node.value}.`}, vertexIds: [node.id, node.inferredRight.id] };
        }
        
        return checkBst(node.inferredLeft, min, node.value) || checkBst(node.inferredRight, node.value, max);
    }

    const bstViolation = checkBst(rootNode, -Infinity, Infinity);
    if (bstViolation) {
        return bstViolation;
    }

    return { isTree: true };
  }

  if (window) {
    window.isTree = isBST;
    window.isTreeReasonCode = reasonCode;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { isTree: isBST, isTreeReasonCode: reasonCode };
  }
})();
