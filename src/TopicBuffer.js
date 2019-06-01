import $ from 'jquery';

const api_base = 'data/'

class BufferEntry {

    constructor(value) {
        this.value = value;
        this.lastAccess = new Date();
    }

    getValue() {
        this.lastAccess = new Date();
        return this.value;
    }
}

class LimitBuffer {
    constructor(maxLength) {
        this.data = {};
        this.maxLength = maxLength;
    }

    insert(key, obj) {
        this.data[key] = new BufferEntry(obj);
        this.prune();
    }
    
    prune() {
        if (this.maxLength > 0) {
            var keys = Object.keys(this.data);
            while (keys.length > this.maxLength) {
                var oldestKey = keys[0];
                var oldestTime = this.data[keys[0]].lastAccess;
                for (var i=1; i<keys.length; ++i) {
                    if (this.data[keys[i]].lastAccess < oldestTime) {
                        oldestKey = keys[i];
                        oldestTime = this.data[keys[i]].lastAccess;
                    }
                }
                delete this.data[oldestKey];
                keys = Object.keys(this.data);
                console.debug('Pruning key "%s" from Buffer', oldestKey)
            }
        }
    }

    get(key) {
        return this.data[key].getValue();
    }

    contains(key) {
        return this.data.hasOwnProperty(key);
    }
}

class RequestList {

    constructor() {
        this.requests = {}
    }

    push(key, callback) {
        if (this.contains(key)) {
            this.requests[key].push(callback)
        } else {
            this.requests[key] = [callback]
        }
    }

    pop(key) {
        if (this.contains(key)) {
            const callbacks = this.requests[key]
            delete this.requests[key]
            return callbacks
        } else {
            return [];
        }
    }

    contains(key) {
        return this.requests.hasOwnProperty(key)
    }
}

var Key = {}

Key.frameIDs = function() {
    return 'frameIDs';
};
Key.latest = function() {
    return 'latest';
};
Key.framesummary = function(frameID) {
    return 'fs:' + String(frameID);
};
Key.topicframe = function(frameID, topicID) {
    return 'tf:' + String(frameID) + ':' + String(topicID);
};

class TopicBuffer {

    constructor() {
        this.frameIdList = null;
        this.latestframeID = null;
        this.topicframes = new LimitBuffer(100);
        this.framesummaries = new LimitBuffer(10);
        this.requests = new RequestList();
        this.frameIDs(()=>null)
    }

    frameIDs(callback) {
        const key = Key.frameIDs()
        if (this.frameIdList != null) {
            callback(this.frameIdList);
        } else if (this.requests.contains(key)) {
            this.requests.push(key,callback)
        } else {
            this.requests.push(key,callback)
            const request = api_base + 'frameIDs';
            const onSuccess = (frameIDs =>
                this.handleframeIDs(key, frameIDs));
            const onError = (() =>
                this.handleframeIDs(key, null));
            $.getJSON(request, onSuccess).fail(onError);
        }
    }

    handleframeIDs(key, frameIDs) {
        const callbacks = this.requests.pop(key);
        if (frameIDs === null) {
            console.warn('Cannot load frameIDs.');
            const latestCallbacks = this.requests.pop(Key.latest())
            for(const callback of latestCallbacks) {
                callback(null);
            }
        } else {
            console.debug('Loaded frameIDs');
            this.frameIdList = frameIDs;
            this.latestframeID = this.frameIdList[this.frameIdList.length - 1];
            const latestCallbacks = this.requests.pop(Key.latest())
            for(const callback of latestCallbacks) {
                this.framesummary(this.latestframeID, callback)
            }
        }
        for(const callback of callbacks) {
            callback(frameIDs);
        }
    }

    // Framesummary
    latestFramesummary(callback) {
        if (this.latestframeID !== null) {
            this.framesummary(this.latestframeID, callback);
        } else {
            this.requests.push(Key.latest(), callback)
        }
    }

    framesummary(frameID, callback) {
        if (frameID == null) {
            console.warn('Empty frameID in call to framesummary')
            callback(null)
            return
        }
        const key = Key.framesummary(frameID)
        if (this.framesummaries.contains(key)) {
            callback(this.framesummaries.get(key))
        } else if (this.requests.contains(key)) {
            this.requests.push(key,callback)
        } else {
            this.requests.push(key,callback)
            const request = api_base + 'framesummary/' + frameID
            const onSuccess = (framesummary =>
                this.handleFramesummary(key, framesummary));
            const onError = (() =>
                this.handleFramesummary(key, null));
            $.getJSON(request, onSuccess).fail(onError);
        }
    }

    handleFramesummary(key, framesummary) {
        const callbacks = this.requests.pop(key);
        if (framesummary === null) {
            console.warn('Cannot load framesummary for key "%s".',key);
        } else {
            console.debug('Loaded framesummary for key "%s".',key);
            this.framesummaries.insert(key, framesummary);
        }
        for(const callback of callbacks) {
            callback(framesummary);
        }
    }

    // Topicframe
    topicframe(frameID, topicID, callback) {
        if (frameID == null) {
            console.warn('Empty frameID in call to topicframe for "%o"',callback)
            callback(null)
            return
        }
        if (topicID == null) {
            console.warn('Empty topicID in call to topicframe')
            callback(null)
            return
        }
        const key = Key.topicframe(frameID, topicID)
        if (this.topicframes.contains(key)) {
            callback(this.topicframes.get(key))
        } else if (this.requests.contains(key)) {
            this.requests.push(key,callback)
        } else {
            this.requests.push(key,callback)
            const request = api_base + 'topicframe/' + frameID + '/' + topicID;
            const onSuccess = (topicframe =>
                this.handleTopicframe(key, topicframe));
            const onError = (() =>
                this.handleTopicframe(key, null));
            $.getJSON(request, onSuccess).fail(onError);
        }
    }

    handleTopicframe(key, topicframe) {
        const callbacks = this.requests.pop(key);
        if (topicframe === null) {
            console.warn('Cannot load topicframe for key "%s".',key);
        } else {
            console.debug('Loaded topicframe for key "%s".',key);
            this.topicframes.insert(key, topicframe);
        }
        for(const callback of callbacks) {
            callback(topicframe);
        }
    }
}

var topicBuffer = new TopicBuffer();

export default topicBuffer;