import { define } from 'be-decorated/be-decorated.js';
import { register } from "be-hive/register.js";
import { PropertyBag } from 'trans-render/lib/PropertyBag.js';
export class BeCalculating extends EventTarget {
    #propertyBag = new PropertyBag();
    syndicate = this.#propertyBag.proxy;
    intro(proxy, self) {
        const inner = self.innerHTML.trim();
        if (!inner.startsWith('export const calculator = ')) {
            self.innerHTML = 'export const calculator = ' + inner;
        }
        self.setAttribute('be-exportable', '');
        import('be-exportable/be-exportable.js');
        if (self._modExport) {
            Object.assign(proxy, self._modExport);
        }
        else {
            self.addEventListener('load', e => {
                Object.assign(proxy, self._modExport);
            }, { once: true });
        }
    }
    async hookUpTransform(pp) {
        const { transform } = pp;
        const transforms = Array.isArray(transform) ? transform : [transform];
        const { DTR } = await import('trans-render/lib/DTR.js');
        for (const t of transforms) {
            const ctx = {
                host: this.syndicate,
                match: t,
                //plugins: transformPlugins,
            };
            const dtr = new DTR(ctx);
            const fragment = await this.#getTransformTarget(pp);
            await dtr.transform(fragment);
            await dtr.subscribe(true);
        }
        //proxy.readyToListen = true;
    }
    #proxyControllers;
    async hookupCalc({ calculator, props }) {
        this.#disconnectProxyListeners();
        this.#proxyControllers = [];
        const keys = Array.from(props);
        const syndicate = this.syndicate;
        for (const key of keys) {
            const ac = new AbortController();
            this.syndicate.addEventListener(key, async (e) => {
                const calculations = await calculator(syndicate, e.detail);
                Object.assign(syndicate, calculations);
            }, { signal: ac.signal });
            this.#proxyControllers.push(ac);
        }
        const calculations = await calculator(syndicate);
        Object.assign(syndicate, calculations);
    }
    #externalControllers;
    async listen(pp) {
        const { args, self, proxy } = pp;
        this.#disconnectExternalListeners();
        this.#externalControllers = [];
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
        for (const pom of explicit) {
            await this.#doParams(pom, self, proxy);
        }
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
        const syndicate = this.#propertyBag.proxy;
        for (const propKey in params) {
            let parm = params[propKey];
            const startsWithHat = propKey[0] === '^';
            const key = startsWithHat ? lastKey : propKey;
            const info = await hookUp(parm, [self, syndicate], key);
            props.add(key);
            this.#externalControllers.push(info.controller);
            if (!startsWithHat)
                lastKey = propKey;
        }
        proxy.props = props;
    }
    #disconnectExternalListeners() {
        if (this.#externalControllers !== undefined) {
            for (const ac of this.#externalControllers) {
                ac.abort();
            }
            this.#externalControllers = undefined;
        }
    }
    #disconnectProxyListeners() {
        if (this.#proxyControllers !== undefined) {
            for (const ac of this.#proxyControllers) {
                ac.abort();
            }
            this.#proxyControllers = undefined;
        }
    }
    finale() {
        this.#disconnectExternalListeners();
        this.#disconnectProxyListeners();
        this.#propertyBag = undefined;
        this.syndicate = undefined;
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
                'args', 'calculator', 'transformParent', 'defaultEventType', 'defaultObserveType', 'defaultProp',
                'transform', 'props'
            ],
            primaryProp: 'args',
            primaryPropReq: true,
            intro: 'intro',
            finale: 'finale',
            proxyPropDefaults: {
                transformParent: true,
                defaultEventType: 'input',
                defaultObserveType: 'observeName',
                defaultProp: 'value'
            }
        },
        actions: {
            hookUpTransform: 'transform',
            listen: 'args',
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
