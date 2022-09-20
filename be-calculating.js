import { define } from 'be-decorated/be-decorated.js';
import { register } from "be-hive/register.js";
import { BeSyndicating } from 'be-syndicating/be-syndicating.js';
export class BeCalculating extends BeSyndicating {
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
                //[TODO]: plugins: transformPlugins,
            };
            const dtr = new DTR(ctx);
            const fragment = await this.#getTransformTarget(pp);
            await dtr.transform(fragment);
            await dtr.subscribe(true);
        }
    }
    #proxyControllers;
    async hookupCalc({ calculator, props, proxy }) {
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
        proxy.resolved;
    }
    async #getTransformTarget({ transformParent, self }) {
        let elToTransform = self;
        if (transformParent) {
            elToTransform = self.parentElement;
        }
        return elToTransform;
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
        this.#disconnectProxyListeners();
        super.finale();
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
