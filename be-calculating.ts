import {define, BeDecoratedProps} from 'be-decorated/be-decorated.js';
import {Actions, VirtualProps, PP, Proxy, ProxyProps} from './types';
import {register} from "be-hive/register.js";
import { IObserve, PropObserveMap, HookUpInfo } from '../be-observant/types';
import {PropertyBag} from 'trans-render/lib/PropertyBag.js';
import {RenderContext} from 'trans-render/lib/types';

export class BeCalculating extends EventTarget implements Actions{

    async intro(proxy: Proxy, self: HTMLScriptElement){
        const inner = self.innerHTML.trim();
        if(!inner.startsWith('export const transformGenerator = ')){
            self.innerHTML = 'export const transformGenerator = ' + inner;
        }
        self.setAttribute('be-exportable', '');
        import('be-exportable/be-exportable.js');
        if((self as any)._modExport){
            Object.assign(this.#propertyBag!.proxy, (self as any)._modExport);
            proxy.transformGenerator = (self as any)._modExport.transformGenerator;
        }else{
            self.addEventListener('load', e =>{
                Object.assign(proxy, (self as any)._modExport);
            }, {once: true});
        }
    }
    #propertyBag: PropertyBag | undefined = new PropertyBag();
    #abortControllers: AbortController[] | undefined;
    async onArgsAndTG(pp: PP){
        const {args, self } = pp;
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
        if(this.#propertyBag === undefined){
            this.#propertyBag = new PropertyBag();
        }
        this.#propertyBag.addEventListener('prop-changed', async e => {
            const {DTR} = await import('trans-render/lib/DTR.js');
            const {transformGenerator, transformParent} = pp;
            const ctx: RenderContext = {
                host: this.#propertyBag!.proxy,
                match: transformGenerator(this.#propertyBag!.proxy!),
            }
            let elToTransform: Element = self;
            if(transformParent){
                elToTransform = self.parentElement!;
            }
            DTR.transform(elToTransform, ctx);
        })
        for(const pom of explicit){
            await this.#doParams(pom, self);
        }
        

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
        this.#propertyBag = undefined;
        if(this.#abortControllers !== undefined){
            for(const ac of this.#abortControllers){
                ac.abort();
            }
            this.#abortControllers = undefined;
        }
    }

    finale(): void {
        this.#disconnect();
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
            virtualProps: ['args', 'transformGenerator', 'transformParent', 'defaultEventType', 'defaultObserveType', 'defaultProp'],
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
            onArgsAndTG: {
                ifAllOf: ['args', 'transformGenerator']
            }
        }
    },
    complexPropDefaults:{
        controller: BeCalculating
    }
});

register(ifWantsToBe, upgrade, tagName);