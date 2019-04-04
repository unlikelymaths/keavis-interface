import $ from "jquery";
import React from "react";

import Button from '@material/react-button';

import topicBuffer from '../TopicBuffer'
import {FrameContent} from "../components/Frame";
import Map from "../components/Map";
import Chart from "../components/Chart";
import TopicCard from "../components/TopicCard";



class PopularTopicsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {number: 0, current_framesummary: {}, current_topic_id: null, current_idx: 0};
    }
    
    componentDidMount() {
        topicBuffer.get_latest_framesummary(this.recieve_framesummary.bind(this))
        $(document).keypress(this.keypress.bind(this));
    }
    
    keypress(e) {
        console.log(e.keyCode)
        switch(e.keyCode) {
        case 37: // Arrow Left
            this.previous_frame()
            break;
        case 39: // Arrow Right
            this.next_frame()
            break;
        default:
        } 
    }
    
    previous_frame() {
        var frame_id = this.state.current_framesummary.frame_id - 1;
        console.log(frame_id)
        topicBuffer.get_framesummary(frame_id, this.recieve_framesummary.bind(this))
    }
    
    next_frame() {
        var frame_id = this.state.current_framesummary.frame_id + 1;
        console.log(frame_id)
        topicBuffer.get_framesummary(frame_id, this.recieve_framesummary.bind(this))
    }

    switch_topic(topic_id) {
        if (this.state.current_topic_id == topic_id) {
            this.setState({current_topic_id: null});
        } else {
            this.setState({current_topic_id: topic_id});
        }
    }
    
    componentWillUnmount() {
        //clearInterval(this.timerID);
    }
    
    recieve_framesummary(framesummary) {
        this.setState({
            current_framesummary: framesummary,
            frame_id: framesummary.frame_id,
            current_topic_id: null
            });
    }
    
    switchDrawerOpen() {
        this.setState({
            drawerOpen: !this.state.drawerOpen
            });
    }
    
    closeDrawer() {
        this.setState({
            drawerOpen: false
            });
    }

    tick() {
        this.setState({
            number: this.state.number + 1
            });
    }
    
    next_topics() {
        if (this.state.current_framesummary) {
            var new_idx = Math.min((this.state.current_idx + 4), this.state.current_framesummary.hot.length - 4)
            this.setState({
                current_idx: new_idx,
                current_topic_id: null
                });
        }
    }
    previous_topics() {
        if (this.state.current_framesummary) {
            var new_idx = Math.max((this.state.current_idx - 4), 0)
            this.setState({
                current_idx: new_idx,
                current_topic_id: null
                });
        }
    }
  
    render() {
        console.log(this.state.current_topic_id)
        var mapHeight = '64%';
        var chartHeight = '36%';
        var frame_name = '';
        var heatmap = null
        var topic_card_list = 'Loading Topics.'
        var frame_id = null
        var num_topics = 0
        if (this.state.current_framesummary.frame_id != null) {
            frame_name = this.state.current_framesummary.frame_name;
            frame_id = this.state.current_framesummary.frame_id;
            
            heatmap = this.state.current_framesummary.heatmap;

            num_topics = this.state.current_framesummary.hot.length
                 
            if (this.state.current_framesummary.hot.length == 0) {
                topic_card_list = 'No Topics found.'
            }else{
                var current_topic_id = this.state.current_topic_id
                function compare_topic_id(s) {
                    var same = (s === current_topic_id)
                    console.log(same)
                    return same
                }
                topic_card_list = this.state.current_framesummary.hot.slice(this.state.current_idx, this.state.current_idx + 4).map(
                    (topic_id) => <TopicCard key={topic_id} 
                                          onClick={this.switch_topic.bind(this)}
                                          highlight={compare_topic_id(topic_id)}
                                          topic_id={topic_id} 
                                          frame_id={this.state.current_framesummary.frame_id}
                                          size={[400,150]}/>)
            }
        }
        if (this.state.current_framesummary != null) {
        }
        
        
        return <FrameContent>
            <div className='flex-item flex-container-vertical'>
            {<Map className='flex-item-big' frameID={this.state.frame_id} heatmap={heatmap}/>}
                <Chart className='flex-item' 
                       frame_id={this.state.frame_id}
                       topic_id={this.state.current_topic_id}
                       previous={this.previous_frame.bind(this)}
                       next={this.next_frame.bind(this)}/>
            </div>
            <div className='right-sheet'>
                <Button
                    raised
                    className='button-alternate'
                    onClick={this.previous_topics.bind(this)}>
                        Previous
                </Button>
                {/*Topics {this.state.current_idx} to {this.state.current_idx + 4} ({num_topics})*/}
                {topic_card_list}
                <Button
                    raised
                    className='button-alternate'
                    onClick={this.next_topics.bind(this)}>
                        Next
                </Button>
            </div>
        </FrameContent>
    }
}

export default PopularTopicsPage;