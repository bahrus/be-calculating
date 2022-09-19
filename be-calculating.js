import { define } from 'be-decorated/be-decorated.js';
import { register } from "be-hive/register.js";
import { PropertyBag } from 'trans-render/lib/PropertyBag.js';
export class BeCalculating extends EventTarget {
    #propertyBag = new PropertyBag();
    #abortControllers;
    insertTrGen({ proxy, self }) {
        const inner = self.innerHTML.trim();
        if (!inner.startsWith('export const transformGenerator = ')) {
            self.innerHTML = 'export const transformGenerator = ' + inner;
        }
        proxy.insertedBoilerPlate = true;
    }
    loadScript({ self, proxy, dynamicTransform: transform }) {
        self.setAttribute('be-exportable', '');
        import('be-exportable/be-exportable.js');
        if (self._modExport) {
            Object.assign(this.#propertyBag.proxy, self._modExport);
            if (transform === undefined)
                proxy.transformGenerator = self._modExport.transformGenerator; //might be null if 
            proxy.scriptLoaded = true;
        }
        else {
            self.addEventListener('load', e => {
                Object.assign(proxy, self._modExport);
                if (transform === undefined)
                    proxy.transformGenerator = self._modExport.transformGenerator; //might be null if 
            }, { once: true });
            proxy.scriptLoaded = true;
        }
    }
    async hookUpStaticTransform(pp) {
        const { proxy, transform } = pp;
        const transforms = Array.isArray(transform) ? transform : [transform];
        const { DTR } = await import('trans-render/lib/DTR.js');
        for (const t of transforms) {
            const ctx = {
                host: this.#propertyBag.proxy,
                match: t,
                //plugins: transformPlugins,
            };
            const dtr = new DTR(ctx);
            const fragment = await this.#getTransformTarget(pp);
            await dtr.transform(fragment);
            await dtr.subscribe(true);
        }
        proxy.readyToListen = true;
    }
    hookUpDynamicTransform({ proxy }) {
        this.#propertyBag?.addEventListener('prop-changed', e => {
            proxy.dynamicTransform = proxy.transformGenerator(this.#propertyBag.proxy);
        });
        proxy.readyToListen = true;
    }
    #calcControllers;
    async hookupCalc({ calculator, props }) {
        //this.#disconnect();
        this.#calcControllers = [];
        const keys = Array.from(props);
        const proxy = this.#propertyBag.proxy;
        for (const key of keys) {
            const ac = new AbortController();
            this.#propertyBag.addEventListener(key, async (e) => {
                const calculations = await calculator(proxy, e.detail);
                Object.assign(proxy, calculations);
            }, { signal: ac.signal });
            this.#calcControllers.push(ac);
        }
        const calculations = await calculator(proxy);
        Object.assign(proxy, calculations);
    }
    async listen(pp) {
        const { args, self, proxy } = pp;
        this.#disconnect();
        this.#abortControllers = [];
        const arr = Array.isArray(args) ? args : [args];
        const autoConstructed = {};
        let hasAuto = false;
        const explicit = [];
        for (const arg of arr) {
            if (typeof arg === 'string') {
                const obs = {
                    [pp.defaultObserveType]: arg,
                    "on": pp.defaultEventType,
                    "vft": pp.defaultProp,
                };
                autoConstructed[arg] = obs;
                hasAuto = true;
            }
            else {
                explicit.push(arg);
            }
        }
        if (hasAuto)
            explicit.push(autoConstructed);
        proxy.readyToTransform = true;
        for (const pom of explicit) {
            await this.#doParams(pom, self, proxy);
        }
    }
    async doDynamicTransform(pp) {
        const { dynamicTransform } = pp;
        const { DTR } = await import('trans-render/lib/DTR.js');
        const ctx = {
            host: this.#propertyBag.proxy,
            match: dynamicTransform,
        };
        const elToTransform = await this.#getTransformTarget(pp);
        DTR.transform(elToTransform, ctx);
    }
    async #getTransformTarget({ transformParent, self }) {
        let elToTransform = self;
        if (transformParent) {
            elToTransform = self.parentElement;
        }
        return elToTransform;
    }
    async #doParams(params, self, proxy) {
        const { hookUp } = await import('be-observant/hookUp.js');
        let lastKey = '';
        const props = new Set();
        for (const propKey in params) {
            let parm = params[propKey];
            const startsWithHat = propKey[0] === '^';
            const key = startsWithHat ? lastKey : propKey;
            const info = await hookUp(parm, [self, this.#propertyBag.proxy], key);
            props.add(key);
            this.#abortControllers.push(info.controller);
            if (!startsWithHat)
                lastKey = propKey;
        }
        proxy.props = props;
    }
    #disconnect() {
        //this.#propertyBag = undefined;
        if (this.#abortControllers !== undefined) {
            for (const ac of this.#abortControllers) {
                ac.abort();
            }
            this.#abortControllers = undefined;
        }
        if (this.#calcControllers !== undefined) {
            for (const ac of this.#calcControllers) {
                ac.abort();
            }
            this.#calcControllers = undefined;
        }
    }
    finale() {
        this.#disconnect();
        this.#propertyBag = undefined;
    }
}
const tagName = 'be-calculating';
const ifWantsToBe = 'calculating';
const upgrade = 'script';
define({
    config: {
        tagName,
        propDefaults: {
            upgrade,
            ifWantsToBe,
            forceVisible: [upgrade],
            virtualProps: [
                'args', 'transformGenerator', 'calculator', 'transformParent', 'defaultEventType', 'defaultObserveType', 'defaultProp',
                'dynamicTransform', 'transform', 'insertedBoilerPlate', 'scriptLoaded', 'readyToListen', 'readyToTransform', 'props'
            ],
            primaryProp: 'args',
            primaryPropReq: true,
            finale: 'finale',
            proxyPropDefaults: {
                transformParent: true,
                defaultEventType: 'input',
                defaultObserveType: 'observeName',
                defaultProp: 'value'
            }
        },
        actions: {
            insertTrGen: {
                ifNoneOf: ['transform']
            },
            loadScript: {
                ifAtLeastOneOf: ['transform', 'insertedBoilerPlate']
            },
            hookUpDynamicTransform: {
                ifAllOf: ['scriptLoaded'],
                ifNoneOf: ['transform'],
            },
            hookUpStaticTransform: {
                ifAllOf: ['transform', 'scriptLoaded'],
                ifNoneOf: ['readyToListen']
            },
            listen: {
                ifAllOf: ['readyToListen', 'args']
            },
            doDynamicTransform: {
                ifAllOf: ['readyToTransform', 'dynamicTransform']
            },
            hookupCalc: {
                ifAllOf: ['props', 'calculator']
            }
        }
    },
    complexPropDefaults: {
        controller: BeCalculating
    }
});
register(ifWantsToBe, upgrade, tagName);
