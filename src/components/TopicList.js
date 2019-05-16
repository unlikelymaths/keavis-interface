import React,{Component} from "react";

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
            if (typeof(this.props['onTopic']) !== 'undefined') {
                this.props.onTopic(null)
            }
        } else {
            this.setState({currentTopicId: topicId});
            if (typeof(this.props['onTopic']) !== 'undefined') {
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
                (topic_id) => <TopicCard key={topic_id}
                    onClick={this.switch_topic.bind(this)}
                    highlight={(topicId) => topicId == this.state.currentTopicId}
                    topic_id={topic_id} 
                    frame_id={this.props.frameId}
                    size={[400,150]}/>)
        }
        return <div 
            style={this.props.style}
            className={'topic-list ' + this.props.className}>
            {topicList}
        </div>
    }
}
export default TopicList