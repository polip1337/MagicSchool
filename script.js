// Canvas setup
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const scale = 20; // Grid scale; adjust based on your image

// Load background image
const backgroundImage = new Image();
backgroundImage.src = 'map.jpg'; // Replace with your image path
backgroundImage.onload = function() {
    drawMap();
};

// Define nodes (key points on the map, in grid units)
const nodes = [
    { id: 'CC', x: 25, y: 20 },
    { id: 'CN', x: 25, y: 16 }, { id: 'CNE', x: 29, y: 16 }, { id: 'CE', x: 29, y: 20 },
    { id: 'CSE', x: 29, y: 24 }, { id: 'CS', x: 25, y: 24 }, { id: 'CSW', x: 21, y: 24 },
    { id: 'CW', x: 21, y: 20 }, { id: 'CNW', x: 21, y: 16 },
    { id: 'RDN', x: 25, y: 14 }, { id: 'RDNE', x: 30, y: 14 }, { id: 'RDE', x: 30, y: 20 },
    { id: 'RDSE', x: 30, y: 26 }, { id: 'RDS', x: 25, y: 26 }, { id: 'RDSW', x: 20, y: 26 },
    { id: 'RDW', x: 20, y: 20 }, { id: 'RDNW', x: 20, y: 14 },
    { id: 'RN', x: 25, y: 11 }, { id: 'RNE', x: 33, y: 11 }, { id: 'RE', x: 33, y: 20 },
    { id: 'RSE', x: 33, y: 29 }, { id: 'RS', x: 25, y: 29 }, { id: 'RSW', x: 17, y: 29 },
    { id: 'RW', x: 17, y: 20 }, { id: 'RNW', x: 17, y: 11 },
    { id: 'NE', x: 25, y: 8 }, { id: 'SE', x: 25, y: 32 }, { id: 'EE', x: 36, y: 20 },
    { id: 'WE', x: 14, y: 20 }, { id: 'F', x: 15, y: 35 }, { id: 'G', x: 15, y: 5 },
    { id: 'RO', x: 35, y: 5 }
];

// Define edges (corridors connecting nodes, bidirectional)
const edges = [
    { from: 'CC', to: 'CN', distance: 4 }, { from: 'CC', to: 'CNE', distance: 5.66 },
    { from: 'CC', to: 'CE', distance: 4 }, { from: 'CC', to: 'CSE', distance: 5.66 },
    { from: 'CC', to: 'CS', distance: 4 }, { from: 'CC', to: 'CSW', distance: 5.66 },
    { from: 'CC', to: 'CW', distance: 4 }, { from: 'CC', to: 'CNW', distance: 5.66 },
    { from: 'CN', to: 'CNE', distance: 4 }, { from: 'CNE', to: 'CE', distance: 4 },
    { from: 'CE', to: 'CSE', distance: 4 }, { from: 'CSE', to: 'CS', distance: 4 },
    { from: 'CS', to: 'CSW', distance: 4 }, { from: 'CSW', to: 'CW', distance: 4 },
    { from: 'CW', to: 'CNW', distance: 4 }, { from: 'CNW', to: 'CN', distance: 4 },
    { from: 'CN', to: 'RDN', distance: 2 }, { from: 'CNE', to: 'RDNE', distance: 2.24 },
    { from: 'CE', to: 'RDE', distance: 1 }, { from: 'CSE', to: 'RDSE', distance: 2.24 },
    { from: 'CS', to: 'RDS', distance: 2 }, { from: 'CSW', to: 'RDSW', distance: 2.24 },
    { from: 'CW', to: 'RDW', distance: 1 }, { from: 'CNW', to: 'RDNW', distance: 2.24 },
    { from: 'RDN', to: 'RN', distance: 3 }, { from: 'RDNE', to: 'RNE', distance: 3 },
    { from: 'RDE', to: 'RE', distance: 3 }, { from: 'RDSE', to: 'RSE', distance: 3 },
    { from: 'RDS', to: 'RS', distance: 3 }, { from: 'RDSW', to: 'RSW', distance: 3 },
    { from: 'RDW', to: 'RW', distance: 3 }, { from: 'RDNW', to: 'RNW', distance: 3 },
    { from: 'NE', to: 'RN', distance: 3 }, { from: 'SE', to: 'RS', distance: 3 },
    { from: 'EE', to: 'RE', distance: 3 }, { from: 'WE', to: 'RW', distance: 3 },
    { from: 'SE', to: 'F', distance: 10.44 }, { from: 'NE', to: 'G', distance: 10.44 },
    { from: 'EE', to: 'RO', distance: 15.03 }
];
const reverseEdges = edges.map(e => ({ from: e.to, to: e.from, distance: e.distance }));
edges.push(...reverseEdges);

