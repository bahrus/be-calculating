import {define, BeDecoratedProps} from 'be-decorated/be-decorated.js';
import {Actions, VirtualProps, PP, Proxy, ProxyProps} from './types';
import {register} from "be-hive/register.js";
import { IObserve, PropObserveMap, HookUpInfo } from '../be-observant/types';
import {PropertyBag} from 'trans-render/lib/PropertyBag.js';
import {RenderContext, Transformer} from 'trans-render/lib/types';

export class BeCalculating extends EventTarget implements Actions{

    #propertyBag: PropertyBag | undefined = new PropertyBag();
    

    intro(proxy: Proxy, self: HTMLScriptElement){
        const inner = self.innerHTML.trim();
        if(!inner.startsWith('export const calculator = ')){
            self.innerHTML = 'export const calculator = ' + inner;
        }
        self.setAttribute('be-exportable', '');
        import('be-exportable/be-exportable.js');
        if((self as any)._modExport){
            Object.assign(proxy, (self as any)._modExport);
        }else{
            self.addEventListener('load', e =>{
                Object.assign(proxy, (self as any)._modExport);
            }, {once: true});
        }
    }
    


    async hookUpTransform(pp: PP){
        const {proxy, transform} = pp;
        const transforms = Array.isArray(transform) ? transform : [transform];
        const {DTR} = await import('trans-render/lib/DTR.js');
        for(const t of transforms){
            const ctx: RenderContext = {
                host: this.#propertyBag!.proxy,
                match: t,
                //plugins: transformPlugins,
            }
            
            const dtr = new DTR(ctx);
            const fragment = await this.#getTransformTarget(pp);
            await dtr.transform(fragment);
            await dtr.subscribe(true);
        }
        //proxy.readyToListen = true;
    }


    #proxyControllers: AbortController[] | undefined;
    async hookupCalc({calculator, props}: PP) {
        this.#disconnectProxyListeners();
        this.#proxyControllers = [];
        const keys = Array.from(props!);
        const proxy = this.#propertyBag!.proxy!;
        for(const key of keys){
            const ac = new AbortController();
            this.#propertyBag!.addEventListener(key, async e => {
                const calculations = await calculator!(proxy, (e as CustomEvent).detail);
                Object.assign(proxy, calculations);
            }, {signal: ac.signal});
            this.#proxyControllers.push(ac);
        }
        const calculations = await calculator!(proxy);
        Object.assign(proxy, calculations);
    }
    
    #externalControllers: AbortController[] | undefined; 
    async listen(pp: PP){
        const {args, self, proxy } = pp;
        this.#disconnectExternalListeners();
        this.#externalControllers = [];
        const arr = Array.isArray(args) ? args : [args];
        const autoConstructed: PropObserveMap = {};
        let hasAuto = false;
        const explicit : PropObserveMap[] = [];
        for(const arg of arr){
            
            if(typeof arg === 'string'){

                const obs: IObserve = {
                    [pp.defaultObserveType!]: arg,
                    "on": pp.defaultEventType,
                    "vft": pp.defaultProp,
                };
                autoConstructed[arg] = obs;
                hasAuto = true;
            }else{
                explicit.push(arg);
            }
        }
        if(hasAuto) explicit.push(autoConstructed);
        for(const pom of explicit){
            await this.#doParams(pom, self, proxy);
        }
        
    }


    async #getTransformTarget({transformParent, self}: PP){
        let elToTransform: Element = self;
        if(transformParent){
            elToTransform = self.parentElement!;
        }
        return elToTransform;
    }

    
    async #doParams(params: PropObserveMap, self: HTMLScriptElement, proxy: Proxy){
        const {hookUp} = await import('be-observant/hookUp.js');
        let lastKey = '';
        const props = new Set<string>();
        for(const propKey in params){
            let parm = params[propKey] as string | IObserve;
            const startsWithHat = propKey[0] === '^';
            const key = startsWithHat ? lastKey : propKey;
            const info = await hookUp(parm, [self, this.#propertyBag!.proxy!], key);
            props.add(key);
            this.#externalControllers!.push(info.controller!);
            if(!startsWithHat) lastKey = propKey;
        }
        proxy.props = props;  
    }

    #disconnectExternalListeners(){
        if(this.#externalControllers !== undefined){
            for(const ac of this.#externalControllers){
                ac.abort();
            }
            this.#externalControllers = undefined;
        }
    }

    #disconnectProxyListeners(){
        if(this.#proxyControllers !== undefined){
            for(const ac of this.#proxyControllers){
                ac.abort();
            }
            this.#proxyControllers = undefined;
        }
    }

    finale(): void {
        this.#disconnectExternalListeners();
        this.#disconnectProxyListeners();
        this.#propertyBag = undefined;
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
                'args', 'calculator', 'transformParent', 'defaultEventType', 'defaultObserveType', 'defaultProp', 
                'transform', 'props'
            ],
            primaryProp: 'args',
            primaryPropReq: true,
            intro: 'intro',
            finale: 'finale',
            proxyPropDefaults:{
                transformParent: true,
                defaultEventType: 'input',
                defaultObserveType: 'observeName',
                defaultProp: 'value'
            }
        },
        actions:{
            hookUpTransform: 'transform',
            listen: 'args',
            hookupCalc: {
                ifAllOf: ['props', 'calculator']
            }
        }
    },
    complexPropDefaults:{
        controller: BeCalculating
    }
});

register(ifWantsToBe, upgrade, tagName);