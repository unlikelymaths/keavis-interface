import $ from 'jquery';

const api_base = 'data/'

class LimitBuffer {
    constructor(max_len) {
        this.data = {}
        this.max_len = max_len
    }
    
    insert(key, obj) {
        this.data[key] = obj
    }
    
    get(key) {
        return this.data[key]
    }
    
    contains(key) {
        return this.data.hasOwnProperty(key)
    }
}

function make_key(obj1, obj2) {
    return String(obj1) + String(obj2)
}

class TopicBuffer {

    constructor() {
        console.log('New Buffer')
        this.latest_frame_id = null;
        this.topics = new LimitBuffer(100);
        this.framesummaries = new LimitBuffer(100);
    }
    
    // callback(framesummary)
    get_latest_framesummary(callback) {
        if (this.latest_frame_id != null) {
            this.get_framesummary(this.latest_frame_id, callback);
        } else {
            function handle_data(framesummary) {
                this.latest_frame_id = framesummary.frame_id
                this.framesummaries.insert(framesummary.frame_id, framesummary)
                callback(framesummary)
            }
            const request = api_base + 'framesummary/20190202'
            console.log(request)
            $.getJSON(request, handle_data.bind(this));
        }
    }
    
    // callback(framesummary)
    get_framesummary(frame_id, callback) {
        if (frame_id == null) {
            callback(null)
            return
        }
        if (this.framesummaries.contains(frame_id)) {
            callback(this.framesummaries.get(frame_id))
        } else {
            function handle_data(framesummary) {
                this.latest_frame_id = framesummary.frame_id
                this.framesummaries.insert(framesummary.frame_id, framesummary)
                callback(framesummary)
            }
            const request = api_base + 'framesummary/' + frame_id
            console.log(request)
            $.getJSON(request, handle_data.bind(this));
        }
    }
    
    // callback(topic)
    get_topicframe(topic_id, frame_id, callback) {
        if (topic_id == null || frame_id == null) {
            callback(null)
            return
        }
        var key = make_key(topic_id, frame_id)
        if (this.topics.contains(key)) {
            callback(this.topics.get(key))
        } else {
            function handle_data(topic) {
                this.topics.insert(key, topic)
                callback(topic)
            }
            var dataurl = api_base + 'topicframe/' + topic_id + '/' + frame_id;
            $.getJSON(dataurl, handle_data.bind(this));
        }
    }
}

var topicBuffer = new TopicBuffer();

export default topicBuffer;