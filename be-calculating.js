import { define } from 'be-decorated/be-decorated.js';
import { register } from "be-hive/register.js";
import { PropertyBag } from 'trans-render/lib/PropertyBag.js';
export class BeCalculating extends EventTarget {
    #propertyBag = new PropertyBag();
    #abortControllers;
    insertBoilerplate({ proxy, self }) {
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
    hookUpStaticTransform({ proxy }) {
        proxy.readyToListen = true;
    }
    hookUpDynamicTransform({ transformGenerator, proxy }) {
        this.#propertyBag?.addEventListener('prop-changed', e => {
            proxy.dynamicTransform = proxy.transformGenerator(this.#propertyBag.proxy);
        });
        proxy.readyToListen = true;
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
            await this.#doParams(pom, self);
        }
    }
    async doDynamicTransform({ dynamicTransform, self, transformParent }) {
        const { DTR } = await import('trans-render/lib/DTR.js');
        const ctx = {
            host: this.#propertyBag.proxy,
            match: dynamicTransform,
        };
        let elToTransform = self;
        if (transformParent) {
            elToTransform = self.parentElement;
        }
        DTR.transform(elToTransform, ctx);
    }
    async #doParams(params, self) {
        const { hookUp } = await import('be-observant/hookUp.js');
        let lastKey = '';
        for (const propKey in params) {
            let parm = params[propKey];
            const startsWithHat = propKey[0] === '^';
            const key = startsWithHat ? lastKey : propKey;
            const info = await hookUp(parm, [self, this.#propertyBag.proxy], key);
            this.#abortControllers.push(info.controller);
            if (!startsWithHat)
                lastKey = propKey;
        }
    }
    #disconnect() {
        //this.#propertyBag = undefined;
        if (this.#abortControllers !== undefined) {
            for (const ac of this.#abortControllers) {
                ac.abort();
            }
            this.#abortControllers = undefined;
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
                'args', 'transformGenerator', 'transformParent', 'defaultEventType', 'defaultObserveType', 'defaultProp',
                'dynamicTransform', 'staticTransform', 'insertedBoilerPlate', 'scriptLoaded', 'readyToListen', 'readyToTransform'
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
            insertBoilerplate: {
                ifNoneOf: ['staticTransform']
            },
            loadScript: {
                ifAtLeastOneOf: ['staticTransform', 'insertedBoilerPlate']
            },
            hookUpDynamicTransform: {
                ifAllOf: ['scriptLoaded'],
                ifNoneOf: ['staticTransform'],
            },
            hookUpStaticTransform: {
                ifAllOf: ['staticTransform', 'scriptLoaded'],
                ifNoneOf: ['readyToListen']
            },
            listen: {
                ifAllOf: ['readyToListen', 'args']
            },
            doDynamicTransform: {
                ifAllOf: ['readyToTransform', 'dynamicTransform']
            }
        }
    },
    complexPropDefaults: {
        controller: BeCalculating
    }
});
register(ifWantsToBe, upgrade, tagName);
