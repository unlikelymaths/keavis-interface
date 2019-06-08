import React,{Component} from "react";
import PropTypes from 'prop-types';
import { scaleLinear } from 'd3-scale'
import { min, max, range } from 'd3-array'
import { select } from 'd3-selection'
import { transition} from "d3-transition"
import { forceSimulation, forceX, forceY, forceRadial, forceCenter} from "d3-force"
import ellipseCollide from './ellipseCollide'

const MAX_TOKENS = 10;
const FONT_BASE = 10;
const MIN_WEIGHT_SCALE = 0.5;

function textSize(text) {
    var compression = 0.5
    var container = select('body').append('svg');
    container.append('text')
             .attr('x', -99999)
             .attr('y', -99999)
             .text(text)
             .style("font-size", FONT_BASE)
             .style('font-family', 'Arial,Helvetica')
             .style('font-weight', 'bold');
    var size = container.node().getBBox();
    container.remove();
    var width = Math.max(size.width - compression * size.height)
    var height = size.height
    var outerArea = height * (width + (1 - compression) * height)
    return { width: width, height: height, outerArea: outerArea};
}

class Tokenset {

    constructor(topicframe, binIdx) {
        if (binIdx == null) {
            this.tokens = topicframe.tokenList.map(
                (d,i) => ({token: d,
                        weight: topicframe.tokenWeights[i][0],
                        size: textSize(d)})
                );
        } else {
            this.tokens = topicframe.tokenList.map(
                (d,i) => ({token: d,
                        weight: topicframe.tokenWeights[i][1][binIdx],
                        size: textSize(d)})
                );
        }
        if (this.tokens.length > MAX_TOKENS) {
            this.tokens = this.tokens.splice(0,MAX_TOKENS);
        }
        this.areaSum = null;
        this.rawMaxWeight = null;
        this.rawMinWeight = null;
        this.maxWeight = null;
        this.minWeight = null;
        this.rescale();
        this.normalize();
    }
    
    rescale() {
        this.areaSum = 0
        const minValue = min(this.tokens, d => d.weight)
        const maxValue = max(this.tokens, d => d.weight)
        var scale = scaleLinear().domain([minValue, maxValue]).range([0.5, 1]);
        for (let i=0; i < this.tokens.length; i++) {
            this.tokens[i].weight = scale(this.tokens[i].weight);
            this.areaSum += this.tokens[i].weight * this.tokens[i].weight * 
                this.tokens[i].size.outerArea;
        }
    }
    
    normalize() {
        this.rawMaxWeight = this.tokens[0].weight
        this.rawMinWeight = this.tokens[0].weight
        for (let i=0; i < this.tokens.length; i++) {
            this.tokens[i].weight *= Math.sqrt(1 / this.areaSum);
            this.rawMaxWeight = Math.max(this.rawMaxWeight,
                                         this.tokens[i].weight)
            this.rawMinWeight = Math.min(this.rawMinWeight,
                                         this.tokens[i].weight)
        }
    }
    
    scaledTokens(size) {
        const targetArea = 0.3 * size.width * size.height;
        const scalingFactor = Math.sqrt(targetArea);
        this.maxWeight = scalingFactor * this.rawMaxWeight;
        this.minWeight = scalingFactor * this.rawMinWeight;
        return this.tokens.map(t => ({token: t.token, 
                                      weight: scalingFactor * t.weight,
                                      size: t.size}));
    }
}

class WordCloud extends Component {
    constructor(props){
        super(props)
        this.ref = React.createRef();
        this.simulation = null;
        this.simulationRunning = false;
    }
    
    componentDidMount() {
        if (this.props.topicframe != null) {
            this.setNewData(new Tokenset(this.props.topicframe),
                            this.props.size);
        }
    }

    componentWillUnmount() {
        this.stopSimulation();
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        const currentFrame = this.props.topicframe;
        const nextFrame = nextProps.topicframe;
        const size = nextProps.size;
        var sizeChanged = false;
        if (size.width != this.props.size.width ||
            size.height != this.props.size.height) {
            this.setSize(size);
            sizeChanged = true;
        }
        if (nextFrame != null && currentFrame == null) {
                console.log('setNewData');
            this.setNewData(new Tokenset(nextFrame), size);
        } else if (nextFrame != null && currentFrame != null) {
            if (nextFrame.topicId != currentFrame.topicId) {
                console.log('setNewData');
                this.setNewData(new Tokenset(nextFrame), size);
            } else if (nextFrame.frameId != currentFrame.frameId ||
                       nextProps.binIdx != this.props.binIdx) {
                this.updateData(new Tokenset(nextFrame, nextProps.binIdx),
                                size);
            } else if (sizeChanged) {
                this.updateData(this.tokenset, size);
            }
        }
        if (nextProps.visible) {
            this.startSimulation()
        } else {
            this.stopSimulation();
        }
        return false;
    }

    startSimulation() {
        if (this.simulation != null &&
            this.simulationRunning == false) {
            this.simulation.restart();
            this.simulationRunning = true;
        }
    }

    stopSimulation() {
        if (this.simulation != null &&
            this.simulationRunning == true) {
            this.simulation.stop();
            this.simulationRunning = false;
        }
    }

