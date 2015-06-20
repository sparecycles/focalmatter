module util {
    export interface Index<V> {
        [_: number]: V;
    }

    export function memoize_number<T>(fn: (n: number) => T) {
        var memory: Index<T> = {};
        return (n: number) => {
            var m = memory[n];
            if (m !== undefined) {
                return m;
            }

            return memory[n] = fn(n);
        }
    }

    export interface Map<V> {
        [_: string]: V;
    }

    export function memoize_string<T>(fn: (n: string) => T) {
        var memory: Map<T> = {};
        return (n: string) => {
            var m = memory[n];
            if (m !== undefined) {
                return m;
            }

            return memory[n] = fn(n);
        }
    }
}

export = util;