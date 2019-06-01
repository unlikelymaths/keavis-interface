import $ from "jquery";
import React from "react";

import Button from '@material/react-button';
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';

import topicBuffer from '../TopicBuffer'
import {FrameContent} from "../components/Frame";
import Map from "../components/Map";
import BarChart from "../components/BarChart";
import TopicList from "../components/TopicList";
import FrameBar from "../components/FrameBar";

import '@material/react-tab-bar/index.scss';
import '@material/react-tab-scroller/index.scss';
import '@material/react-tab/index.scss';
import '@material/react-tab-indicator/index.scss';
import './PopularTopicsPage.scss';

class PopularTopicsPage extends React.Component {
    constructor(props) {
        super(props);
        this.mobileThreshold = 599;
        this.mapLabel = 'Map'
        this.chartLabel = 'Chart'
        this.state = {
            frameIds: null,
            current_framesummary: null,
            current_topic_id: null, 
            current_idx: 0,
            mobile: (window.innerWidth <= this.mobileThreshold),
            tabIndex: 0,
            binIdx: null
            };
    }
    
    componentDidMount() {
        topicBuffer.frameIDs(this.recieveFrameIds.bind(this));
        topicBuffer.latestFramesummary(this.recieve_framesummary.bind(this))
        $(document).keypress(this.keypress.bind(this));
        window.addEventListener('resize', this.onWindowSize.bind(this));
    }
    
    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindowSize.bind(this));
    }
    
    onWindowSize() {
        this.setState({ mobile: (window.innerWidth <= this.mobileThreshold) });
    };
    
    keypress(e) {
        switch(e.keyCode) {
        case 37: // Arrow Left
            this.setPreviousFrame()
            break;
        case 39: // Arrow Right
            this.setNextFrame()
            break;
        default:
        } 
    }

    prevFrameId() {
        if (this.state.frameIds == null ||
            this.state.current_framesummary == null) {
            return null;
        }
        const idx = this.state.frameIds.indexOf(this.state.current_framesummary.id);
        if (idx == -1 ||
            idx == 0) {
            return null;
        }
        return this.state.frameIds[idx-1]
    }

    setPreviousFrame() {
        const frameId = this.prevFrameId();
        if (frameId != null) {
            topicBuffer.framesummary(frameId, this.recieve_framesummary.bind(this))
        }
    }

    nextFrameId() {
        if (this.state.frameIds == null ||
            this.state.current_framesummary == null) {
            return null;
        }
        const idx = this.state.frameIds.indexOf(this.state.current_framesummary.id);
        if (idx == -1 ||
            idx == this.state.frameIds.length - 1) {
            return null;
        }
        return this.state.frameIds[idx+1]
    }

    setNextFrame() {
        const frameId = this.nextFrameId();
        if (frameId != null) {
            topicBuffer.framesummary(frameId, this.recieve_framesummary.bind(this))
        }
    }

    switch_topic(topic_id) {
        this.setState({current_topic_id: topic_id});
    }
    
    componentWillUnmount() {
        //clearInterval(this.timerID);
    }
    
    recieve_framesummary(framesummary) {
        this.setState({
            current_framesummary: framesummary,
            frame_id: framesummary.id,
            current_topic_id: null
            });
    }
    
    recieveFrameIds(frameIds) {
        this.setState({frameIds: frameIds});
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
    
    handleActiveIndexUpdate(tabIndex) {
        this.setState({ tabIndex: tabIndex });
    }
    
    handleBinIdx(binIdx) {
        this.setState({binIdx: binIdx });
    }

    render() {
        var frame_id = null;
        var frame_name = '';
        var heatmapGrid = null;
        var heatmapWeights = null;
        var topicIds = null;

        if (this.state.current_framesummary !== null) {
            frame_id = this.state.current_framesummary.id;
            frame_name = this.state.current_framesummary.name;
            heatmapGrid = this.state.current_framesummary.heatmapGrid;
            heatmapWeights = this.state.current_framesummary.heatmapWeights;
            topicIds = this.state.current_framesummary.topic_ids;
        }        

        if (this.state.mobile) {
            var topArea = null;
            if (this.state.tabIndex == 0) {
                topArea = <Map className='flex-item'
                    frameId={frame_id}
                    topicId={this.state.current_topic_id}
                    binIdx={this.state.binIdx}
                    grid={heatmapGrid}
                    weights={heatmapWeights}
                    blendingTime={500}/>
            } else {
                topArea = <BarChart className='flex-item' 
                    frame_id={this.state.frame_id} 
                    topic_id={this.state.current_topic_id}
                    onBinIdx={this.handleBinIdx.bind(this)}/>
            }
            var divStyle = {height: '100px'};
            return <FrameContent vertical={true}>
                <TabBar
                    activeIndex={this.state.tabIndex}
                    handleActiveIndexUpdate={this.handleActiveIndexUpdate.bind(this)}>
                    <Tab>
                        <span className='mdc-tab__text-label'>
                            {this.mapLabel}
                        </span>
                    </Tab>
                    <Tab>
                        <span className='mdc-tab__text-label'>
                            {this.chartLabel}
                        </span>
                    </Tab>
                </TabBar>
                <FrameBar
                    label={frame_name}
                    onPrevious={this.setPreviousFrame.bind(this)}
                    onNext={this.setNextFrame.bind(this)}/>
                {topArea}
                <TopicList className='flex-item'
                    topicIds = {topicIds}
                    frameId = {this.state.frame_id}
                    onTopic = {this.switch_topic.bind(this)}/>
            </FrameContent>
        } else {
            return <FrameContent>
                <div className='flex-item flex-container-vertical'>
                    <Map className='flex-item-big' 
                        frameId={frame_id}
                        topicId={this.state.current_topic_id}
                        binIdx={this.state.binIdx}
                        grid={heatmapGrid}
                        weights={heatmapWeights}
                        blendingTime={500}/>
                    <FrameBar
                        label={frame_name}
                        onPrevious={this.setPreviousFrame.bind(this)}
                        onNext={this.setNextFrame.bind(this)}/>
                    <BarChart className='flex-item' 
                        frame_id={this.state.frame_id} 
                        topic_id={this.state.current_topic_id}
                        onBinIdx={this.handleBinIdx.bind(this)}/>
                </div>
                <TopicList className='right-sheet'
                    topicIds = {topicIds}
                    frameId = {this.state.frame_id}
                    onTopic = {this.switch_topic.bind(this)}/>
            </FrameContent>
        }
    }
}

export default PopularTopicsPage;