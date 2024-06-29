import {AP} from './types';

export function rewrite({enhancedElement, nameOfCalculator, remoteSpecifiers}: AP, scriptEl: HTMLScriptElement){
    const inner = scriptEl.innerHTML.trim();
    const args = remoteSpecifiers?.map(rs => rs.prop!);
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