// Define clickable destinations (e.g., rooms)
const destinations = [
    { id: 'RN', rect: { x: 22, y: 8, w: 6, h: 6 }, name: 'North Room' },
    { id: 'RNE', rect: { x: 30, y: 8, w: 6, h: 6 }, name: 'Northeast Room' },
    { id: 'RE', rect: { x: 30, y: 17, w: 6, h: 6 }, name: 'East Room' },
    { id: 'RSE', rect: { x: 30, y: 26, w: 6, h: 6 }, name: 'Southeast Room' },
    { id: 'RS', rect: { x: 22, y: 26, w: 6, h: 6 }, name: 'South Room' },
    { id: 'RSW', rect: { x: 14, y: 26, w: 6, h: 6 }, name: 'Southwest Room' },
    { id: 'RW', rect: { x: 14, y: 17, w: 6, h: 6 }, name: 'West Room' },
    { id: 'RNW', rect: { x: 14, y: 8, w: 6, h: 6 }, name: 'Northwest Room' }
];

// State variables
let currentNode = 'CC'; // Starting position
let dotX = nodes.find(n => n.id === 'CC').x * scale;
let dotY = nodes.find(n => n.id === 'CC').y * scale;
let path = [];
let animationStartTime = null;
let totalTime = 0;
const messageDiv = document.getElementById('message');
function calculateDistance(id1, id2) {
    const node1 = nodes.find(n => n.id === id1);
    const node2 = nodes.find(n => n.id === id2);
    const dx = node1.x - node2.x;
    const dy = node1.y - node2.y;
    return Math.sqrt(dx * dx + dy * dy);
}
// Dijkstra's algorithm for shortest path
function dijkstra(startId, endId) {
    const distances = {};
    const previous = {};
    const unvisited = new Set(nodes.map(n => n.id));
    
    nodes.forEach(n => distances[n.id] = Infinity);
    distances[startId] = 0;
    
    while (unvisited.size > 0) {
        let current = Array.from(unvisited).reduce((minId, id) => 
            distances[id] < distances[minId] ? id : minId
        );
        if (current === endId) break;
        unvisited.delete(current);
        
        edges.filter(e => e.from === current).forEach(edge => {
            if (unvisited.has(edge.to)) {
                const alt = distances[current] + edge.distance;
                if (alt < distances[edge.to]) {
                    distances[edge.to] = alt;
                    previous[edge.to] = current;
                }
            }
        });
    }
    
    const path = [];
    let u = endId;
    while (u) {
        path.unshift(u);
        u = previous[u];
    }
    return { path, distance: distances[endId] };
}

// Draw the map with background and dot
function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background image
    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }
    
    // Draw green dot
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(dotX, dotY, 5, 0, 2 * Math.PI);
    ctx.fill();
    destinations.forEach(dest => {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'; // Green, 30% opacity
        ctx.fillRect(dest.rect.x * scale, dest.rect.y * scale, dest.rect.w * scale, dest.rect.h * scale);
    });

    // Draw nodes
    nodes.forEach(node => {
        ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'; // Blue, 50% opacity
        ctx.beginPath();
        ctx.arc(node.x * scale, node.y * scale, 5, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// Animate the dot along the path
function animate(timestamp) {
    if (!animationStartTime) animationStartTime = timestamp;
    const elapsed = (timestamp - animationStartTime) / 1000; // in seconds
    
    if (elapsed >= totalTime) {
        dotX = nodes.find(n => n.id === path[path.length - 1]).x * scale;
        dotY = nodes.find(n => n.id === path[path.length - 1]).y * scale;
        currentNode = path[path.length - 1];
        drawMap();
        messageDiv.textContent = `Arrived at ${destinations.find(d => d.id === currentNode)?.name || 'destination'}`;
        animationStartTime = null;
        return;
    }
    
    let timeSoFar = 0;
    for (let i = 0; i < path.length - 1; i++) {
        const fromNode = nodes.find(n => n.id === path[i]);
        const toNode = nodes.find(n => n.id === path[i + 1]);
        const segmentDistance = edges.find(e => e.from === path[i] && e.to === path[i + 1]).distance;
        const segmentTime = segmentDistance / 10; // Speed: 10 units per second
        
        if (elapsed >= timeSoFar && elapsed < timeSoFar + segmentTime) {
            const t = (elapsed - timeSoFar) / segmentTime;
            dotX = (fromNode.x + (toNode.x - fromNode.x) * t) * scale;
            dotY = (fromNode.y + (toNode.y - fromNode.y) * t) * scale;
            break;
        }
        timeSoFar += segmentTime;
    }
    
    drawMap();
    requestAnimationFrame(animate);
}

// Handle canvas click for destination selection
canvas.addEventListener('click', (e) => {
    if (animationStartTime !== null) return; // Prevent clicking during animation
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / scale);
    const y = Math.floor((e.clientY - rect.top) / scale);
    
    const destination = destinations.find(d => 
        x >= d.rect.x && x < d.rect.x + d.rect.w &&
        y >= d.rect.y && y < d.rect.y + d.rect.h
    );
    
    if (destination) {
        const result = dijkstra(currentNode, destination.id);
        path = result.path;
        totalTime = result.distance / 10; // Time in seconds (speed: 10 units/sec)
        messageDiv.textContent = `Traveling to ${destination.name} (${totalTime.toFixed(1)} seconds)`;
        animationStartTime = null;
        requestAnimationFrame(animate);
    }
});

// Initialize
drawMap();