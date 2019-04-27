import $ from "jquery";
import React from 'react';

import ReactResizeDetector from 'react-resize-detector';

import L from 'leaflet';
import 'leaflet.heat/dist/leaflet-heat.js';
import 'leaflet/dist/leaflet.css';

import './map.scss';

class Map extends React.Component {
    constructor(props){
        super(props)
        this.heat = null
        this.blendingTimer = null
        this.currentFrameID = null
        
        // After resizing the dom element the size of leaflet-heat
        // needs to be invalidated. The ReactResizeDetector
        // calls the onResize function.
        // If there has not been any recent resize (wasInvalidatedRecently)
        // the function invalidateSize() is called immediately.
        // Otherwise a invalidation is requested once the timer runs oute
        // (requestInvalidation).
        // A timer (invalidateTimeout) is started or restarted each call
        // to reset the value of wasInvalidatedRecently.
        this.invalidateTimeout = null
        this.wasInvalidatedRecently = false
        this.requestInvalidation = false
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.frameID != this.currentFrameID) {
            this.currentFrameID = nextProps.frameID
            var swapedData = nextProps.heatmap.map(d => [d[1],d[0]])
            if (this.heat != null) {
                this.heat.setLatLngs(swapedData)
            }
            this.opacity = 0
            this.blendingTimer = setInterval(this.tick.bind(this),1000/25);
        }
        return false;
    }
    
    add_heat_layer(heat_id, opacity) {
        var heat_layer = L.heatLayer([[0,0]], {radius: 15, blur: 15, minOpacity: 0.35}).addTo(this.map);
        var theCanvases = document.getElementsByTagName("canvas");
        /* setting canvas Ids */
        for (var i=0; i < theCanvases.length; i++) { 
            var myCanvas = theCanvases[i];
            var attr = $(myCanvas).attr('id');
            if( typeof(attr) === 'undefined') {
                $(myCanvas).attr('id', heat_id);
                break;
            }
        }
        document.getElementById(heat_id).style.opacity = opacity; 
        return heat_layer
    }
    
    componentDidMount() {
        this.map = L.map('map', {
            center: [34.069594, -118.442999],
            zoom: 10,
            layers: [
                L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    }),
                ]
            });
        this.heat = this.add_heat_layer('heatmap_0', 0)
        this.opacity = 0
    }
  
    
    tick() {
        var speed = 0.05
        this.opacity = this.opacity + speed;
        if (this.opacity >= 1) {
            clearInterval(this.blendingTimer);
            this.opacity = 1
        }
        document.getElementById('heatmap_0').style.opacity=this.opacity; 
    }
    
    render() {
        return <div className={this.props.className}>
                <ReactResizeDetector handleWidth handleHeight onResize={this.onResize.bind(this)} />
                <div id="map"></div>
            </div>
    }
    
    allowNewInvalidation() {
        if (this.requestInvalidation) {
            this.invalidateSize()
        }
        this.requestInvalidation = false
        this.wasInvalidatedRecently = false
        this.invalidateTimeout = null
    }
    
    invalidateSize() {
        if (this.map != null) {
            this.map.invalidateSize()
        }
    }
    
    onResize(width, height) {
        if (this.wasInvalidatedRecently) {
            this.requestInvalidation = true
        } else {
            this.invalidateSize()
            this.wasInvalidatedRecently = true
            this.requestInvalidation = false
        }
        if (this.invalidateTimeout != null) {
            clearTimeout(this.invalidateTimeout);
        }   
        this.invalidateTimeout = setTimeout(
            this.allowNewInvalidation.bind(this),
            100)
        
    }
}

export default Map;