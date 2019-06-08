import React,{Component} from "react";
import PropTypes from 'prop-types';

import TopicCard from "./TopicCard";

import './TopicList.scss';

class TopicList extends Component {
    constructor(props){
        super(props)
        this.state = {currentTopicId: null};
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }
    
    switch_topic(topicId) {
        if (this.state.currentTopicId == topicId) {
            this.setState({currentTopicId: null});
            if (typeof(this.props.onTopic) !== 'undefined') {
                this.props.onTopic(null)
            }
        } else {
            this.setState({currentTopicId: topicId});
            if (typeof(this.props.onTopic) !== 'undefined') {
                this.props.onTopic(topicId)
            }
        }
    }
    
    render() {
        var topicList = null
        if (this.props.frameId == null ||
            this.props.topicIds == null || 
            this.props.topicIds.length == 0) {
            topicList = 'Loading...'
        } else {
            topicList = this.props.topicIds.map(
                (topicId) => <TopicCard key={topicId}
                    onClick={this.switch_topic.bind(this)}
                    highlight={topicId == this.state.currentTopicId}
                    topicId={topicId}
                    frameId={this.props.frameId}
                    binIdx={this.props.binIdx}
                    size={[200,50]}/>)
        }
        return <div 
            style={this.props.style}
            className={'topic-list ' + this.props.className}>
            {topicList}
        </div>
    }
}
TopicCard.propTypes = {
  frameID: PropTypes.number,
  topicIds: PropTypes.arrayOf(PropTypes.number),
  binIdx: PropTypes.number,
  className: PropTypes.string,
  onTopic: PropTypes.func
}
export default TopicList