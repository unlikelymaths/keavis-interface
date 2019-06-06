
export default function ellipseCollide() {
    let nodes;
    var max_speed = 3;
    
    
    function clamp(val, min, max) {
        return Math.min(Math.max(val, min), max)
    }
    
    function clamp_speed(val) {
        return Math.min(Math.max(val, -max_speed), max_speed)
    }
    
    function force (alpha) {
        for (let i=0; i < nodes.length; i++) {
            nodes[i].vx = clamp(nodes[i].vx, -max_speed/3, max_speed/3)
            nodes[i].vy = clamp(nodes[i].vy, -max_speed/3, max_speed/3)
        }
        let nodeOne, nodeTwo;
        for (let iter=0; iter < 2; iter++) {
            for (let i=0; i<nodes.length; i++) {
                nodeOne = nodes[i];
                for(let j=i+1; j<nodes.length; j++) {
                    nodeTwo = nodes[j];
                    checkCollision(nodeOne, nodeTwo, alpha);
                }
            }
        }
    }
    
    function add_horizontal(node, ratio) {
        node.vx = clamp(node.vx + ratio * ((node.index % 2) - 0.5), -max_speed, max_speed)
    }
    
    function checkCollision(nodeOne, nodeTwo, alpha) {
        const nextOne = {x: nodeOne.x + nodeOne.vx, y: nodeOne.y + nodeOne.vy}
        const nextTwo = {x: nodeTwo.x + nodeTwo.vx, y: nodeTwo.y + nodeTwo.vy}
        // Check outer box first
        let next_horizontal_overlap = Math.max(0, (nodeOne.rx/2 + nodeOne.ry/2 + nodeTwo.rx/2 + nodeTwo.ry/2) - Math.abs(nextOne.x - nextTwo.x));
        if (next_horizontal_overlap == 0) {
            return
        }
        
        let next_vertical_overlap = Math.max(0, (nodeOne.ry/2 + nodeTwo.ry/2) - Math.abs(nextOne.y - nextTwo.y));
        if (next_vertical_overlap == 0) {
            return
        }
        
        // Compute ratios to move larger nodes less
        let areaOne = nodeOne.rx * nodeOne.ry + nodeOne.ry * nodeOne.ry;
        let areaTwo = nodeTwo.rx * nodeTwo.ry + nodeTwo.ry * nodeTwo.ry;
        let ratioOne = areaTwo / (areaOne + areaTwo)
        let ratioTwo = 1 - ratioOne
        
        let d_velocity = 0.5
        
        
        // Check inner box
        next_horizontal_overlap = Math.max(0, (nodeOne.rx/2 + nodeTwo.rx/2) - Math.abs(nextOne.x - nextTwo.x));
        
        if (next_horizontal_overlap > 0) { // resolve inner box
            if (next_vertical_overlap > 3) {
                if (nodeOne.x < nodeTwo.x) {
                    nodeOne.vx = clamp_speed((1 - d_velocity) * nodeOne.vx - d_velocity * ratioOne * next_horizontal_overlap)
                    nodeTwo.vx = clamp_speed((1 - d_velocity) * nodeOne.vx + d_velocity * ratioTwo * next_horizontal_overlap)
                } else {
                    nodeOne.vx = clamp_speed((1 - d_velocity) * nodeOne.vx + d_velocity * ratioOne * next_horizontal_overlap)
                    nodeTwo.vx = clamp_speed((1 - d_velocity) * nodeTwo.vx - d_velocity * ratioTwo * next_horizontal_overlap)
                }
            }
            if (nodeOne.y < nodeTwo.y) {
                nodeOne.vy = clamp_speed((1 - d_velocity) * nodeOne.vy - d_velocity * ratioOne * next_vertical_overlap)
                nodeTwo.vy = clamp_speed((1 - d_velocity) * nodeOne.vy + d_velocity * ratioTwo * next_vertical_overlap)
            } else {
                nodeOne.vy = clamp_speed((1 - d_velocity) * nodeOne.vy + d_velocity * ratioOne * next_vertical_overlap)
                nodeTwo.vy = clamp_speed((1 - d_velocity) * nodeTwo.vy - d_velocity * ratioTwo * next_vertical_overlap)
            }
        } else {
            let dx, dy, distance, circleOverlap;
            if (nextOne.x > nextTwo.x) {
                dx = (nextOne.x - nodeOne.rx/2) - (nextTwo.x + nodeTwo.rx/2)
            } else {
                dx = (nextOne.x + nodeOne.rx/2) - (nextTwo.x - nodeTwo.rx/2)
            }
            dy = nextOne.y - nextTwo.y
            distance = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2))
            circleOverlap = Math.max(0, nodeOne.ry/2 + nodeTwo.ry/2 - distance)
            if (circleOverlap > 0) {
                nodeOne.vx = clamp_speed((1 - d_velocity) * nodeOne.vx + d_velocity * ratioOne * circleOverlap / distance * dx);
                nodeTwo.vx = clamp_speed((1 - d_velocity) * nodeTwo.vx - d_velocity * ratioTwo * circleOverlap / distance * dx);
                nodeOne.vy = clamp_speed((1 - d_velocity) * nodeOne.vy + d_velocity * ratioOne * circleOverlap / distance * dy);
                nodeTwo.vy = clamp_speed((1 - d_velocity) * nodeTwo.vy - d_velocity * ratioTwo * circleOverlap / distance * dy);
            }
        }
    }
  
    
    force.initialize = _ => {
        nodes = _;
    };
    
    return force;
}