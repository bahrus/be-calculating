import {config as beCnfg} from 'be-enhanced/config.js';
import {BE, BEConfig} from 'be-enhanced/BE.js';
import {Actions, AllProps, AP, ProPAP, PAP} from './types';
import {IEnhancement,  BEAllProps} from 'trans-render/be/types';
import {Link, WeakEndPoint} from 'be-linked/types';
import {AllProps as BeExportableAllProps} from 'be-exportable/types';
import { Specifier } from 'trans-render/dss/types';
import {Seeker} from 'be-linked/Seeker.js';
import {getObsVal} from 'be-linked/getObsVal.js';

let cnt = 0;
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
            onLoad: {},
            defaultEventType: {},
            scriptEl: {},
            remoteSpecifiers: {},
            calculator: {},
            assignTo: {},
            //ignoreForAttr: {},
        },
        actions: {
            parseForAttr:{
                ifAllOf: ['forAttr'],
                //ifNoneOf: ['ignoreForAttr']
            },
            regOnInput: {
                ifKeyIn: ['onInput']
            },
            regOnChange: {
                ifKeyIn: ['onChange']
            },
            regOnLoad: {
                ifKeyIn: ['onLoad']
            },
            findScriptEl: {
                ifNoneOf: ['onInput', 'onChange', 'onLoad']
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
    #ignoreForAttr = false;
    parseForAttr(self: this){
        if(this.#ignoreForAttr){
            this.#ignoreForAttr = false;
            return {};
        }
        const {forAttr} = self;
        return {
            forArgs: forAttr?.split(' ').map(s => s.trim()),
        } as PAP
    }
    regOnInput(self: this) {
        const {onInput} = self;
        return this.#reg(onInput, 'input');

    }
    regOnChange(self: this) {
        const {onChange} = self;
        return this.#reg(onChange, 'change');
        
    }
    regOnLoad(self: this){
        const {onLoad} = self;
        return this.#reg(onLoad, undefined);
    }
    #reg(on: string | undefined, defaultEventType: string | undefined){
        if(on){
            const scriptEl = document.createElement('script');
            scriptEl.innerHTML = on!;
            return {
                scriptEl,
                defaultEventType
            } as PAP;
        }else{
            return {
                defaultEventType: defaultEventType,
            } as PAP;
        }
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


    findScriptEl(self: this) {
        const {enhancedElement, defaultEventType} = self;
        const scriptEl = enhancedElement.previousElementSibling;
        if(!(scriptEl instanceof HTMLScriptElement)) throw 404;
        return {
            defaultEventType: defaultEventType ||  'input',
            scriptEl
        } as PAP;
    }

    async importSymbols(self: this): ProPAP {
        const {scriptEl, nameOfCalculator, forAttr} = self;
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
        const {calculator, remoteSpecifiers, enhancedElement, defaultEventType} = self;
        const remoteTuples: Array<[Specifier, WeakEndPoint]> = [];
        const rootNode = enhancedElement.getRootNode();
        for(const remoteSpecifier of remoteSpecifiers!){
            const seeker = new Seeker<AP, any>(remoteSpecifier, false);
            const res = await seeker.do(self, undefined, enhancedElement);
            remoteTuples.push([remoteSpecifier, res!]);
            const ac = new AbortController();
            this.#controllers?.push(ac)
            const {eventSuggestion} = res!;
            const eventName = defaultEventType || eventSuggestion;
            
            if(eventName !== undefined){
                const remoteHardRef = res?.signal?.deref();
                if(remoteHardRef === undefined){
                    //TODO delete from list
                    continue;
                }
                if(remoteHardRef instanceof Element && rootNode.contains(remoteHardRef) && enhancedElement instanceof HTMLOutputElement){
                    if(!remoteHardRef.id){
                        const guid = 'be-calculating-' + cnt;
                        cnt++;
                        remoteHardRef.id = guid;
                    }
                    this.#ignoreForAttr = true;
                    enhancedElement.htmlFor.add(remoteHardRef.id);
                }
                remoteHardRef.addEventListener(eventName, e => {
                    this.#setValue(self, remoteTuples, calculator!);
                }, {signal: ac.signal});
            }
        }
        await this.#setValue(self, remoteTuples, calculator!);
        
        return {
            resolved: true
        } as PAP;
    }

    async #setValue(self: this, remoteTuples: Array<[Specifier, WeakEndPoint]>, calculator: (vm: any) => any){
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
        const valueContainer =  await calculator(vm);
        const {value} = valueContainer;
        if(enhancedElement instanceof HTMLOutputElement){
            enhancedElement.value = value === undefined ? ''  : (value + '');
        }else{
            if(value !== undefined){
                const {assignTo} = self;
                let foundAtLeastOne = false;
                if(assignTo !== undefined){
                    const {find} = await import('trans-render/dss/find.js');
                    for(const at of assignTo){
                        const targetElement = await find(enhancedElement, at);
                        if(targetElement instanceof Element){
                            foundAtLeastOne = true;
                            Object.assign(targetElement, value);
                        }
                    }
                }else{
                    const targetElement = enhancedElement.parentElement;
                    if(targetElement instanceof Element){
                        foundAtLeastOne = true;
                        Object.assign(targetElement, value);
                    }
                }
                if(!foundAtLeastOne) throw 404;
                
            }
            

        }

    }

    #controllers : AbortController[]  = [];
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
            this.#controllers = [];
        }
    }

    override async detach(detachedElement: Element){
        this.#disconnect();
    }

}

interface BeCalculating extends AP{}

await BeCalculating.bootUp();

export {BeCalculating};