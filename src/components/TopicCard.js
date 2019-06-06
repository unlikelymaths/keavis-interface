import React,{Component} from "react";
import PropTypes from 'prop-types';
import ReactResizeDetector from 'react-resize-detector';
import Card, {CardPrimaryContent, CardMedia, CardActions, CardActionButtons,
    CardActionIcons} from "@material/react-card";
import '@material/react-card/dist/card.css';

import Loader from 'react-loader-spinner'

import topicBuffer from '../TopicBuffer'
import WordCloud from '../util/wordcloud/wordCloud'


class TopicCard extends Component {
    constructor(props){
        super(props);
        this.state = {visible: false,
                      loading: false,
                      topicframe: null,
                      size: {width: 320, height: 180}
                      };
        this.ref = React.createRef();
    }

    componentDidMount() {
        // Add callbacks to check visibility
        this.visibilityCallback = this.checkVisibility.bind(this);
        window.addEventListener('resize', this.visibilityCallback, false);
        var topicLists = document.getElementsByClassName('topic-list');
        for (var i=0; i < topicLists.length; ++i) {
            topicLists[i].addEventListener('scroll', 
                this.visibilityCallback, false);
        }
    }

    componentWillUnmount() {
        // Remove visibility callbacks
        window.removeEventListener('resize', this.visibilityCallback, false);
        var topicLists = document.getElementsByClassName('topic-list');
        for (var i=0; i < topicLists.length; ++i) {
            topicLists[i].removeEventListener('scroll', 
                this.visibilityCallback, false);
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (this.state.visible == prevState.visible &&
            this.props.topicId == prevProps.topicId &&
            this.props.frameId == prevProps.frameId) {
            return;
        }
        // No valid ids set
        if (this.props.topicId == null ||
            this.props.frameId == null) {
            this.setState({loading: false,
                           topicframe: null});
            return;
        }
        // Not visible
        if (this.state.visible == false) {
            return;
        }
        // Valid ids and no current data
        if (this.state.topicframe == null) {
            this.setState({loading: true});
            this.requestTopicframe();
        // One or both ids have changed
        } else if (this.state.topicframe.frameId != this.props.frameId ||
                   this.state.topicframe.topicId != this.props.topicId) {
            // Topic has changed
            if (this.state.topicframe.topicId != this.props.topicId) {
                this.setState({loading: true, topicframe: null});
            }
            this.requestTopicframe();
        }
    }

    clicked() {
        if (this.props.onClick) {
            this.props.onClick(this.props.topicId)
        }
    }

    requestTopicframe() {
        topicBuffer.topicframe(this.props.frameId, this.props.topicId,
            this.receiveTopicframe.bind(this));
    }

    receiveTopicframe(topicframe) {
        this.setState({loading: false, topicframe: topicframe});
    }

    checkVisibility() {
        var visible = false;
        if (this.ref.current !== null)
        {
            var bounding = this.ref.current.getBoundingClientRect();
            visible = (bounding.bottom >= 0 &&
                       bounding.right >= 0 &&
                       bounding.left <= (window.innerWidth || document.documentElement.clientWidth) &&
                       bounding.top <= (window.innerHeight || document.documentElement.clientHeight));
        }
        this.setState({visible: visible});
    }

    onResize(width, height) {
        this.setState({size: {width: width, height: width/16*9}});
        this.checkVisibility();
    }

    getCardContent() {
        var style = {
            width: this.state.size.width,
            height: this.state.size.height
        };
        if (this.state.loading) {
            return <div style={style}>
                    <div style={{position: "absolute", 
                                 left: this.state.size.width/2 - 25,
                                 top: this.state.size.height/2 - 25}}>
                        <Loader
                            type="Oval"
                            color="#00BFFF"
                            height="50"	
                            width="50"/>
                    </div>
                </div>;
        } else if (this.state.topicframe == null) {
            return <div style={style}/>
        } else {
            return <WordCloud size={this.state.size}
                        visible={this.state.visible}
                        topicframe={this.state.topicframe}/>
        }
    }

    getCardStyle() {
        if (this.props.highlight == true) {
            return {backgroundColor: 'lightblue'}
        } else {
            return {}
        }
    }

    render() {
        return <div style={{margin: 10}} ref={this.ref}>
                <Card style={{height: this.state.size.height}}>
                    <CardPrimaryContent
                    style={this.getCardStyle()}
                    onClick={this.clicked.bind(this)}>
                    {this.getCardContent()}
                    </CardPrimaryContent>
                </Card>
                <ReactResizeDetector handleWidth
                    onResize={this.onResize.bind(this)} />
            </div>;
    }
}
TopicCard.propTypes = {
  frameID: PropTypes.number,
  topicId: PropTypes.number,
  binIdx: PropTypes.number,
  highlight: PropTypes.bool,
  onClick: PropTypes.func
}
export default TopicCard