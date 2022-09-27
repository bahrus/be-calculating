import {define, BeDecoratedProps} from 'be-decorated/be-decorated.js';
import {Actions, VirtualProps, PP, Proxy, ProxyProps} from './types';
import {register} from "be-hive/register.js";
import { IObserve, GetValConfig } from '../be-observant/types';
import {PropertyBag} from 'trans-render/lib/PropertyBag.js';
import {RenderContext, Transformer} from 'trans-render/lib/types';
import {BeSyndicating} from 'be-syndicating/be-syndicating.js';
export class BeCalculating extends BeSyndicating implements Actions{

    importSymbols({proxy, importCalculatorFrom, importTransformFrom, self}: ProxyProps): void {
        const inner = self.innerHTML.trim();
        if(!inner.startsWith(`export const ${importCalculatorFrom} = async `)){
            self.innerHTML = `export const ${importCalculatorFrom} = async ` + inner;
        }
        self.setAttribute('be-exportable', '');
        import('be-exportable/be-exportable.js');
        if((self as any)._modExport){
            Object.assign(proxy, (self as any)._modExport);
        }else{
            self.addEventListener('load', e =>{
                //Object.assign(proxy, (self as any)._modExport);
                if(importCalculatorFrom !== undefined){
                    const calculator = (self as any)._modExport[importCalculatorFrom];
                    if(calculator !== undefined){
                        proxy.calculator = calculator;
                    }
                }
                if(importTransformFrom !== undefined){
                    const transform = (self as any)._modExport[importTransformFrom];
                    if(transform !== undefined){
                        proxy.transform = transform;
                    }
                }
                
            }, {once: true});
        }
    }
    

    strArgToIObs({from, get, on}: ProxyProps, arg: string): IObserve {
        const getConfig: GetValConfig = typeof(get) === 'string' ? {
            vft: get
        } as GetValConfig : get;
        const o: IObserve = {...from, ...getConfig, ...on};
        if(from === undefined){
            o.observeName = arg;
        }
        if(get === undefined){
            o.vft = 'value';
        }
        if(on === undefined){
            o.on = 'input';
        }
        return o;
    }
    async hookUpTransform(pp: PP){
        const {transform} = pp;
        const transforms = Array.isArray(transform) ? transform : [transform];
        const {DTR} = await import('trans-render/lib/DTR.js');
        for(const t of transforms){
            const ctx: RenderContext = {
                host: this.syndicate,
                match: t,
                //[TODO]: plugins: transformPlugins,
            }
            
            const dtr = new DTR(ctx);
            const fragment = await this.#getTransformTarget(pp);
            await dtr.transform(fragment);
            await dtr.subscribe(true);
        }
    }


    #proxyControllers: AbortController[] | undefined;
    async hookupCalc({calculator, props, proxy}: PP) {
        this.#disconnectProxyListeners();
        this.#proxyControllers = [];
        const keys = Array.from(props!);
        const syndicate = this.syndicate;
        if((<any>syndicate).self === undefined){
            (<any>syndicate).self = syndicate; //should this be done in PropertyBag?
        }
        for(const key of keys){
            const ac = new AbortController();
            this.syndicate.addEventListener(key, async e => {
                const calculations = await calculator!(syndicate, (e as CustomEvent).detail);
                Object.assign(syndicate, calculations);
            }, {signal: ac.signal});
            this.#proxyControllers.push(ac);
        }
        const calculations = await calculator!(syndicate);
        Object.assign(syndicate, calculations);
        proxy.resolved
    }
    



    async #getTransformTarget({transformScope, self}: PP){
        let elToTransform: Element | DocumentFragment | null = null;
        const {parent, rootNode, closest, upSearch: us} = transformScope!;
        if(us !== undefined){
            const {upSearch} = await import('trans-render/lib/upSearch.js');
            elToTransform = upSearch(self, us);
        }else if(closest !== undefined){
            elToTransform = self.closest(closest);
        }else if(rootNode){
            elToTransform = self.getRootNode() as DocumentFragment;
        }else{
            elToTransform = self.parentElement!;
        }
        if(elToTransform === null) throw 'bC.404';
        return elToTransform;
    }



    #disconnectProxyListeners(){
        if(this.#proxyControllers !== undefined){
            for(const ac of this.#proxyControllers){
                ac.abort();
            }
            this.#proxyControllers = undefined;
        }
    }

    override finale(): void {
        this.#disconnectProxyListeners();
        super.finale();
    }
}

const tagName = 'be-calculating';

const ifWantsToBe = 'calculating';

const upgrade = 'script';

define<Proxy & BeDecoratedProps<Proxy, Actions>, Actions>({
    config:{
        tagName,
        propDefaults:{
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
            proxyPropDefaults:{
                transformScope: {
                    upSearch: '*'
                },
                transform:{
                    '*': 'value'
                },
                importCalculatorFrom: 'calculator',
                importTransformFrom: 'transform'
            }
        },
        actions:{
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
    complexPropDefaults:{
        controller: BeCalculating
    }
});

register(ifWantsToBe, upgrade, tagName);