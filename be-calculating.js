import { define } from 'be-decorated/be-decorated.js';
import { register } from "be-hive/register.js";
import { BeSyndicating } from 'be-syndicating/be-syndicating.js';
export class BeCalculating extends BeSyndicating {
    importSymbols(pp) {
        const { proxy, nameOfCalculator, self, args } = pp;
        const inner = self.innerHTML.trim();
        if (inner.indexOf('=>') === -1) {
            const strArgs = [];
            this.getStringArgs(args, strArgs);
            const str = `export const ${nameOfCalculator} = async ({${strArgs.join(',')}}) => ({
                value: ${inner}
            })`;
            self.innerHTML = str;
        }
        else if (!inner.startsWith(`export const ${nameOfCalculator} = async `)) {
            self.innerHTML = `export const ${nameOfCalculator} = async ` + inner;
        }
        if (self._modExport) {
            this.assignScriptToProxy(pp);
            Object.assign(proxy, self._modExport);
        }
        else {
            self.setAttribute('be-exportable', '');
            import('be-exportable/be-exportable.js');
            self.addEventListener('load', e => {
                this.assignScriptToProxy(pp);
            }, { once: true });
        }
    }
    assignScriptToProxy({ nameOfCalculator, nameOfTransform, proxy, self }) {
        if (nameOfCalculator !== undefined) {
            const calculator = self._modExport[nameOfCalculator];
            if (calculator !== undefined) {
                proxy.calculator = calculator;
            }
        }
        if (nameOfTransform !== undefined) {
            const transform = self._modExport[nameOfTransform];
            if (transform !== undefined) {
                proxy.transform = transform;
            }
        }
    }
    getStringArgs(args, acc) {
        if (Array.isArray(args)) {
            for (const arg of args) {
                this.getStringArgs(arg, acc);
            }
            return;
        }
        if (typeof args === 'string') {
            acc.push(args);
        }
        else {
            for (const key in args) {
                acc.push(key);
            }
        }
    }
    strArgToIObs({ from, get, on }, arg) {
        const getConfig = typeof (get) === 'string' ? {
            vft: get
        } : get;
        const o = { ...from, ...getConfig, ...on };
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
        const { transform, self, transformScope } = pp;
        const transforms = Array.isArray(transform) ? transform : [transform];
        const { DTR } = await import('trans-render/lib/DTR.js');
        const { findRealm } = await import('trans-render/lib/findRealm.js');
        for (const t of transforms) {
            const ctx = {
                host: this.syndicate,
                match: t,
                //[TODO]: plugins: transformPlugins,
            };
            const dtr = new DTR(ctx);
            const fragment = await findRealm(self, transformScope);
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
        proxy.resolved = true;
    }
    // async #getTransformTarget({transformScope, self}: PP){
    //     let elToTransform: Element | DocumentFragment | null = null;
    //     const {parent, rootNode, closest, upSearch: us} = transformScope!;
    //     if(us !== undefined){
    //         const {upSearch} = await import('trans-render/lib/upSearch.js');
    //         elToTransform = upSearch(self, us);
    //     }else if(closest !== undefined){
    //         elToTransform = self.closest(closest);
    //     }else if(rootNode){
    //         elToTransform = self.getRootNode() as DocumentFragment;
    //     }else{
    //         elToTransform = self.parentElement!;
    //     }
    //     if(elToTransform === null) throw 'bC.404';
    //     return elToTransform;
    // }
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
                'transform', 'props', 'nameOfCalculator', 'nameOfTransform',
                'transformScope'
            ],
            primaryProp: 'args',
            primaryPropReq: true,
            finale: 'finale',
            proxyPropDefaults: {
                transformScope: ['us', ':not(script)'],
                transform: {
                    '*': 'value'
                },
                nameOfCalculator: 'calculator',
                nameOfTransform: 'transform'
            }
        },
        actions: {
            hookUpTransform: 'transform',
            listen: 'args',
            hookupCalc: {
                ifAllOf: ['props', 'calculator']
            },
            importSymbols: {
                ifKeyIn: ['nameOfCalculator', 'nameOfTransform']
            }
        }
    },
    complexPropDefaults: {
        controller: BeCalculating
    }
});
register(ifWantsToBe, upgrade, tagName);
