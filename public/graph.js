const width = document.body.clientWidth;
const height = document.body.clientHeight;
const RADIUS = 24;
const uuid = Uuid();

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

const makeLinks = (node) => {
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

const makeGraph = (values) => {
  const root = bst(values);
  const nodes = [];
  traverse(root, (n) => nodes.push(n));
  let links = makeLinks(root);
  return { nodes, links };
};

const values = Array.from({ length: 10 }, (_, i) => i);
const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
const graph = makeGraph(shuffle(values));

function clamp(x, lo, hi) {
  return x < lo ? lo : x > hi ? hi : x;
}

let scene = { node: null, link: null, simulation: null };

function setupApp() {
  let selectedNode = null;
  let rootNodeId = null;
  let timeout = null;

  const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);

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
    .data(graph.links)
    .join("line")
    .classed("link", true);

  let nodes = null;

  function refreshNodes() {
    nodes = svg
      .selectAll(".node")
      .data(graph.nodes)
      .join((enter) => {
        const g = enter.append("g").attr("class", "node");
        g.append("circle").attr("r", (d) => d.value + RADIUS);
        g.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .text((d) => d.value ?? "");
        return g;
      })
      .classed("red", (d) => d.red)
      .classed("selected", (d) => d.id === selectedNode?.id)
      .classed("root", (d) => d.id === rootNodeId)
  }

  refreshNodes();

  const simulation = d3
    .forceSimulation()
    .nodes(graph.nodes)
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force(
      "link",
      d3
        .forceLink(graph.links)
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
    graph.links = graph.links.filter(({ id }) => l.id !== id);
    refreshLinks();
  }

  function addLink(sourceNode, targetNode) {
    if (linkExists(sourceNode.id, targetNode.id)) return;
    const newLink = { id: uuid.gen(), source: sourceNode.id, target: targetNode.id };
    graph.links = [...graph.links, newLink];
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
    else addLink(selectedNode, d);
    refreshNodes();
    
  }


  function linkExists(source, target) {
    const sid = typeof source === "object" ? source.id : source;
    const tid = typeof target === "object" ? target.id : target;
    const exists = graph.links.some(
      (l) =>
        (l.source.id === sid && l.target.id === tid) ||
        (l.source.id === tid && l.target.id === sid),
    );
    if (exists) {
      console.log(`Link already exists: ${sid} -> ${tid}. Cancelled.`);
    }
    return exists;
  }

  function tick() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);
    nodes.attr("transform", (d) => `translate(${d.x},${d.y})`);
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
    link = svg
      .selectAll(".link")
      .data(graph.links, (d) => d.id)
      .join(
        (enter) => enter.append("line").classed("link", true).on("click", cut),
        (update) => update,
        (exit) => exit.remove(),
      );
    link.lower();
    simulation.force("link").links(graph.links);
    tick();
  }

  function validateNode(n, parentNode) {
    const childrenIds = graph.links.filter(l => l.source === n.id).map(l => l.id);

    // root node can only have 2 children
    if (parentNode == null && childrenIds.length > 2)
      return false;

    // children must be geome

    // TODO
    return;
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

const app = setupApp();
document.body.appendChild(app);
