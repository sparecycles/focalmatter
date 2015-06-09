var classify = require('./classify').classify;

var currentContext = null;

var Context = exports.Context = classify('Context', {
    constructor: function() {
        this.cleanup = [];
        this.refcount = 1;
        var parentContext = Context.current;
        parentContext.register(function() {
            this.release();
        }, this);
        currentContext = this;
    },
    current: classify.property({
        get: function() {
            return currentContext;
        },
        set: function(c) {
            currentContext = c;
        },
        enumerable: true 
    }),
    prototype: {
        retain: function() {
            this.refcount++;
        },
        release: function() {
            this.refcount--;
            if(this.refcount === 0) {
                var cleanup = this.cleanup;
                this.cleanup = [];
                cleanup.forEach(function(c) {
                    Function.prototype.call.apply(c.action, c.args);
                });
            }
        }
    }
});
