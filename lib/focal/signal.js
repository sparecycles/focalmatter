var classify = require('./classify').classify;

var signal = exports.Signal = classify('Signal', {
    constructor: function() {
        this.listeners = [];
    },
    prototype: {
        publish: function() {
            var args = Array.prototype.slice.call(arguments);
            this.listeners = this.listeners.filter(function(l) {
                try {
                    l.listener.apply(null, args);
                } finally {
                    return ! l.once;
                }
            });
        },
        subscribe: function(listener, once) {
            this.listeners.push({
                listener: listener,
                once: once
            });
        },
        unsubscribe: function(listener) {
            this.listeners = this.listeners.filter(function(l) {
                return l.listener !== listener;
            });
        }
    }
});
