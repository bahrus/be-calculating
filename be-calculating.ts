import {config as beCnfg} from 'be-enhanced/config.js';
import {BE, BEConfig} from 'be-enhanced/BE.js';
import {Actions, AllProps, AP, ProPAP, PAP} from './types';
import {IEnhancement,  BEAllProps} from 'trans-render/be/types';
import {Link, WeakEndPoint} from 'be-linked/types';
import {AllProps as BeExportableAllProps} from 'be-exportable/types';
import { Specifier } from 'trans-render/dss/types';
import {Seeker} from 'be-linked/Seeker.js';
import {getObsVal} from 'be-linked/getObsVal.js';


class BeCalculating extends BE<any, any, HTMLOutputElement | HTMLMetaElement> implements Actions{
    static override config: BEConfig<AP & BEAllProps, Actions & IEnhancement, any> = {
        propDefaults: {
            nameOfCalculator: 'calculator',
        },
        propInfo:{
            ...beCnfg.propInfo,
            forAttr:{},
            forArgs:{},
            onInput: {},
            onChange: {},
            defaultEventType: {},
            scriptEl: {},
            remoteSpecifiers: {},
            calculator: {},
        },
        actions: {
            parseForAttr:{
                ifAllOf: ['forAttr']
            },
            regOnInput: {
                ifAllOf: ['onInput']
            },
            regOnChange: {
                ifAllOf: ['onChange']
            },
            genRemoteSpecifiers: {
                ifAllOf: ['forArgs', 'defaultEventType']
            },
            importSymbols:  {
                ifAllOf: ['scriptEl', 'remoteSpecifiers']
            },
            hydrate: {
                ifAllOf: ['calculator', 'remoteSpecifiers']
            }
        }
    };
    parseForAttr(self: this){
        const {forAttr} = self;
        return {
            forArgs: forAttr?.split(' ').map(s => s.trim()),
        } as PAP
    }
    regOnInput(self: this) {
        const {onInput} = self;
        const scriptEl = document.createElement('script');
        scriptEl.innerHTML = onInput!;
        return {
            defaultEventType: 'input',
            scriptEl
        } as PAP
    }
    regOnChange(self: this) {
        const {onChange} = self;
        const scriptEl = document.createElement('script');
        scriptEl.innerHTML = onChange!;
        return {
            defaultEventType: 'change',
            scriptEl
        } as PAP
    }

    genRemoteSpecifiers(self: this) {
        const {forArgs, defaultEventType} = self;
        return {
            remoteSpecifiers: forArgs!.map(fa  => ({
                elS: fa,
                prop: fa,
                s: '#',
                evt: defaultEventType
            }) as Specifier),
        } as PAP;
    }


    // async findScriptEl(self: this): ProPAP {
    //     const {scriptRef, enhancedElement} = self;
    //     const {findRealm} = await import('trans-render/lib/findRealm.js');
    //     const scriptEl = await findRealm(enhancedElement, scriptRef!) as HTMLScriptElement | null;
    //     if(scriptEl === null) throw 404;
    //     return {
    //         scriptEl
    //     }
    // }

    async importSymbols(self: this): ProPAP {
        const {scriptEl, nameOfCalculator} = self;
        const {emc} = await import('be-exportable/behivior.js');
        
        if(!scriptEl!.src){
            const {rewrite} = await import('./rewrite.js');
            rewrite(self, scriptEl!);
        }
        const exportable = await (<any>scriptEl).beEnhanced.whenResolved(emc) as BeExportableAllProps;
        return {
            calculator: exportable.exports[nameOfCalculator!]
        }
    }

    async hydrate(self: this){
        const {calculator, remoteSpecifiers, enhancedElement} = self;
        const remoteTuples: Array<[Specifier, WeakEndPoint]> = [];
        for(const remoteSpecifier of remoteSpecifiers!){
            const seeker = new Seeker<AP, any>(remoteSpecifier, false);
            const res = await seeker.do(self, undefined, enhancedElement);
            remoteTuples.push([remoteSpecifier, res!]);
        }
        const valueContainer = await this.#getValue(self, remoteTuples, calculator!);
        const {value} = valueContainer;
        if(enhancedElement instanceof HTMLOutputElement){
            enhancedElement.value = value === undefined ? ''  : (value + '');
        }
        return {
            resolved: true
        } as PAP;
    }

    async #getValue(self: this, remoteTuples: Array<[Specifier, WeakEndPoint]>, calculator: (vm: any) => any){
        const {enhancedElement} = self;
        const vm: any = {};
        
        for(const tuple of remoteTuples){
            const [remoteSpecifier, rsae] = tuple;
            const remoteEndPoint = rsae.signal?.deref();
            if(remoteEndPoint === undefined){
                //TODO:  remove from list
                continue;
            }
            const val = await getObsVal(remoteEndPoint, remoteSpecifier, enhancedElement);
            vm[remoteSpecifier.prop!] = val;
        }
        return calculator(vm);
    }

    #controllers : AbortController[] | undefined;
    // async observe(self: this): ProPAP {
    //     const {args, searchBy, searchScope, recalculateOn} = self;
    //     const defaultLink = {
    //         localInstance: 'local',
    //         enhancement: 'beCalculating',
    //         downstreamPropName: 'propertyBag',
    //         observe: {
    //             attr: searchBy,
    //             isFormElement: true,
    //             names: args,
    //             scope: searchScope,
    //             on: recalculateOn
    //         }
    //     } as Link;
    //     const {observe} = await import('be-linked/observe.js');
    //     await observe(self, defaultLink);
    //     const {propertyBag, calculator} = self;
    //     this.#disconnect();
    //     this.#controllers = [];
    //     for(const arg of args!){
    //         const ac = new AbortController();
    //         propertyBag!.addEventListener(arg, async e => {
    //             const result = await calculator!(propertyBag!, (e as CustomEvent).detail);
    //             Object.assign(self, result);
    //         }, {signal: ac.signal});
    //         this.#controllers.push(ac);
    //     }
    //     const result = await calculator!(propertyBag!);
    //     Object.assign(self, result);
    //     return {
    //         //value: await calculator!(propertyBag!),
    //         resolved: true,
    //     } as PAP;
    // }

    
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

    // getArgs(self: this): PAP {
    //     const {for: forString} = self;
    //     let forS: string | null | undefined = forString;
    //     if(!forS){
    //         const {forAttribute, enhancedElement} = self;
    //         forS = enhancedElement.getAttribute(forAttribute!);
    //     }
    //     if(!forS) throw 404;
    //     return {
    //         args: forS.split(' ')
    //     };
    // }

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