import React, { Component } from 'react'
import { scaleLinear } from 'd3-scale'
import { max } from 'd3-array'
import { select } from 'd3-selection'
import {transition} from "d3-transition"
import ReactResizeDetector from 'react-resize-detector';

import topicBuffer from '../TopicBuffer'

class BarChart extends Component {
    constructor(props){
        super(props)
        this.svgRef = React.createRef();
        this.framesummary = null
        this.topicframe = null
        this.frame_id = null
        this.topic_id = null
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        if (this.topic_id != nextProps.topic_id || this.frame_id != nextProps.frame_id) {
            console.log('get_topicframe')
            this.topic_id = nextProps.topic_id
            topicBuffer.get_topicframe(this.topic_id, this.frame_id, this.recieve_topicframe.bind(this))
        }
        if (this.frame_id != nextProps.frame_id) {
            this.frame_id = nextProps.frame_id
            topicBuffer.get_framesummary(this.frame_id, this.recieve_framesummary.bind(this))
        }
        return false;
    }

    componentDidMount() {
        this.frame_id = this.props.frame_id
        this.topic_id = this.props.topic_id
        topicBuffer.get_framesummary(this.frame_id, this.recieve_framesummary.bind(this))
        topicBuffer.get_topicframe(this.topic_id, this.frame_id, this.recieve_topicframe.bind(this))
    }
    
    recieve_framesummary(framesummary) {
        this.framesummary = framesummary
        this.createBarChart()
    }
    
    recieve_topicframe(topicframe) {
        console.log('recieve_topicframe')
        this.topicframe = topicframe
        this.createBarChart()
    }
    
    createBarChart() {
        console.log('createBarChart ' + this.framesummary)
        var bg_data = []
        var fg_data = []
        if (this.framesummary) {
            bg_data = this.framesummary.counts
        }
        if (this.topicframe) {
            fg_data = this.topicframe.counts
        }
        
        
        const node = this.svgRef.current
        const binWidth = this.width / bg_data.length
        const height = this.height
        var dataMax = max(bg_data)
        if (this.topicframe) {
            dataMax = max(fg_data) * 3
        }
        
        const yScale = scaleLinear()
            .domain([0, dataMax])
            .range([0, height * 0.9])
        const xScale = scaleLinear()
            .domain([0, bg_data.length])
            .range([0, this.width])
        
        select(node)
            .selectAll('rect.bg')
            .data(bg_data)
            .enter()
            .append('rect')
            .attr('class', 'bg')
            .attr('height', d => 0)
            .attr('y', (d,i) => height)
        
        select(node)
            .selectAll('rect.bg')
            .data(bg_data)
            .exit()
            .remove()
            
        select(node)
            .selectAll('rect.bg')
            .data(bg_data)
            .style('fill', '#fe9922')
            .attr('x', (d,i) => xScale(i))
            .attr('width', binWidth)
            
        select(node)
            .selectAll('rect.bg')
            .interrupt()
            
        select(node)
            .selectAll('rect.bg')
            .transition()
            .delay(0)
            .duration(500)
            .attr('height', d => yScale(d))
            .attr('y', (d,i) => height - yScale(d))
            
        if (fg_data.length > 0) {  
            select(node)
                .selectAll('rect.fg')
                .data(fg_data)
                .enter()
                .append('rect')
                .attr('class', 'fg')
                .attr('height', d => 0)
                .attr('y', (d,i) => height - 0)
            
            select(node)
                .selectAll('rect.fg')
                .data(fg_data)
                .exit()
                .remove()
                
            select(node)
                .selectAll('rect.fg')
                .data(fg_data)
                .style('fill', '#0000ff')
                .attr('x', (d,i) => xScale(i))
                .attr('width', binWidth)
                
            select(node)
                .selectAll('rect.fg')
                .interrupt()
                
            select(node)
                .selectAll('rect.fg')
                .transition()
                .delay(0)
                .duration(500)
                .attr('height', d => yScale(d))
                .attr('y', (d,i) => height - yScale(d))
        } else {
             select(node)
                .selectAll('rect.fg')
                .data(fg_data)
                .exit()
                .remove()
        }
    }

    render() {
        return <div className={'flex-item'}><svg ref={this.svgRef}
                    width={this.props.size[0]} 
                    height={this.props.size[1]}>
            </svg>
            <ReactResizeDetector handleWidth handleHeight onResize={this.onResize.bind(this)} />
            </div>
    }
    
    onResize(width, height) {
        this.width = width;
        this.height = height;
        this.createBarChart()
    }
}
export default BarChart