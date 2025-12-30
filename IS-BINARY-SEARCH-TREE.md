Here is the updated, succinct, and complete checklist, with adjacency explicitly required for parent–child relationships.

⸻

Checklist: Validating a Geometric Binary Search Tree

Given
	•	A graph of nodes with (x, y, value, uuid)
	•	A provided root node UUID
	•	Geometry rules:
	•	Children have higher y than parents
	•	Left child has lower x than right child
	•	Children must be adjacent to their parent

⸻

1. Root & Graph Integrity
	•	☐ Root UUID exists
	•	☐ Root has no parent
	•	☐ Every non-root node has exactly one parent
	•	☐ All nodes are reachable from the root
	•	☐ No cycles

⸻

2. Adjacency Constraint (Critical)

For each node P:
	•	☐ A node C can be a child of P only if C is adjacent to P in the graph
	•	☐ No child relationship is inferred purely from geometry without adjacency
	•	☐ Every adjacency edge is used at most once as a parent–child edge

⸻

3. Parent → Child Inference (Using Adjacency + Geometry)

For each parent node P:
	•	☐ Candidate children are nodes that:
	•	☐ Are adjacent to P
	•	☐ Have y > P.y
	•	☐ At most two such candidates exist
	•	☐ If two candidates exist:
	•	☐ One has lower x (left), one higher x (right)
	•	☐ If one candidate exists:
	•	☐ It is assigned left or right unambiguously by x
	•	☐ No adjacent node violates child.y > parent.y

⸻

4. Left / Right Assignment Consistency
	•	☐ Each child is assigned exactly one role: left or right
	•	☐ No node is assigned to multiple parents
	•	☐ No node occupies both left and right positions
	•	☐ Parent has at most:
	•	☐ one left child
	•	☐ one right child

⸻

5. Binary Search Tree Ordering Rules

For every node N with value v:
	•	☐ All values in the left subtree are strictly less than v
	•	☐ All values in the right subtree are strictly greater than v
	•	☐ Ordering holds transitively (use DFS with (min, max) bounds)

⸻

6. Geometry Consistency (Sanity Checks)

For every inferred parent P:
	•	☐ left.x < P.x < right.x (when both exist)
	•	☐ child.y > P.y
	•	☐ No adjacent node violates BST side constraints:
	•	☐ A left child must not have x ≥ P.x
	•	☐ A right child must not have x ≤ P.x

⸻

7. Traversal Validation (Optional but Strong)
	•	☐ In-order traversal yields a strictly increasing sequence
	•	☐ Traversal visits all nodes exactly once

⸻

8. Data Validity
	•	☐ All node values are comparable and non-null
	•	☐ No duplicate values (if BST requires uniqueness)
	•	☐ All adjacency edges are consistent with inferred hierarchy

⸻

✅ The graph is a valid BST iff all checks pass

If you want next steps, I can:
	•	Reduce this to a single DFS algorithm
	•	Provide formal invariants
	•	Write language-agnostic pseudocode
	•	Add precise failure reasons per check
