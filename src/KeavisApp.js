import $ from "jquery";
import React, {Component} from 'react';

import {frameTitle} from './config'
import PopularTopicsPage from "./pages/PopularTopicsPage";
import AboutPage from "./pages/AboutPage";
import Frame from "./components/Frame";

class KeavisApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {frameName: null,
                      pageIdx: 0};
    }
    
    componentDidMount() {
        $(document).keypress(this.keypress.bind(this));
    }
    
    componentWillUnmount() {
    }
    
    keypress(e) {
        console.log(e)
        console.log(e.keyCode)
        switch(e.keyCode) {
        case 37: // Arrow Left
            //this.previous_frame()
            console.log('Keypres implementation missing.')
            break;
        case 39: // Arrow Right
            //this.next_frame()
            console.log('Keypres implementation missing.')
            break;
        default:
        } 
    }
    
    handleSelect(idx) {
        this.setState({pageIdx: idx})
    }
      
    render() {
        var fullFrameTitle = frameTitle
        var page = null
        if (this.state.pageIdx <= 2) {
            page = <PopularTopicsPage/>
        } else if (this.state.pageIdx == 6) {
            page = <AboutPage/>
        }
        if (this.state.frameName != null) {
            fullFrameTitle = fullFrameTitle + ' - ' + this.state.frameName
        }
        return <Frame title={fullFrameTitle}
            handleSelect={this.handleSelect.bind(this)}>
                {page}
        </Frame>
    }
}

export default KeavisApp;