import React,{Component} from "react";
import Button from '@material/react-button';
import PropTypes from 'prop-types';
import {Button as TypograpyButton, Overline} from '@material/react-typography';
import TopicCard from "./TopicCard";

import '@material/react-typography/index.scss';

import './FrameBar.scss';

class FrameBar extends Component {
    constructor(props){
        super(props)
    }
    
    onPreviousButton() {
        if (typeof(this.props['onPrevious']) !== 'undefined') {
            this.props.onPrevious(null);
        }
    }
    
    onNextButton() {
        if (typeof(this.props['onNext']) !== 'undefined') {
            this.props.onNext(null);
        }
    }
    
    render() {
        var previousButton =  <Button 
                onClick={this.onPreviousButton.bind(this)}>
                Previous
            </Button>
            
        var nextButton =<Button 
                onClick={this.onNextButton.bind(this)}>
                Next
            </Button>
            
        return  <div className={'frame-bar ' + this.props.className} style={this.props.style}>
                {previousButton}
                <div className='flex-item'/>
                <Overline>
                    {this.props.label}
                </Overline>
                <div className='flex-item'/>
                {nextButton}
            </div>
    }
}
FrameBar.propTypes = {
  onPrevious: PropTypes.func,
  onNext: PropTypes.func,
  label: PropTypes.node
}
export default FrameBar