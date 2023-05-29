import { BeCalculating } from "./be-calculating";
import { Scope } from 'trans-render/lib/types';


export async function doNotify(self: BeCalculating){
    const {notify, value, enhancedElement} = self;
    const propertyName = (<HTMLInputElement>enhancedElement).name;
    if(!propertyName){
        throw 404;
    }
    const s: Scope = ['closestOrHost', '[itemscope]'];
    const {findRealm} = await import('trans-render/lib/findRealm.js');
    const scopeContainer = await findRealm(enhancedElement, s);
    if(scopeContainer === null) throw 404;
    switch(notify!){
        case 'scope':
            import('be-scoped/be-scoped.js');
            const base = await (<any>scopeContainer).beEnhanced.whenResolved('be-scoped');
            base.scope[propertyName] = value;
            break;
        default:
            throw 'NI';
    }
}