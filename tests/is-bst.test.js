// tests/is-bst.test.js

if (typeof window === 'undefined') {
    global.window = {};
}
require('../public/is-bst.js');
const isBST = window.isTree;
const reasonCode = window.isTreeReasonCode;

const makeNode = (id, value, x, y) => ({ id, value, x, y });

describe('isBST', () => {
    // Basic cases
    test('should return true for an empty graph', () => {
        expect(isBST([], [], null)).toEqual({ isTree: true, reason: { detail: 'Empty graph is a valid BST.' } });
    });

    test('should return true for a single node graph without rootId', () => {
        const vertices = [makeNode(1, 10, 100, 100)];
        expect(isBST(vertices, [], null)).toEqual({ isTree: true, reason: { detail: 'Single node is a valid BST.' } });
    });
    
    test('should return true for a single node graph with rootId', () => {
        const vertices = [makeNode(1, 10, 100, 100)];
        expect(isBST(vertices, [], 1)).toEqual({ isTree: true });
    });

    test('should return false if rootId is not provided for a multi-node graph', () => {
        const vertices = [makeNode(1, 10, 100, 100), makeNode(2, 5, 50, 200)];
        const result = isBST(vertices, [], null);
        expect(result.isTree).toBe(false);
        expect(result.reason.code).toBe(reasonCode.NO_ROOT_PROVIDED);
    });

    test('should return false if root node not in vertices', () => {
        const vertices = [makeNode(1, 10, 100, 100)];
        const result = isBST(vertices, [], 999);
        expect(result.isTree).toBe(false);
        expect(result.reason.code).toBe(reasonCode.ROOT_NODE_NOT_FOUND);
    });

    // Valid BST
    test('should identify a valid simple BST', () => {
        const root = makeNode(1, 10, 200, 50);
        const left = makeNode(2, 5, 100, 150);
        const right = makeNode(3, 15, 300, 150);
        const vertices = [root, left, right];
        const edges = [{ source: 1, target: 2 }, { source: 1, target: 3 }];
        expect(isBST(vertices, edges, 1).isTree).toBe(true);
    });

    test('should identify a valid deeper BST', () => {
        const vertices = [
            makeNode(1, 20, 400, 50),
            makeNode(2, 10, 200, 150),
            makeNode(3, 30, 600, 150),
            makeNode(4, 5, 100, 250),
            makeNode(5, 15, 300, 250),
            makeNode(6, 25, 500, 250),
            makeNode(7, 35, 700, 250),
        ];
        const edges = [
            { source: 1, target: 2 }, { source: 1, target: 3 },
            { source: 2, target: 4 }, { source: 2, target: 5 },
            { source: 3, target: 6 }, { source: 3, target: 7 },
        ];
        expect(isBST(vertices, edges, 1).isTree).toBe(true);
    });

    // BST rule violations
    test('should fail if left child value is greater than parent', () => {
        const root = makeNode(1, 10, 200, 50);
        const left = makeNode(2, 12, 100, 150);
        const vertices = [root, left];
        const edges = [{ source: 1, target: 2 }];
        const result = isBST(vertices, edges, 1);
        expect(result.isTree).toBe(false);
        expect(result.reason.code).toBe(reasonCode.NOT_A_BST);
    });

    test('should fail if right child value is smaller than parent', () => {
        const root = makeNode(1, 10, 200, 50);
        const right = makeNode(2, 8, 300, 150);
        const vertices = [root, right];
        const edges = [{ source: 1, target: 2 }];
        const result = isBST(vertices, edges, 1);
        expect(result.isTree).toBe(false);
        expect(result.reason.code).toBe(reasonCode.NOT_A_BST);
    });
    
    test('should fail on deep BST violation', () => {
        const vertices = [
            makeNode(1, 20, 400, 50),
            makeNode(2, 10, 200, 150),
            makeNode(3, 5, 100, 250),
            makeNode(4, 21, 300, 250), // invalid: > 20, but in left subtree
        ];
        const edges = [ { source: 1, target: 2 }, { source: 2, target: 3 }, { source: 2, target: 4 }];
        const result = isBST(vertices, edges, 1);
        expect(result.isTree).toBe(false);
        expect(result.reason.code).toBe(reasonCode.NOT_A_BST);
    });

    test('should fail for duplicate values', () => {
        const root = makeNode(1, 10, 200, 50);
        const left = makeNode(2, 5, 100, 150);
        const right = makeNode(3, 5, 300, 150);
        const vertices = [root, left, right];
        const edges = [{ source: 1, target: 2 }, { source: 1, target: 3 }];
        const result = isBST(vertices, edges, 1);
        expect(result.isTree).toBe(false);
        expect(result.reason.code).toBe(reasonCode.DUPLICATE_VALUES);
    });
    
    // Geometry rule violations
    test('should fail if child y is not greater than parent y', () => {
        const root = makeNode(1, 10, 200, 50);
        const left = makeNode(2, 5, 100, 30);
        const vertices = [root, left];
        const edges = [{ source: 1, target: 2 }];
        const result = isBST(vertices, edges, 1);
        expect(result.isTree).toBe(false);
        expect(result.reason.code).toBe(reasonCode.DISCONNECTED_NODES); // because it's not a valid child candidate
    });

    test('should fail if left child x is not smaller than parent x', () => {
        const root = makeNode(1, 10, 200, 50);
        const left = makeNode(2, 5, 250, 150);
        const vertices = [root, left];
        const edges = [{ source: 1, target: 2 }];
        const result = isBST(vertices, edges, 1);
        expect(result.isTree).toBe(false);
        expect(result.reason.code).toBe(reasonCode.NOT_A_BST);
    });
    
    test('should fail if child x is same as parent x', () => {
        const root = makeNode(1, 10, 200, 50);
        const child = makeNode(2, 5, 200, 150);
        const vertices = [root, child];
        const edges = [{ source: 1, target: 2 }];
        const result = isBST(vertices, edges, 1);
        expect(result.isTree).toBe(false);
        expect(result.reason.code).toBe(reasonCode.GEOMETRY_VIOLATION);
    });

    // Tree structure violations
    test('should fail if a node has more than two children', () => {
        const root = makeNode(1, 20, 200, 50);
        const left = makeNode(2, 10, 100, 150);
        const right = makeNode(3, 30, 300, 150);
        const extra = makeNode(4, 40, 400, 150);
        const vertices = [root, left, right, extra];
        const edges = [{ source: 1, target: 2 }, { source: 1, target: 3 }, { source: 1, target: 4 }];
        const result = isBST(vertices, edges, 1);
        expect(result.isTree).toBe(false);
        expect(result.reason.code).toBe(reasonCode.TOO_MANY_CHILDREN);
    });

    test('should fail if a node has two left children', () => {
        const root = makeNode(1, 10, 200, 50);
        const left1 = makeNode(2, 5, 100, 150);
        const left2 = makeNode(3, 7, 120, 160);
        const vertices = [root, left1, left2];
        const edges = [{ source: 1, target: 2 }, { source: 1, target: 3 }];
        const result = isBST(vertices, edges, 1);
        expect(result.isTree).toBe(false);
        expect(result.reason.code).toBe(reasonCode.TOO_MANY_CHILDREN);
    });
    
    test('should fail if there are disconnected nodes', () => {
        const root = makeNode(1, 10, 200, 50);
        const left = makeNode(2, 5, 100, 150);
        const disconnected = makeNode(3, 30, 500, 100);
        const vertices = [root, left, disconnected];
        const edges = [{ source: 1, target: 2 }];
        const result = isBST(vertices, edges, 1);
        expect(result.isTree).toBe(false);
        expect(result.reason.code).toBe(reasonCode.DISCONNECTED_NODES);
    });
    
    test('should fail if a node could have multiple parents', () => {
        const A = makeNode(1, 20, 200, 100);
        const B = makeNode(2, 40, 400, 100);
        const C = makeNode(3, 30, 300, 200);
        const root = makeNode(4, 35, 300, 50);
        const vertices = [A, B, C, root];
        const edges = [ {source:4, target:1}, {source:4, target:2}, {source:1, target:3}, {source:2, target:3} ];
        const result = isBST(vertices, edges, 4);
        expect(result.isTree).toBe(false);
        expect(result.reason.code).toBe(reasonCode.MULTIPLE_PARENTS);
    });

    // Adjacency
    test('should fail if child is not adjacent to parent', () => {
        const root = makeNode(1, 10, 200, 50);
        const left = makeNode(2, 5, 100, 150);
        const right = makeNode(3, 15, 300, 150);
        const vertices = [root, left, right];
        const edges = [{ source: 1, target: 2 }]; // missing edge to right child
        const result = isBST(vertices, edges, 1);
        expect(result.isTree).toBe(false);
        expect(result.reason.code).toBe(reasonCode.DISCONNECTED_NODES);
    });

});
