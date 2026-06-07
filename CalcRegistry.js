// @ts-check

/**
 * Sentinel value used to detect if a handler set the result.
 */
export const rguid = '__be-calculating-no-result__';

/**
 * Event dispatched for calculations.
 * Handlers set `e.r` to provide the result.
 */
export class CalcEvent extends Event {
    /** @type {Array<any>} */
    args;
    /** @type {{[key: string]: any}} */
    f;
    /** @type {any} */
    r = rguid;

    /**
     * @param {string} eventName
     * @param {Array<any>} args
     * @param {{[key: string]: any}} f
     * @param {Element} target
     */
    constructor(eventName, args, f, target) {
        super(eventName, {bubbles: true, cancelable: true});
        this.args = args;
        this.f = f;
    }
}

/**
 * Built-in aggregator functions.
 * @type {{[key: string]: (e: CalcEvent) => void}}
 */
export const aggs = {
    '+': e => e.r = e.args.reduce((acc, arg) => acc + arg, 0),
    '*': e => e.r = e.args.reduce((acc, arg) => acc * arg, 1),
    'max': e => e.r = Math.max(...e.args),
    'min': e => e.r = Math.min(...e.args),
};

/**
 * Global registry for calculation handlers.
 * Uses a single shared map since be-calculating handlers are global.
 * @type {Map<string, Function>}
 */
const handlersMap = new Map();

// Register built-in aggregators by default
for (const key in aggs) {
    handlersMap.set(key, aggs[key]);
}

export class Registry {
    /**
     * Register a handler function by name.
     * @param {string} name
     * @param {Function} handler
     */
    static register(name, handler) {
        handlersMap.set(name, handler);
    }

    /**
     * Get the global handlers map.
     * @returns {Map<string, Function>}
     */
    static getHandlers() {
        return handlersMap;
    }
}
