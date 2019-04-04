import $ from "jquery";
import React from "react";

import Button from '@material/react-button';

import {FrameContent} from "../components/Frame";



class AboutPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    
    componentDidMount() {
    }
    
    componentWillUnmount() {
    }
    
    recieve_framesummary(framesummary) {
        this.setState({
            current_framesummary: framesummary,
            frame_id: framesummary.frame_id,
            current_topic_id: null
            });
    }
    
    render() {
        return <FrameContent className='frame-content flex-container'>
        
            <div className='flex-item flex-container'>
                <div className='flex-item'>
                    Hi
                </div>
                <div className='flex-item-big'>
                    Hi
                </div>
            </div>
        </FrameContent>
    }
}

export default AboutPage;