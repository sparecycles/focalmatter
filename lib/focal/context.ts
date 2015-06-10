var currentContext = null;

class Context {
    constructor() {
        var parentContext = Context.current;

        parentContext.register(function() {
            this.release();
        }, this);
        
        currentContext = this;        
    }

    refcount: number = 1;

    cleanup: { action: () => void; args: any[]; }[] = [];

    static get current() {
        return currentContext;
    }

    static set current(context: Context) {
        currentContext = context;
    }

    retain() {
        this.refcount++;
    }

    release() {
        this.refcount--;

        if(this.refcount === 0) {
            var cleanup = this.cleanup;
            this.cleanup = [];
            cleanup.forEach(function(c) {
                Function.prototype.call.apply(c.action, c.args);
            });
        }
    }

    register(action: () => void, self?: Object, ...fnargs: any[]);

    register(action: () => void, ...call_args: any[]) {
        this.cleanup.push({
            action: action,
            args: call_args
        });
    }
}

export = Context;