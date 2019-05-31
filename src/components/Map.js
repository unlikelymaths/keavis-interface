import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';
import ReactResizeDetector from 'react-resize-detector';

import L from 'leaflet';
import 'leaflet.heat/dist/leaflet-heat.js';
import 'leaflet/dist/leaflet.css';

import topicBuffer from '../TopicBuffer'

import './map.scss';


class HeatLayer {
    static heat_id_counter = 0;
    static settings = {
        max: 0.8,
        radius: 15, 
        blur: 15, 
        minOpacity: 0.35
        };
    
    constructor(map, latLngs) {
        this.map = map;
        this.id = HeatLayer.heat_id_counter++;
        this.latLngs = latLngs;
        this.addLayer();
        this.setOpacity(0);
    }
    
    clear() {
        this.map.removeLayer(this.heatLayer)
    }
    
    addLayer() {
        this.heatLayer = L.heatLayer(this.latLngs, HeatLayer.settings).addTo(this.map);
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
    
    update(weights) {
        this.latLngs = this.latLngs.map((e,i) =>
            [e[0], e[1], weights[i]]);
        this.heatLayer.setLatLngs(this.latLngs)
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
    
    updateLayer(weights) {
        if (this.list.length == 0) {
            return;
        }
        this.list[this.list.length-1].update(weights);
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
        this.frameId = null;
        this.topicId = null;
        this.binIdx = null;
        this.heatLayers = null;
        this.framesummary = null;
        this.topicframe = null;
        
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
        // Check if anything is changed
        if (nextProps.frameId != this.frameId ||
            nextProps.topicId != this.topicId ||
            nextProps.binIdx != this.binIdx ) {
            // Update values
            this.frameId = nextProps.frameId;
            this.topicId = nextProps.topicId;
            this.binIdx = nextProps.binIdx;
            // If the frame has changed, its grid/weights are no longer valid
            if (this.framesummary != null &&
                this.frameId != this.framesummary.id) {
                this.framesummary = null;
                this.topicframe = null;
            }
            // If the topicId has changed, the topicframe is no longer valid
            if (this.topicframe != null &&
                this.topicId != this.topicframe.topicId) {
                this.topicframe = null;
            }
            // Cannot display null frameId
            if (this.frameId == null && this.heatLayers != null) {
                this.heatLayers.clear();
            } else {
                this.requestData();
            }
        }
        return false;
    }

    requestData() {
        // Always need a valid framesummary for the grid
        if (this.framesummary == null) {
            topicBuffer.framesummary(this.frameId,
                this.receiveFramesummary.bind(this))
        } else if (this.topicId == null) {
            this.makeHeatmapLayer(true)
        }
        // Only load topicframe when is is needed
        if (this.topicId != null) {
            topicBuffer.topicframe(this.frameId, this.topicId,
                this.receiveTopicframe.bind(this))
        }
    }

    receiveFramesummary(framesummary) {
        if (framesummary == null ||
            framesummary.id != this.frameId) {
            return;
        }
        this.framesummary = framesummary;
        this.makeHeatmapLayer(false);
    }

    receiveTopicframe(topicframe) {
        if (topicframe == null ||
            topicframe.topicId != this.topicId ||
            topicframe.frameId != this.frameId) {
            return;
        }
        this.topicframe = topicframe;
        this.makeHeatmapLayer(true);
    }

    grabEntry(weights, idx, binIdx) {
        var weight = weights[idx];
        if (weight === 0) {
            return 0;
        }
        if (binIdx == null) {
            return Math.log(weight[0]+1);
        } else {
            return Math.log(weight[1][binIdx]+1);
        }
    }

    makeHeatmapLayer(update) {
        // Cannot create heatlayer without grid or topicframe (if required)
        if (this.framesummary == null ||
            (this.topicId != null && this.topicframe == null ||
             this.heatLayers == null)) {
            return
        }

        if (update) {
            console.log('update');
            var weights = null;
            if (this.topicId != null) {
                weights = this.framesummary.heatmapGrid.map((e, i) =>
                    this.grabEntry(
                        this.topicframe.heatmapWeights,i,this.binIdx));
            } else {
                weights = this.framesummary.heatmapGrid.map((e, i) =>
                    this.grabEntry(
                        this.framesummary.heatmapWeights,i,this.binIdx));
            }
            this.heatLayers.updateLayer(weights);
        } else {
            console.log('set');
            var latLngs = null;
            if (this.topicId != null) {
                latLngs = this.framesummary.heatmapGrid.map((e, i) =>
                    [e[1], e[0], this.grabEntry(
                        this.topicframe.heatmapWeights,i,this.binIdx)]
                    );
            } else {
                latLngs = this.framesummary.heatmapGrid.map((e, i) =>
                    [e[1], e[0], this.grabEntry(
                        this.framesummary.heatmapWeights,i,this.binIdx)]
                    );
            }
            this.heatLayers.addLayer(latLngs);
        }
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
Map.propTypes = {
    frameId: PropTypes.number,
    topicId: PropTypes.number,
    binIdx: PropTypes.number,
    blendingTime: PropTypes.number
};
Map.defaultProps = {
    frameId: null,
    topicId: null,
    binIdx: null,
    blendingTime: 500
};
export default Map;