import { define } from 'be-decorated/be-decorated.js';
import { register } from "be-hive/register.js";
import { PropertyBag } from 'trans-render/lib/PropertyBag.js';
export class BeCalculating extends EventTarget {
    async intro(proxy, self) {
        const inner = self.innerHTML.trim();
        if (!inner.startsWith('export const transformGenerator = ')) {
            self.innerHTML = 'export const transformGenerator = ' + inner;
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
    #propertyBag;
    #abortControllers;
    async onArgsAndTransformer({ args, self }) {
        this.#disconnect();
        this.#abortControllers = [];
        //construct explicit from defaults:
        const arr = Array.isArray(args) ? args : [args];
        const autoConstructed = {};
        let hasAuto = false;
        const explicit = [];
        for (const arg of arr) {
            if (typeof arg === 'string') {
                const obs = {
                    "observeName": arg,
                    "on": "input",
                    "vft": ".",
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
        this.#propertyBag = new PropertyBag();
        for (const pom of explicit) {
            await this.#doParams(pom, self);
        }
    }
    async #doParams(params, self) {
        const { hookUp } = await import('be-observant/hookUp.js');
        let lastKey = '';
        for (const propKey in params) {
            let parm = params[propKey];
            const startsWithHat = propKey[0] === '^';
            const key = startsWithHat ? lastKey : propKey;
            const info = await hookUp(parm, [self, this.#propertyBag], key);
            this.#abortControllers.push(info.controller);
            if (!startsWithHat)
                lastKey = propKey;
        }
    }
    #disconnect() {
        this.#propertyBag = undefined;
        if (this.#abortControllers !== undefined) {
            for (const ac of this.#abortControllers) {
                ac.abort();
            }
            this.#abortControllers = undefined;
        }
    }
    finale() {
        this.#disconnect();
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
            virtualProps: ['args', 'transformGenerator'],
            primaryProp: 'args',
            primaryPropReq: true,
            intro: 'intro',
            finale: 'finale'
        },
        actions: {
            onArgsAndTransformer: {
                ifAllOf: ['args', 'transformGenerator']
            }
        }
    },
    complexPropDefaults: {
        controller: BeCalculating
    }
});
register(ifWantsToBe, upgrade, tagName);
