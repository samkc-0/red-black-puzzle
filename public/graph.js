const width = document.body.clientWidth;
const height = document.body.clientHeight;
const RADIUS = 24;
const uuid = Uuid();

const validateTree = window.isTree;

const newNode = (value) => {
  return {
    id: uuid.gen(),
    value,
    left: null,
    right: null,
    red: false,
  };
};

const bst = (arr) => {
  const root = newNode(arr[0]);
  for (let i = 1; i < arr.length; i++) {
    insert(root, arr[i]);
  }
  return root;
};


const insert = (node, value) => {
  if (value < node.value) {
    if (node.left === null) {
      node.left = newNode(value);
    } else {
      insert(node.left, value);
    }
    return;
  }
  if (value > node.value) {
    if (node.right === null) {
      node.right = newNode(value);
    } else {
      insert(node.right, value);
    }
  }
  // ignore duplicates
  return;
};

const traverse = (node, callback) => {
  if (!node) return;
  node && callback && callback(node);
  if (node.left != null) {
    traverse(node.left, callback);
  }
  if (node.right != null) {
    traverse(node.right, callback);
  }
};

const makeTreeLinks = (node) => {
  let links = [];
  traverse(node, (n) => {
    if (n.left !== null) {
      links.push({ id: uuid.gen(), source: n.id, target: n.left.id });
    }
    if (n.right !== null) {
      links.push({ id: uuid.gen(), source: n.id, target: n.right.id });
    }
  });
  return links;
};

const makeBSTGraph = (values) => {
  const root = bst(values);
  const vertices = [];
  traverse(root, (v) => vertices.push(v));
  let edges = makeTreeLinks(root);
  return { vertices, edges };
};

const values = Array.from({ length: 10 }, (_, i) => i);
const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const graph = makeBSTGraph(shuffle(values));

function clamp(x, lo, hi) {
  return x < lo ? lo : x > hi ? hi : x;
}

function copyOf(objs) {
  return objs.map(o => ({...o}));
}

