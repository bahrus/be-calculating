import {AP} from './v2/types';
import {BeCalculating} from './be-calculating.js';

export function rewrite({enhancedElement, nameOfCalculator, args}: AP, scriptEl: HTMLScriptElement){
    const inner = scriptEl.innerHTML.trim();
    if(inner.indexOf('=>') === -1){
        // const strArgs: string[] = [];
        // instance.getStringArgs(args, strArgs);
        const str = `export const ${nameOfCalculator} = async ({${args!.join(',')}}) => ({
            value: ${inner}
        })`;
        scriptEl.innerHTML = str
    }else if(!inner.startsWith(`export const ${nameOfCalculator} = async `)){
        scriptEl.innerHTML = `export const ${nameOfCalculator} = async ` + inner;
    }
}