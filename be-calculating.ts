import {config as beCnfg} from 'be-enhanced/config.js';
import {BE, BEConfig} from 'be-enhanced/BE.js';
import {Actions, AllProps, AP, ProPAP, PAP} from './types';
import {IEnhancement,  BEAllProps} from 'trans-render/be/types';
import {Link} from 'be-linked/types';
import {AllProps as BeExportableAllProps} from 'be-exportable/types';


class BeCalculating extends BE<any, any, HTMLOutputElement | HTMLMetaElement> implements Actions{
    static override config: BEConfig<AP & BEAllProps, Actions & IEnhancement, any> = {
        propInfo:{
            ...beCnfg.propInfo,
            for:{}
        },
        actions: {
            parseForAttr:{
                ifAllOf: ['for']
            }
        }
    };
    parseForAttr(self: this): PAP {
        const {enhancedElement} = self;
        console.log(enhancedElement);
        return {

        }
    }
    // getDefaultForAttribute(self: this): PAP {
    //     const {enhancedElement} = self;
    //     switch(enhancedElement.localName){
    //         case 'output':
    //             return {
    //                 forAttribute: 'for'
    //             } as PAP;
    //         default:
    //             throw "Need list of id's"
    //     }
    // }

    // getAttrExpr(self: this): PAP {
    //     const {enhancedElement, recalculateOn: r} = self;
    //     const recalculateOn = enhancedElement.hasAttribute('oninput') ? 'input':  'change';
    //     const attrExpr = enhancedElement.getAttribute('oninput') || enhancedElement.getAttribute('onchange');
    //     const scriptRef = attrExpr  ? undefined : 'previousElementSibling';
    //     return {
    //         attrExpr,
    //         recalculateOn,
    //         scriptRef,
    //     };
    // }

    onAttrExpr(self: this): PAP {
        const {attrExpr} = self;
        //TODO optimize
        const scriptEl = document.createElement('script');
        scriptEl.innerHTML = attrExpr!;
        return {
            scriptEl
        }
    }

    async findScriptEl(self: this): ProPAP {
        const {scriptRef, enhancedElement} = self;
        const {findRealm} = await import('trans-render/lib/findRealm.js');
        const scriptEl = await findRealm(enhancedElement, scriptRef!) as HTMLScriptElement | null;
        if(scriptEl === null) throw 404;
        return {
            scriptEl
        }
    }

    async importSymbols(self: this): ProPAP {
        const {scriptEl, nameOfCalculator} = self;
        import('be-exportable/be-exportable.js');
        
        if(!scriptEl!.src){
            const {rewrite} = await import('./rewrite.js');
            rewrite(self, scriptEl!);
        }
        const exportable = await (<any>scriptEl).beEnhanced.whenResolved('be-exportable') as BeExportableAllProps;
        return {
            calculator: exportable.exports[nameOfCalculator!]
        }
    }
    #controllers : AbortController[] | undefined;
    async observe(self: this): ProPAP {
        const {args, searchBy, searchScope, recalculateOn} = self;
        const defaultLink = {
            localInstance: 'local',
            enhancement: 'beCalculating',
            downstreamPropName: 'propertyBag',
            observe: {
                attr: searchBy,
                isFormElement: true,
                names: args,
                scope: searchScope,
                on: recalculateOn
            }
        } as Link;
        const {observe} = await import('be-linked/observe.js');
        await observe(self, defaultLink);
        const {propertyBag, calculator} = self;
        this.#disconnect();
        this.#controllers = [];
        for(const arg of args!){
            const ac = new AbortController();
            propertyBag!.addEventListener(arg, async e => {
                const result = await calculator!(propertyBag!, (e as CustomEvent).detail);
                Object.assign(self, result);
            }, {signal: ac.signal});
            this.#controllers.push(ac);
        }
        const result = await calculator!(propertyBag!);
        Object.assign(self, result);
        return {
            //value: await calculator!(propertyBag!),
            resolved: true,
        } as PAP;
    }

    
    #disconnect(){
        if(this.#controllers !== undefined){
            for(const ac of this.#controllers){
                ac.abort();
            }
            this.#controllers = undefined;
        }
    }

    override async detach(detachedElement: Element){
        this.#disconnect();
    }

    getArgs(self: this): PAP {
        const {for: forString} = self;
        let forS: string | null | undefined = forString;
        if(!forS){
            const {forAttribute, enhancedElement} = self;
            forS = enhancedElement.getAttribute(forAttribute!);
        }
        if(!forS) throw 404;
        return {
            args: forS.split(' ')
        };
    }

    // async onValue(self: this){
    //     const {enhancedElement, value, propertyToSet, notify} = self;
    //     (<any>enhancedElement)[propertyToSet!] = value;
    //     if(notify !== undefined){
    //         const {doNotify} = await import('./doNotify.js');
    //         await doNotify(self);
    //     }
    // }
}

interface BeCalculating extends AP{}

await BeCalculating.bootUp();

export {BeCalculating};