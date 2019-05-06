import React, { Component } from 'react'
import { scaleLinear } from 'd3-scale'
import { max, min } from 'd3-array'
import { select } from 'd3-selection'
import { transition } from "d3-transition"
import { axisBottom } from "d3-axis"
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
        this.height = null
        this.width = null
        this.drawGroup = null
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        if (this.topic_id != nextProps.topic_id || this.frame_id != nextProps.frame_id) {
            this.topic_id = nextProps.topic_id
            topicBuffer.get_topicframe(nextProps.topic_id, nextProps.frame_id, this.recieve_topicframe.bind(this))
        }
        if (this.frame_id != nextProps.frame_id) {
            this.frame_id = nextProps.frame_id
            topicBuffer.get_framesummary(nextProps.frame_id, this.recieve_framesummary.bind(this))
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
        this.topicframe = topicframe
        this.createBarChart()
    }
    
    createBarChart(is_resize = false) {
        // Ensure that background data has arrived
        if (this.framesummary === null) {
            return
        }
        const bg_data = this.framesummary.counts
        
        // Height and width must be known for scaling
        if (this.height === null || this.width === null) {
            return
        }
        const height = this.height
        const width = this.width
        
        // Must have a node for drawing
        if (this.svgRef.current === null) {
            return
        }
        var node = select(this.svgRef.current)

        // Foreground data is optional
        var fg_data = []
        if (this.topicframe !== null) {
            fg_data = this.topicframe.counts
        }
        
        // Higher speed on resize
        const duration = (is_resize === true ? 250 : 500)
        
        // Initialize scales
        const side_margins = 40
        const lower_margin = 40
        const upper_margin = 40
        const binWidth = (this.width - 2 * side_margins) / bg_data.length
        var dataMax = max(bg_data)
        if (fg_data.length > 0) {
            dataMax = min([dataMax, max(fg_data) * 3])
        }
        const yScale = scaleLinear()
            .domain([0, dataMax])
            .range([0, height - lower_margin - upper_margin])
        const xScale = scaleLinear()
            .domain([0, bg_data.length])
            .range([side_margins, this.width - side_margins])
        
        // Draw axis
        node.selectAll('#bar_chart_x_axis')
            .remove();
        var tickValues = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]
        if (width < 300) {
            tickValues = [0,12,24]
        } else if (width < 500) {
            tickValues = [0,6,12,18,24]
        } else if (width < 750) {
            tickValues = [0,3,6,9,12,15,18,21,24]
        } else if (width < 1300) {
            tickValues = [0,2,4,6,8,10,12,14,16,18,20,22,24]
        }
        var x_axis = axisBottom()
            .scale(xScale)
            .tickFormat(d => '' + (d%12==0? 12 : d%12) + ':00 ' + ((d%24<12) ? 'am' : 'pm'))
            .tickValues(tickValues);
        node.append('g')
            .attr('id', 'bar_chart_x_axis')   
            .attr('transform', 'translate(0,' + (height - 40) + ')')    
            .call(x_axis);
        
        // Initialize draw group if necessary
        if (this.drawGroup === null) {
            this.drawGroup = node.append("g")
                .attr('id', 'bar_chart_draw_area')
                .attr("transform", "scale(1,-1)")
        }
        
        // All following commands go into the draw group
        node = this.drawGroup
        
        // Draw background bars
        node.selectAll('rect.bg')
            .data(bg_data)
            .enter()
            .append('rect')
            .attr('class', 'bg')
            .attr('height', 0)
            .attr('y', -height+lower_margin)
        
        node.selectAll('rect.bg')
            .data(bg_data)
            .exit()
            .remove()
            
        node.selectAll('rect.bg')
            .data(bg_data)
            .style('fill', '#fe9922')
            .attr('x', (d,i) => xScale(i))
            .attr('width', binWidth)
            .attr('y', -height+lower_margin)
            
        node.selectAll('rect.bg')
            .interrupt()
            
        
        node.selectAll('rect.bg')
            .transition()
            .delay(0)
            .duration(duration)
            .attr('height', d => yScale(d))
            
        // Draw foreground bars
        if (fg_data.length > 0) {  
            node.selectAll('rect.fg')
                .data(fg_data)
                .enter()
                .append('rect')
                .attr('class', 'fg')
                .attr('height', 0)
                .attr('y', -height+lower_margin)
            
            node.selectAll('rect.fg')
                .data(fg_data)
                .exit()
                .remove()
                
            node.selectAll('rect.fg')
                .data(fg_data)
                .style('fill', '#0000ff')
                .attr('x', (d,i) => xScale(i))
                .attr('width', binWidth)
                .attr('y', -height+lower_margin)
                
            node.selectAll('rect.fg')
                .interrupt()
                
            node.selectAll('rect.fg')
                .transition()
                .delay(0)
                .duration(duration)
                .attr('height', d => yScale(d))
        } else {
            node.selectAll('rect.fg')
                .data(fg_data)
                .exit()
                .transition()
                .delay(0)
                .duration(duration)
                .attr('height', 0)
                .remove()
        }
    }

    render() {
        return <div className={'flex-item'}>
            <svg ref={this.svgRef}
              width={this.props.size[0]} 
              height={this.props.size[1]}>
            </svg>
            <ReactResizeDetector handleWidth handleHeight onResize={this.onResize.bind(this)} />
          </div>
    }
    
    onResize(width, height) {
        const is_resize = (this.width !== null)
        this.width = width;
        this.height = height;
        this.createBarChart(is_resize)
    }
}
export default BarChart