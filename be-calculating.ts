import {define, BeDecoratedProps} from 'be-decorated/be-decorated.js';
import {Actions, VirtualProps, PP, Proxy, ProxyProps} from './types';
import {register} from "be-hive/register.js";
import { IObserve, PropObserveMap, HookUpInfo } from '../be-observant/types';
import {PropertyBag} from 'trans-render/lib/PropertyBag.js';
import {RenderContext, Transformer} from 'trans-render/lib/types';

export class BeCalculating extends EventTarget implements Actions{

    #propertyBag: PropertyBag | undefined = new PropertyBag();
    #abortControllers: AbortController[] | undefined; 
    
    insertTrGen({proxy, self}: PP): void {
        const inner = self.innerHTML.trim();
        if(!inner.startsWith('export const transformGenerator = ')){
            self.innerHTML = 'export const transformGenerator = ' + inner;
        }
        proxy.insertedBoilerPlate = true;
    }

    loadScript({self, proxy, dynamicTransform: transform}: PP) {
        self.setAttribute('be-exportable', '');
        import('be-exportable/be-exportable.js');
        if((self as any)._modExport){
            Object.assign(this.#propertyBag!.proxy, (self as any)._modExport);
            if(transform === undefined) proxy.transformGenerator = (self as any)._modExport.transformGenerator; //might be null if 
            proxy.scriptLoaded = true;
        }else{
            self.addEventListener('load', e =>{
                Object.assign(proxy, (self as any)._modExport);
                if(transform === undefined) proxy.transformGenerator = (self as any)._modExport.transformGenerator; //might be null if 
            }, {once: true});
            proxy.scriptLoaded = true;
        }
    }

    async hookUpStaticTransform(pp: PP){
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
        proxy.readyToListen = true;
    }

    hookUpDynamicTransform({proxy}: PP){
        this.#propertyBag?.addEventListener('prop-changed', e => {
            proxy.dynamicTransform = proxy.transformGenerator!(this.#propertyBag!.proxy!);
        });
        proxy.readyToListen = true;
    }


    #calcControllers: AbortController[] | undefined;
    async hookupCalc({calculator, props}: PP) {
        //this.#disconnect();
        this.#calcControllers = [];
        const keys = Array.from(props!);
        const proxy = this.#propertyBag!.proxy!;
        for(const key of keys){
            const ac = new AbortController();
            this.#propertyBag!.addEventListener(key, async e => {
                const calculations = await calculator!(proxy, (e as CustomEvent).detail);
                Object.assign(proxy, calculations);
            }, {signal: ac.signal});
            this.#calcControllers.push(ac);
        }
        const calculations = await calculator!(proxy);
        Object.assign(proxy, calculations);
    }
    
    async listen(pp: PP){
        const {args, self, proxy } = pp;
        this.#disconnect();
        this.#abortControllers = [];
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

        proxy.readyToTransform = true;
        for(const pom of explicit){
            await this.#doParams(pom, self, proxy);
        }
        
    }




    async doDynamicTransform(pp: PP){
        const {dynamicTransform} = pp;
        const {DTR} = await import('trans-render/lib/DTR.js');
        const ctx: RenderContext = {
            host: this.#propertyBag!.proxy,
            match: dynamicTransform,
        }
        const elToTransform = await this.#getTransformTarget(pp);
        DTR.transform(elToTransform, ctx);

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
            this.#abortControllers!.push(info.controller!);
            if(!startsWithHat) lastKey = propKey;
        }
        proxy.props = props;  
    }

    #disconnect(){
        //this.#propertyBag = undefined;
        if(this.#abortControllers !== undefined){
            for(const ac of this.#abortControllers){
                ac.abort();
            }
            this.#abortControllers = undefined;
        }
        if(this.#calcControllers !== undefined){
            for(const ac of this.#calcControllers){
                ac.abort();
            }
            this.#calcControllers = undefined;
        }
    }

    finale(): void {
        this.#disconnect();
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
                'args', 'transformGenerator', 'calculator', 'transformParent', 'defaultEventType', 'defaultObserveType', 'defaultProp', 
                'dynamicTransform', 'transform', 'insertedBoilerPlate', 'scriptLoaded', 'readyToListen', 'readyToTransform', 'props'
            ],
            primaryProp: 'args',
            primaryPropReq: true,
            finale: 'finale',
            proxyPropDefaults:{
                transformParent: true,
                defaultEventType: 'input',
                defaultObserveType: 'observeName',
                defaultProp: 'value'
            }
        },
        actions:{
            insertTrGen:{
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
    complexPropDefaults:{
        controller: BeCalculating
    }
});

register(ifWantsToBe, upgrade, tagName);