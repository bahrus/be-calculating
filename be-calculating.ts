import {define, BeDecoratedProps} from 'be-decorated/be-decorated.js';
import {Actions, VirtualProps, PP, Proxy, ProxyProps} from './types';
import {register} from "be-hive/register.js";
import { IObserve, PropObserveMap, HookUpInfo } from '../be-observant/types';
import {PropertyBag} from 'trans-render/lib/PropertyBag.js';

export class BeCalculating extends EventTarget implements Actions{
    #propertyBag: PropertyBag | undefined;
    #abortControllers: AbortController[] | undefined;
    async onArgs({args}: PP){
        this.#disconnect();
        //construct explicit from defaults:
        const arr = Array.isArray(args) ? args : [args];
        const autoConstructed: PropObserveMap = {};
        let hasAuto = false;
        const explicit : PropObserveMap[] = [];
        for(const arg of arr){
            if(typeof arg === 'string'){
                const obs: IObserve = {
                    "observeName": arg,
                    "on": "input",
                    "vft": ".",
                };
                autoConstructed[arg] = obs;
                hasAuto = true;
            }else{
                explicit.push(arg);
            }
        }
        if(hasAuto) explicit.push(autoConstructed);
        this.#propertyBag = new PropertyBag();
        await this.#doParams(explicit, )

    }

    async #doParams(params: PropObserveMap, proxy: Proxy){
        const {hookUp} = await import('be-observant/hookUp.js');
        let lastKey = '';
        for(const propKey in params){
            let parm = params[propKey] as string | IObserve;
            const startsWithHat = propKey[0] === '^';
            const key = startsWithHat ? lastKey : propKey;
            const info = await hookUp(parm, this.#propertyBag!, key);
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
            virtualProps: ['args'],
            primaryProp: 'args',
            primaryPropReq: true
        },
        actions:{
            onArgs: 'args'
        }
    },
    complexPropDefaults:{
        controller: BeCalculating
    }
});

register(ifWantsToBe, upgrade, tagName);