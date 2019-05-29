import $ from "jquery";

import React from "react";
import {Headline1, Body1} from '@material/react-typography';

import {FrameContent} from "../components/Frame";
import content from './AboutPage/content.json'

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
        return <FrameContent vertical={true}>
                <Headline1>
                    {content.title}
                </Headline1>
                <Body1>
                    {content.content}
                </Body1>
            </FrameContent>
    }
}

export default AboutPage;