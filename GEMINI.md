remember we are using bun, not node
Maintain the features to be added and worked on in TODO.md, as a checklist.
prefer CDNs, dont bother with node_modules/ or whatever its called
except for server-side stuff, you can use node_modules for express etc.
files:
- index.html (loads graph.js)
- server.js (serves index.html on 0.0.0.0:9090)
- graph.js (a d3 graph of vertices and edges. you can click and drag the vertices around and the edges are maintained)
- TODO.md (what we're working on)

