import {define, BeDecoratedProps} from 'be-decorated/be-decorated.js';
import {Actions, VirtualProps, PP, Proxy, ProxyProps} from './types';
import {register} from "be-hive/register.js";
import { IObserve, PropObserveMap, HookUpInfo } from '../be-observant/types';
import {PropertyBag} from 'trans-render/lib/PropertyBag.js';
import {RenderContext} from 'trans-render/lib/types';

export class BeCalculating extends EventTarget implements Actions{

    #propertyBag: PropertyBag | undefined = new PropertyBag();
    #abortControllers: AbortController[] | undefined;
    
    onNoTransform({proxy, self}: ProxyProps): void {
        const inner = self.innerHTML.trim();
        if(!inner.startsWith('export const transformGenerator = ')){
            self.innerHTML = 'export const transformGenerator = ' + inner;
        }
        proxy.appendedBoilerPlate = true;
    }

    onReadyToLoadScript({self, proxy, transform}: ProxyProps) {
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

    onStaticTransform({proxy}: ProxyProps): void {
        proxy.readyToListen = true;
    }
    
    async listen(pp: PP){
        const {args, self, proxy } = pp;
        this.#disconnect();
        this.#abortControllers = [];
        //construct explicit from defaults:
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
            await this.#doParams(pom, self);
        }
        
    }


    onTG({transformGenerator, proxy}: PP){
        this.#propertyBag?.addEventListener('prop-changed', e => {
            proxy.transform = proxy.transformGenerator(this.#propertyBag!.proxy!);
        });
        proxy.readyToListen = true;
    }

    async doTransform({transform, self, transformParent}: PP){
        const {DTR} = await import('trans-render/lib/DTR.js');
        //const {transformGenerator, transformParent, self} = pp;
        const ctx: RenderContext = {
            host: this.#propertyBag!.proxy,
            match: transform,
        }
        let elToTransform: Element = self;
        if(transformParent){
            elToTransform = self.parentElement!;
        }
        DTR.transform(elToTransform, ctx);

    }

    async #doParams(params: PropObserveMap, self: HTMLScriptElement){
        const {hookUp} = await import('be-observant/hookUp.js');
        let lastKey = '';
        for(const propKey in params){
            let parm = params[propKey] as string | IObserve;
            const startsWithHat = propKey[0] === '^';
            const key = startsWithHat ? lastKey : propKey;
            const info = await hookUp(parm, [self, this.#propertyBag!.proxy!], key);
            this.#abortControllers!.push(info.controller!);
            if(!startsWithHat) lastKey = propKey;
        }  
    }

    #disconnect(){
        //this.#propertyBag = undefined;
        if(this.#abortControllers !== undefined){
            for(const ac of this.#abortControllers){
                ac.abort();
            }
            this.#abortControllers = undefined;
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
                'args', 'transformGenerator', 'transformParent', 'defaultEventType', 'defaultObserveType', 'defaultProp', 
                'transform', 'appendedBoilerPlate', 'scriptLoaded', 'readyToListen', 'readyToTransform'
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
            listen: {
                ifAllOf: ['readyToListen', 'args']
            },
            onNoTransform:{
                ifNoneOf: ['transform']
            },
            onReadyToLoadScript: {
                ifAtLeastOneOf: ['transform', 'appendedBoilerPlate']
            },
            onTG: {
                ifAllOf: ['scriptLoaded'],
                ifNoneOf: ['transform'],
            },
            onStaticTransform: {
                ifAllOf: ['transform', 'scriptLoaded'],
                ifNoneOf: ['readyToListen']
            },
            doTransform: {
                ifAllOf: ['readyToTransform', 'transform']
            }
        }
    },
    complexPropDefaults:{
        controller: BeCalculating
    }
});

register(ifWantsToBe, upgrade, tagName);