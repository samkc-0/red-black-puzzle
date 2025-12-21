this is going to be an app where a user can play with a red-black tree like it's a toy.

1. they are given a random binary tree with ~8-12 nodes, and all the nodes are black.
2. they can detach nodes by clicking on the edge between them.
3. they can toggle a node's color by double clicking on it.
4. they can drag nodes around in space, to arraynge the layout of the tree.
5. they can specify which node is the root, by dragging it onto a dashed 'root' circle.
6. they can reattach a node by clicking on the first node, then the second node to attach it to.
7. when a relevant change is made to the graph/tree, a check is run to see which red-black tree requirements have been met. (

i. Every node is either red or black.
ii. All null nodes are considered black.
iii. A red node does not have a red child.
iv. Every path from a given node to any of its leaf nodes (that is, to any descendant null node) goes through the same number of black nodes.
v. (Conclusion) If a node N has exactly one child, the child must be red. If the child were black, its leaves would sit at a different black depth than N's null node (which is considered black by rule 2), violating requirement 4.

)
and a checklist of all these requirements is shown on screen.

8. when the user has reconfigured the initial binary tree into a valid red-black tree, they have completed the puzzle.

use d3 in a graph.js served from a index.html with bun (use express).

a graph.js has been provided, modify it as needed, and eerything else.

consider that writing unit tests to validate a red black tree can also be used to implement the game.
