const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

const nodes = [
    { id: "A" },
    { id: "B" },
    { id: "C" }
];

const links = [
    { source: "A", target: "B" },
    { source: "B", target: "C" },
    { source: "C", target: "A" }
];

const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

const linkGroup = svg.append("g")
    .attr("class", "links");

const node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .enter().append("g")
    .attr("class", "node-group")
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

const circles = node.append("circle")
    .attr("class", "node")
    .attr("r", 20)
    .attr("fill", "black")
    .on("dblclick", (event, d) => {
        const circle = d3.select(event.currentTarget);
        if (circle.attr("fill") === "red") {
            circle.attr("fill", "black");
        } else {
            circle.attr("fill", "red");
        }
    });

const labels = node.append("text")
    .text(d => d.id)
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .attr("fill", "white");

let link;

function update() {
    // Update links
    link = linkGroup.selectAll("line")
        .data(links, d => d.source.id + "-" + d.target.id);

    link.exit().remove();

    link = link.enter().append("line")
        .attr("class", "link")
        .on("click", (event, d) => {
            const index = links.findIndex(l => l.source.id === d.source.id && l.target.id === d.target.id);
            if (index > -1) {
                links.splice(index, 1);
                update();
            }
        })
        .merge(link);

    // Update simulation
    simulation.force("link").links(links);
    simulation.alpha(1).restart();
}

simulation.on("tick", () => {
    if (link) {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
    }

    node
        .attr("transform", d => `translate(${d.x},${d.y})`);
});

function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

update();