    setSize(size) {
        const xScale = size.width / this.props.size.width;
        const yScale = size.height / this.props.size.height;
        this.node.setAttribute('width', size.width);
        this.node.setAttribute('height', size.height);
        if (this.nodes != null) {
            for(var i=0; i<this.nodes.length; ++i) {
                this.nodes[i].x *= xScale;
                this.nodes[i].y *= yScale;
            }
        }
    }

    setNewData(tokenset, size) {
        this.nodes = [];
        this.updateData(tokenset, size);
    }
    
    updateData(tokenset, size) {
        // Stop simluation if it is still running
        this.stopSimulation()
        
        // Set tokenset
        this.tokenset = tokenset;
        var tokens = this.tokenset.scaledTokens(size);

        // Set target weights to zero
        for (var i=0; i < this.nodes.length; ++i) {
            this.nodes[i].weightTarget = 0;
        }
        
        // Update target weights or append nodes
        var center = [size.width / 2, size.height / 2]
        for (var i=0; i < tokens.length; ++i) {
            const token = tokens[i];
            var nodeIdx = this.nodes.findIndex(
                node => (node.token == token.token));
            if (nodeIdx == -1) {
                this.nodes.push({
                    x: center[0] + 0.75 * (2 * Math.random() - 1) * center[0], 
                    y: center[1] + 0.75 * (2 * Math.random() - 1) * center[1], 
                    size: token.size,
                    rx: token.weight * token.size.width, 
                    ry: token.weight * token.size.height, 
                    weight: this.tokenset.minWeight * MIN_WEIGHT_SCALE,
                    weightTarget: token.weight, 
                    token: token.token});
            } else {
                this.nodes[nodeIdx].weightTarget = tokens[i].weight;
            }
        }
        
        this.simulation = forceSimulation(this.nodes)
            .force('centerX', forceX(size.width / 2).strength(
                d => 1 * Math.pow(d.weightTarget,2)))
            .force('centerY', forceY(size.height / 2).strength(
                d => 1 * Math.pow(d.weightTarget,2)))
            .force('collide', ellipseCollide())
            .velocityDecay(0.5)
            .alphaDecay(0.01)
            .on('tick', this.update_nodes.bind(this))
            .on('end', function() { })
            .stop();
        this.startSimulation();
    }
    
    update_nodes() {
        const show_collision = false;
        const weightThreshold = this.tokenset.minWeight * MIN_WEIGHT_SCALE;
        this.nodes = this.nodes.filter(node => node.weightTarget > 0 ||
                                               node.weight >= weightThreshold);
        const node = this.node;
        
        var color = scaleLinear()
            .domain([this.min_weight, this.max_weight])  
            .range(["grey", "black"]); 
        
        var selection = select(node)
            .selectAll('text')
            .data(this.nodes)
            .text(function(d){return d.token})
            .attr('dominant-baseline', 'central')
            .style('font-family', 'Arial,Helvetica')
            .style('font-weight', 'bold')
            .style("text-anchor", "middle")
        
        selection.exit()
            .remove()
        
        selection.enter()
            .append('text')   
        //var new_groups = selection.enter()
        //    .append('g')
            //.attr('transform', 'scale(0.2)')
            
        //if (show_collision) {
        //    new_groups.append('circle').attr("class", "left")
        //    new_groups.append('circle').attr("class", "right")
        //    new_groups.append('rect')
        //}
        //new_groups.append('text')
        
        //selection.attr('transform', d => 'translate(' + d.x.toFixed(1) + ',' + d.y.toFixed(1) + ')' + 'scale(' + d.weight.toFixed(3) + ')')
        
        //if (show_collision) {
        //    selection.selectAll('rect').style('fill', '#fe9922')
        //        .attr('x', function(d) { return -d.size.width/2; })
        //        .attr('y', function(d) { return -d.size.height/2; })
        //        .attr("width", function(d) { return d.size.width; })
        //        .attr("height", function(d) { return d.size.height; })
        //        
        //    selection.selectAll('circle.left').style('fill', '#fe9922')
        //        .attr('cx', function(d) { return -d.size.width/2; })
        //        .attr('cy', function(d) { return 0; })
        //        .attr("r", function(d) { return d.size.height / 2; })
        //            
        //    selection.selectAll('circle.right').style('fill', '#fe9922')
        //        .attr('cx', function(d) { return d.size.width/2; })
        //        .attr('cy', function(d) { return 0; })
        //        .attr("r", function(d) { return d.size.height / 2; })
        //}
        selection.attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; })
            .style("font-size", d => (d.weight*FONT_BASE).toFixed(1) + "px")
            .style('fill', d => color(d.weight))
            
        for (let i=0; i < this.nodes.length; i++) {
            let node = this.nodes[i]
            node.weight = node.weight * 0.95 + node.weightTarget * 0.05
            node.rx = node.weight * node.size.width
            node.ry = node.weight * node.size.height
        }
    }
    
    render() {
        return <svg ref={node => this.node = node}
                width={this.props.size.width} 
                height={this.props.size.height}>
            </svg>;
    }
}
WordCloud.propTypes = {
    size: PropTypes.object.isRequired,
    visible: PropTypes.bool,
    topicframe: PropTypes.object,
    binIdx: PropTypes.node
}
export default WordCloud