import React, { Component } from 'react'
import Button from '@material/react-button';

import BarChart from "./BarChart";


class Chart extends Component {
    constructor(props){
        super(props)
    }

    render() {
        var previous_button = null
        if (this.props.previous) {
            previous_button =  <div className={'topleft'}>
                          <Button onClick={this.props.previous}>
                            Previous
                          </Button>
                        </div>
        }
        var next_button = null
        if (this.props.next) {
            next_button =  <div className={'topright'}>
                          <Button onClick={this.props.next}>
                            Next
                          </Button>
                        </div>
        }
        var style = {position: 'relative'}
        if (typeof(this.props['style']) !== 'undefined') {
            style = Object.assign(this.props.style, style)
        return  <div className={'flex-container ' + this.props.className} style={style}>
                  {previous_button}
                  <BarChart frame_id={this.props.frame_id} topic_id={this.props.topic_id} size={['100%','100%']} />
                  {next_button}
                </div>
    }
}
export default Chart