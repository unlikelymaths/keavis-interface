import React,{Component} from "react";
import Card, {
  CardPrimaryContent,
  CardMedia,
  CardActions,
  CardActionButtons,
  CardActionIcons
} from "@material/react-card";
import '@material/react-card/dist/card.css';

import { scaleLinear } from 'd3-scale'
import { min, max, range } from 'd3-array'
import { select } from 'd3-selection'
import { transition} from "d3-transition"
import { forceSimulation, forceX, forceY, forceRadial, forceCenter} from "d3-force"
//import ellipseCollide from '../d3-ellipseCollide/ellipseCollide'
import ellipseCollide from '../util/ellipseCollide'

import $ from "jquery";

import Loader from 'react-loader-spinner'

import topicBuffer from '../TopicBuffer'

function textSize(text) {
    var compression = 0.5
    var container = select('body').append('svg');
    container.append('text')
             .attr('x', -99999)
             .attr('y', -99999)
             .text(text)
             .style("font-size", '10px')
             .style('font-family', 'Arial,Helvetica')
             .style('font-weight', 'bold');
    var size = container.node().getBBox();
    container.remove();
    var width = Math.max(size.width - compression * size.height)
    var height = size.height
    var outerArea = height * (width + (1 - compression) * height)
    return { width: width, height: height, outerArea: outerArea};
}

class TopicCard extends Component {
    constructor(props){
        super(props)
        this.count = 0
        this.state = {initialized: true};
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }

    componentDidMount() {
        topicBuffer.get_topicframe(this.props.topic_id, this.props.frame_id, this.handleData.bind(this))
    }

    componentDidUpdate() {
        //this.createBarChart()
    }
    
    update_sizes() {
        for (let i=0; i < this.nodes.length; i++) {
            let node = this.nodes[i]
            node.weight = node.weight * 0.95 + node.weightTarget * 0.05
            node.rx = node.weight * node.size.width
            node.ry = node.weight * node.size.height
        }
    }
    
    handleData(data) {
        //console.log('TopicCard:handleData')
        // add size information
        var tokens = data.tokens.map(d => ({token: d[0], weight: d[1], size: textSize(d[0])}));
        
        // scale small values
        var area_sum = 0
        var min_value = min(tokens, d => d.weight)
        var max_value = max(tokens, d => d.weight)
        var scale = scaleLinear().domain([min_value, max_value]).range([0.5, 1]);
        for (let i=0; i < tokens.length; i++) {
            tokens[i].weight = scale(tokens[i].weight);
            //tokens[i].weight = Math.max(tokens[i].weight,0)
            area_sum += tokens[i].weight * tokens[i].weight * tokens[i].size.outerArea;
        }
        
        // normalize
        var target_area = 0.3 * this.props.size[0] * this.props.size[1]
        this.max_weight = tokens[0].weight
        this.min_weight = tokens[0].weight
        for (let i=0; i < tokens.length; i++) {
            tokens[i].weight *= Math.sqrt(target_area / area_sum);
            this.max_weight = Math.max(this.max_weight, tokens[i].weight)
            this.min_weight = Math.min(this.min_weight, tokens[i].weight)
        }
        
        // Center
        var center = [this.props.size[0] / 2, this.props.size[1] / 2]
            
        // Map to nodes
        this.nodes = tokens.map(function(d) {
            return {x: center[0] + 0.75 * (2 * Math.random() - 1) * center[0], 
                    y: center[1] + 0.75 * (2 * Math.random() - 1) * center[1], 
                    size: d.size,
                    rx: d.weight * d.size.width, 
                    ry: d.weight * d.size.height, 
                    weight: d.weight / 10, 
                    weightTarget: d.weight, 
                    token: d.token}
            })
            
        //console.log(this.nodes)
        var simulation = forceSimulation(this.nodes)
            .force('centerX', forceX(this.props.size[0] / 2).strength(d => 1 * Math.pow(d.weightTarget,2)))
            .force('centerY', forceY(this.props.size[1] / 2).strength(d => 1 * Math.pow(d.weightTarget,2)))
            .force('collide', ellipseCollide())
            //.force('radial', forceRadial(50, this.props.size[0] / 2, this.props.size[1] / 2))
            //.force('center', forceCenter(center[0],center[1]))
            .velocityDecay(0.5)
            .alphaDecay(0.01)
            .on('tick', this.ticked.bind(this))
            .on('end', function() { /*console.log('ended!');*/ });
            
        //console.log("Initialized")
    }
    
    
    
    ticked() {
        const show_collision = false
        this.count = this.count + 1
        const node = this.node
        
        var color = scaleLinear()
            .domain([this.min_weight, this.max_weight])  
            .range(["grey", "black"]); 
        
        var selection = select(node)
            .selectAll('text')
            .data(this.nodes)
        
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
            .text(function(d){return d.token})
            .attr("dominant-baseline", "central")
            .style("font-size", function(d){return (d.weight * 10).toFixed(1) + "px";})
            .style('font-family', 'Arial,Helvetica')
            .style('font-weight', 'bold')
            .style("text-anchor", "middle")
            .style('fill', d => color(d.weight))
            
        this.update_sizes()
    }

    
    clicked() {
        console.log(this.props.topic_id)
        if (this.props.onClick) {
            this.props.onClick(this.props.topic_id)
        }
    }
    
    render() {
        //console.log('Render INit:' + this.state.initialized)
        
        var content = null
        if (this.state.initialized) {
            content = (
                <svg ref={node => this.node = node}
                    width={this.props.size[0]} 
                    height={this.props.size[1]}>
                </svg>)
        } else {
            content = (<div style={{width: this.props.size[0], 
                                    height: this.props.size[1]}}>
                    <div style={{position: "absolute", 
                                 left: this.props.size[0]/2 - 50, 
                                 top: this.props.size[1]/2 - 25}}>
                        <Loader
                            type="Oval"
                            color="#00BFFF"
                            height="50"	
                            width="50"/>
                    </div>
                </div>)
        }
        var style = {}
        console.log('TopicCard render ' + this.props.highlight)
        if (this.props.highlight == true) {
            style={backgroundColor: 'lightblue'}
        }
        
        
        return (<div style={{margin: "10px"}}>
            <Card>
                <CardPrimaryContent style={style}
                                    onClick={this.clicked.bind(this)}>
                    {content}
                </CardPrimaryContent>
            </Card>
        </div>);
        return 
    }
}
export default TopicCard



//createBarChart() {
//    const node = this.node
//    const dataMax = max(this.props.data)
//    const yScale = scaleLinear()
//        .domain([0, dataMax])
//        .range([0, this.props.size[1]])
//    const width = this.props.size[0] / this.props.data.length
//    console.log("SVG: " + this.props.size[0] + ", Bar: " + width)
//    select(node)
//        .selectAll('rect')
//        .data(this.props.data)
//        .enter()
//        .append('rect')
//    
//    select(node)
//        .selectAll('rect')
//        .data(this.props.data)
//        .exit()
//        .remove()
//        
//    select(node)
//        .selectAll('rect')
//        .data(this.props.data)
//        .style('fill', '#fe9922')
//        .attr('x', (d,i) => i * width)
//        .attr('y', d => this.props.size[1] - 10)
//        .attr('height', d => 10)
//        .attr('width', width)
//        
//    select(node)
//        .selectAll('rect')
//        .transition()
//        .delay(2000)
//        .style('fill', '#fe9922')
//        .attr('x', (d,i) => i * width)
//        .attr('y', d => this.props.size[1] - yScale(d))
//        .attr('height', d => yScale(d))
//        .attr('width', width)
//}