function setupPuzzle() {
  let selectedNode = null;
  let rootNodeId = null;
  let timeout = null;
  let edgesSim = copyOf(graph.edges);

  const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);

  svg.append("defs").append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "-0 -2.5 5 5")
    .attr("refX", 5)
    .attr("refY", 0)
    .attr("orient", "auto")
    .attr("markerUnits", "userSpaceOnUse")
    .attr("markerWidth", 15)
    .attr("markerHeight", 15)
    .append("path")
    .attr("d", "M0,-2.5L5,0L0,2.5")
    .attr("fill", "context-stroke");

  const rootCircleDef = {
    cx: width / 2,
    cy: 100,
    r: RADIUS * 2,
  };

  const rootCircle = svg.append("circle")
    .attr("cx", rootCircleDef.cx)
    .attr("cy", rootCircleDef.cy)
    .attr("r", rootCircleDef.r)
    .attr("stroke", "black")
    .attr("stroke-dasharray", "5,5")
    .attr("fill", "none");


  let link = svg
    .selectAll(".link")
    .data(edgesSim)
    .join("line")
    .classed("link", true)
    .attr("marker-end", "url(#arrowhead)");

  let nodes = null;

  function refreshNodes() {
    nodes = svg
      .selectAll(".node")
      .data(graph.vertices)
      .join((enter) => {
        const g = enter.append("g").attr("class", "node");
        g.append("circle").attr("r", (d) => d.value + RADIUS);
        g.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .text((d) => d.value ?? "");
	const { isTree, reason } = validateTree(graph.vertices, graph.edges, rootNodeId);
	if (reason && reason.detail)
	      updateGuide(reason.detail);
	else updateGuide("well done, its a tree!");
        return g;
      })
      .classed("red", (d) => d.red)
      .classed("selected", (d) => d.id === selectedNode?.id)
      .classed("root", (d) => d.id === rootNodeId)
  }

  refreshNodes();

  const simulation = d3
    .forceSimulation()
    .nodes(graph.vertices)
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force(
      "link",
      d3
        .forceLink(edgesSim)
        .id((d) => d.id)
        .distance(200),
    )
    .stop();
  for (let i = 0; i < 300; i++) simulation.tick();
  tick();

  const drag = d3.drag().on("start", dragstart).on("drag", dragged).on("end", dragend);

  nodes
    .call(drag)
    .on("mouseover", hover)
    .on("mouseout", unhover)
    .on("click", onClick);

  link.on("click", cut);

  function cut(_, l) {
    graph.edges = graph.edges.filter(({ id }) => l.id !== id);
    refreshLinks();
  }

  function addEdge(sourceId, targetId) {
    if (!linkExists(sourceNode.id, targetNode.id)){ 
      const newEdge = { id: uuid.gen(), source: sourceId, target: targetId };
      graph.edges = [...graph.edges, newEdge];
    }
    selectedNode = null;
    refreshLinks();
  }

  function onClick(event, d) {
    event.stopPropagation();

    // if no node is selected, select it
    if (selectedNode == null) {
      selectedNode = d;
    }

    // if user clicks the same node, toggle its color
    else if (selectedNode.id === d.id) {
      selectedNode = null;
      toggleRed(d);
    }

    // if a node is selected, create a link
    // between the selected node, and this node
    else addEdge(selectedNode.id, d.id);

    refreshNodes();
    
  }


  function linkExists(source, target) {
    const sid = typeof source === "object" ? source.id : source;
    const tid = typeof target === "object" ? target.id : target;
    const exists = graph.edges.some(
      (l) =>
        (l.source === sid && l.target === tid) ||
        (l.source === tid && l.target === sid),
    );
    if (exists) {
      console.log(`Link already exists: ${sid} -> ${tid}. Cancelled.`);
    }
    return exists;
  }

  function tick() {
    link.each(function(d) {
      const angle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
      const targetRadius = d.target.value + RADIUS;
      const x2 = d.target.x - Math.cos(angle) * (targetRadius);
      const y2 = d.target.y - Math.sin(angle) * (targetRadius);
      d3.select(this)
        .attr("x1", d.source.x)
        .attr("y1", d.source.y)
        .attr("x2", x2)
        .attr("y2", y2);
    });
    nodes.attr("transform", (d) => `translate(${d.x},${d.y})`);

    const nodeData = graph.vertices;
    const overlappingNodes = new Set();

    for (let i = 0; i < nodeData.length; i++) {
      for (let j = i + 1; j < nodeData.length; j++) {
        const nodeA = nodeData[i];
        const nodeB = nodeData[j];
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (nodeA.value + RADIUS) + (nodeB.value + RADIUS);

        if (distance < minDistance) {
          overlappingNodes.add(nodeA.id);
          overlappingNodes.add(nodeB.id);
        }
      }
    }

    nodes.each(function(d) {
      d3.select(this).classed("overlapping", overlappingNodes.has(d.id));
    });
  }

  function toggleRed(d) {
    d.red = !d.red;
  }

  function hover(_, d) {
    d3.select(this).classed("hover", true);
  }

  function unhover(_, d) {
    d3.select(this).classed("hover", false);
  }

  function dragend(event, d) {

    // user must clear the current root node before a new one will snap to the circle
    if (rootNodeId != null && rootNodeId != d.id) return;

    const distance = Math.sqrt(
      Math.pow(d.x - rootCircleDef.cx, 2) + Math.pow(d.y - rootCircleDef.cy, 2)
    );
    if (distance < rootCircleDef.r) {
      d.x = rootCircleDef.cx;
      d.y = rootCircleDef.cy;
      rootNodeId = d.id;
      console.log("new root node is", rootNodeId);
      tick();
    } else {
      if (d.id === rootNodeId) {
        rootNodeId = null;
        console.log("root node unset");
      }
    }
    refreshNodes();
  }

  function dragstart() {
    return;
  }

  function dragged(event, d) {
    d.x = clamp(event.x, 0, width);
    d.y = clamp(event.y, 0, height);
    const distance = Math.sqrt(
      Math.pow(d.x - rootCircleDef.cx, 2) + Math.pow(d.y - rootCircleDef.cy, 2)
    );
    if (distance < rootCircleDef.r) {
      console.log("in root circle");
    }
    tick();
  }

  function refreshLinks() {
    edgesSim = copyOf(graph.edges);
    link = svg
      .selectAll(".link")
      .data(edgesSim, (d) => d.id)
      .join(
        (enter) => enter.append("line").classed("link", true).on("click", cut).attr("marker-end", "url(#arrowhead)"),
        (update) => update,
        (exit) => exit.remove(),
      );
    link.lower();
    simulation.force("link").links(edgesSim);
    tick();
  }

  function updateGuide(text) {
    const guide = document.getElementById("guide");
    guide.textContent = text;
  }

  svg.on("click", () => { selectedNode = null; });

  return svg.node();
}

function Uuid() {
  const existing = new Set();
  const gen = () => {
    let val;
    let tries = 0;
    do {
      val = Math.floor(Math.random() * 10000);
      tries++;
      if (tries > 1000) {
        throw new Error("Could not generate unique id");
      }
    } while (existing.has(val) && tries < 1000);

    existing.add(val);
    return val;
  };
  return { gen };
}

const puzzle = setupPuzzle();
document.body.appendChild(puzzle);
