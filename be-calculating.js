import { define } from 'be-decorated/be-decorated.js';
import { register } from "be-hive/register.js";
import { BeSyndicating } from 'be-syndicating/be-syndicating.js';
export class BeCalculating extends BeSyndicating {
    importSymbols({ proxy, importCalculatorFrom, importTransformFrom, self }) {
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
                //Object.assign(proxy, (self as any)._modExport);
                if (importCalculatorFrom !== undefined) {
                    const calculator = self._modExport[importCalculatorFrom];
                    if (calculator !== undefined) {
                        proxy.calculator = calculator;
                    }
                }
                if (importTransformFrom !== undefined) {
                    const transform = self._modExport[importTransformFrom];
                    if (transform !== undefined) {
                        proxy.transform = transform;
                    }
                }
            }, { once: true });
        }
    }
    strArgToIObs({ from, get, on }, arg) {
        const o = { ...from, ...get, ...on };
        if (from === undefined) {
            o.observeName = arg;
        }
        if (get === undefined) {
            o.vft = 'value';
        }
        if (on === undefined) {
            o.on = 'input';
        }
        return o;
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
        if (syndicate.self === undefined) {
            syndicate.self = syndicate; //should this be done in PropertyBag?
        }
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
    async #getTransformTarget({ transformScope, self }) {
        let elToTransform = null;
        const { parent, rootNode, closest } = transformScope;
        if (closest) {
            elToTransform = self.closest(closest);
        }
        else if (rootNode) {
            elToTransform = self.getRootNode();
        }
        else {
            elToTransform = self.parentElement;
        }
        if (elToTransform === null)
            throw 'bC.404';
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
                'args', 'calculator', 'transformScope', 'from', 'get', 'on',
                'transform', 'props', 'importCalculatorFrom', 'importTransformFrom',
                'transformScope'
            ],
            primaryProp: 'args',
            primaryPropReq: true,
            finale: 'finale',
            proxyPropDefaults: {
                transformScope: {
                    parent: true
                },
                importCalculatorFrom: 'calculator',
                importTransformFrom: 'transform'
            }
        },
        actions: {
            hookUpTransform: 'transform',
            listen: 'args',
            hookupCalc: {
                ifAllOf: ['props', 'calculator']
            },
            importSymbols: {
                ifKeyIn: ['importCalculatorFrom', 'importTransformFrom']
            }
        }
    },
    complexPropDefaults: {
        controller: BeCalculating
    }
});
register(ifWantsToBe, upgrade, tagName);
