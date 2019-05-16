import $ from 'jquery';
import React from 'react';
import ReactResizeDetector from 'react-resize-detector';

import L from 'leaflet';
import 'leaflet.heat/dist/leaflet-heat.js';
import 'leaflet/dist/leaflet.css';

import './map.scss';


class HeatLayer {
    static heat_id_counter = 0;
    static settings = {
        radius: 15, 
        blur: 15, 
        minOpacity: 0.35
        };
    
    constructor(map, latLngs) {
        this.map = map;
        this.id = HeatLayer.heat_id_counter++;
        this.addLayer(latLngs);
        this.setOpacity(0);
    }
    
    clear() {
        this.map.removeLayer(this.heatLayer)
    }
    
    addLayer(latLngs) {
        this.heatLayer = L.heatLayer(latLngs, HeatLayer.settings).addTo(this.map);
        var theCanvases = document.getElementsByTagName("canvas");
        for (var i=0; i < theCanvases.length; i++) { 
            var myCanvas = theCanvases[i];
            var attr = $(myCanvas).attr('id');
            if( typeof(attr) === 'undefined') {
                $(myCanvas).attr('id', this.id);
                break;
            }
        }
        this.docElement = document.getElementById(this.id);
    }
    
    setOpacity(opacity) {
        if (opacity > 1) {
            opacity = 1;
        } else if (opacity < 0) {
            opacity = 0;
        }
        this.opacity = opacity;
        this.docElement.style.opacity = opacity;
    }
    
    changeOpacity(blendingFactor) {
        this.setOpacity(this.opacity + blendingFactor);
    }
}


class HeatLayerList {
    
    constructor(map, blendingTime) {
        this.map = map;
        this.timerDuration = 1000/25
        this.blendingFactor = 1 / (blendingTime / this.timerDuration);
        this.timer = null;
        this.list = [];
    }
    
    clear() {
        this.clearTimer();
        for (var i = this.list.length-1; i >= 0; --i) {
            this.removeLayer(i);
        }
    }
    
    addLayer(latLngs) {
        this.list.push(new HeatLayer(this.map, latLngs));
        this.setTimer();
    }
    
    removeLayer(idx) {
        this.list[idx].clear();
        this.list.splice(idx, 1);
    }
    
    setTimer() {
        this.clearTimer();
        this.timer = setInterval(this.tick.bind(this),this.timerDuration);
    }
    
    clearTimer() {
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    tick() {
        for (var i = 0; i < this.list.length - 1; ++i) {
            this.list[i].changeOpacity(-this.blendingFactor);
            if (this.list[i].opacity == 0) {
                this.removeLayer(i--);
            }
                
        }
        if (this.list.length >= 1) {
            this.list[this.list.length-1].changeOpacity(this.blendingFactor);
        }
        
        if (this.list.length == 1 && this.list[0].opacity == 1) {
            this.clearTimer()
        }
    }
}


class Map extends React.Component {
    constructor(props){
        super(props);
        this.currentFrameID = null;
        this.heatLayers = null;
        
        // After resizing the dom element the size of leaflet-heat
        // needs to be invalidated. The ReactResizeDetector
        // calls the onResize function.
        // If there has not been any recent resize (wasInvalidatedRecently)
        // the function invalidateSize() is called immediately.
        // Otherwise a invalidation is requested once the timer runs oute
        // (requestInvalidation).
        // A timer (invalidateTimeout) is started or restarted each call
        // to reset the value of wasInvalidatedRecently.
        this.invalidateTimeout = null;
        this.wasInvalidatedRecently = false;
        this.requestInvalidation = false;
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.frameID != this.currentFrameID) {
            this.currentFrameID = nextProps.frameID;
            var latLngs = nextProps.heatmap.map(d => [d[1],d[0]]);
            if (this.heatLayers != null) {
                this.heatLayers.addLayer(latLngs);
            }
        }
        return false;
    }
        
    componentDidMount() {
        this.map = L.map('map', {
            center: [34.069594, -118.442999],
            zoom: 10,
            layers: [
                L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://osm.org/copyright">' +
                                 'OpenStreetMap</a> contributors'
                    }),
                ]
            });
        this.heatLayers = new HeatLayerList(this.map, this.props.blendingTime);
    }
     
    componentWillUnmount() {
        this.heatLayers.clear();
    }
  
    render() {
        return <div style={this.props.style} className={this.props.className}>
              <ReactResizeDetector 
                handleWidth 
                handleHeight 
                onResize={this.onResize.bind(this)} />
              <div id="map"></div>
            </div>;
    }
    
    allowNewInvalidation() {
        if (this.requestInvalidation) {
            this.invalidateSize();
        }
        this.requestInvalidation = false;
        this.wasInvalidatedRecently = false;
        this.invalidateTimeout = null;
    }
    
    invalidateSize() {
        if (this.map != null) {
            this.map.invalidateSize();
        }
    }
    
    onResize(width, height) {
        if (this.wasInvalidatedRecently) {
            this.requestInvalidation = true;
        } else {
            this.invalidateSize()
            this.wasInvalidatedRecently = true;
            this.requestInvalidation = false;
        }
        if (this.invalidateTimeout != null) {
            clearTimeout(this.invalidateTimeout);
        }   
        this.invalidateTimeout = setTimeout(
            this.allowNewInvalidation.bind(this),
            100);
    }
}

export default Map;