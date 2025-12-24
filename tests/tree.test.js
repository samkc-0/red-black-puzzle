const { isTree, isTreeReasonCode } = require('../public/tree.js');

describe('isTree', () => {
  it('should return true for a valid tree', () => {
    const nodes = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const links = [{ source: 1, target: 2 }, { source: 1, target: 3 }];
    expect(isTree(nodes, links, 1)).toEqual({ isTree: true });
  });

  it('should return false for a graph with a cycle', () => {
    const nodes = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const links = [{ source: 1, target: 2 }, { source: 2, target: 3 }, { source: 3, target: 1 }];
    const result = isTree(nodes, links, 1);
    expect(result.isTree).toBe(false);
    expect(result.reason.code).toBe(isTreeReasonCode.CYCLE_DETECTED);
  });

  it('should return false for a graph with a node that has two parents', () => {
    const nodes = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const links = [{ source: 1, target: 3 }, { source: 2, target: 3 }];
    const result = isTree(nodes, links, 1);
    expect(result.isTree).toBe(false);
    expect(result.reason.code).toBe(isTreeReasonCode.MULTIPLE_PARENTS);
  });

  it('should return false for a disconnected graph', () => {
    const nodes = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
    const links = [{ source: 1, target: 2 }];
    const result = isTree(nodes, links, 1);
    expect(result.isTree).toBe(false);
    expect(result.reason.code).toBe(isTreeReasonCode.DISCONNECTED_NODES);
  });

  it('should return true for an empty graph', () => {
    const nodes = [];
    const links = [];
    expect(isTree(nodes, links, null)).toEqual({ isTree: true });
  });

  it('should return true for a graph with a single node', () => {
    const nodes = [{ id: 1 }];
    const links = [];
    expect(isTree(nodes, links, 1)).toEqual({ isTree: true });
  });
});
