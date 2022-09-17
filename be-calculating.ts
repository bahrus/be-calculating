import {define, BeDecoratedProps} from 'be-decorated/be-decorated.js';
import {Actions, VirtualProps, PP, Proxy, ProxyProps} from './types';
import {register} from "be-hive/register.js";
import { IObserve, PropObserveMap } from '../be-observant/types';
import {PropertyBag} from 'trans-render/lib/PropertyBag.js';

export class BeCalculating extends EventTarget implements Actions{
    onArgs({args}: PP): void {
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

    }

    #disconnect(){

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