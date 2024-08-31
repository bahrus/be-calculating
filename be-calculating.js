// @ts-check
import { resolved, rejected, propInfo} from 'be-enhanced/cc.js';
import { BE } from 'be-enhanced/BE.js';

/** @import {BEConfig, IEnhancement, BEAllProps} from './ts-refs/be-enhanced/types.d.ts' */
/** @import {Actions, PAP,  AP, BAP} from './ts-refs/be-calculating/types' */;
/** @import {EnhancementInfo} from './ts-refs/trans-render/be/types.d.ts' */

/**
 * @implements {Actions}
 * @implements {EventListenerObject}
 * 
 */
class BeCalculating extends BE {


    /**
     * @type {BEConfig<AP & BEAllProps, Actions & IEnhancement, any>}
     */
    static config = {
        propDefaults: {
            nameOfCalculator: 'calculator',
            isAttached: true,
            categorized: false,
            remSpecifierLen: 0
        },
        propInfo:{
            ...propInfo,
            forAttr: {},
            forArgs: {},
            remoteSpecifiers: {},
            defaultEventType: {},
            scriptEl: {},
            isOutputEl: {},
            enhElLocalName: {},
        },
        compacts: {
            //when_forAttr_changes_invoke_parseForAttr: 0
            when_enhElLocalName_changes_invoke_getDefltEvtType: 0,
            when_enhElLocalName_changes_invoke_categorizeEl: 0,
            pass_length_of_remoteSpecifiers_to_remSpecifierLen: 0,
        },
        actions: {
            parseForAttr: {
                ifAllOf: ['forAttr', 'isOutputEl']
            },
            genRemoteSpecifiers: {
                ifAllOf: ['forArgs', 'defaultEventType']
            },
            hydrate: {
                ifAllOf: ['defaultEventType', 'remSpecifierLen']
            }
        },
    }

    /**
     * 
     * @param {BAP} self 
     */
    categorizeEl(self){
        //TODO Make this logic compactible?
        const {enhElLocalName} = self;
        return /** @type {PAP} */({
            isOutputEl: enhElLocalName === 'output',
            categorized: true,
        });
    }

    /**
     * 
     * @param {BAP} self 
     */
    getDefltEvtType(self){
        const {enhElLocalName, enhancedElement} = self;
        switch(enhElLocalName){
            case 'output':
                if(self.forAttr === undefined){
                    return /** @type {PAP} */({
                        defaultEventType: 'load'
                    });
                }else{
                    if(enhancedElement.oninput){
                        return /** @type {PAP} */({
                            defaultEventType: 'input'
                        });
                    }else if(enhancedElement.onchange){
                        return /** @type {PAP} */({
                            defaultEventType: 'change'
                        });
                    }

                }

        }
        return /** @type {PAP} */({
            defaultEventType: 'load'
        });
    }

    #ignoreForAttr = false;
    /**
     * 
     * @param {BAP} self 
     */
    parseForAttr(self) {
        if(this.#ignoreForAttr){
            this.#ignoreForAttr = false;
            return {};
        }
        const {enhancedElement} = self;
        return {
            forArgs: Array.from(/** @type {HTMLOutputElement} */(enhancedElement).htmlFor)
        }
    }

    /**
     * 
     * @param {BAP} self 
     */
    genRemoteSpecifiers(self){
        const {forArgs, defaultEventType} = self;
        return /** @type {PAP} */ ({
            remoteSpecifiers: forArgs.map(fa  => ({
                elS: fa,
                prop: fa,
                s: '#',
                evt: defaultEventType
            })),
        });
    }

    /**
     * 
     * @param {BAP} self 
     */
    async hydrate(self){
        const {remoteSpecifiers, enhancedElement, defaultEventType} = self;
        const {find} = await import('trans-render/dss/find.js');
        const {ASMR} = await import('trans-render/asmr/asmr.js');
        const eventTypeToListen = defaultEventType !== 'load' ? defaultEventType || 'input' : 'input';
        const aos = {};
        for(const remoteSpecifier of remoteSpecifiers){
            const remoteEl = await find(enhancedElement, remoteSpecifier);
            if(!(remoteEl instanceof Element)) continue;
            const ao = await ASMR.getAO(remoteEl, {
                UEEN: eventTypeToListen
            });
            aos[remoteSpecifier.prop] = [ao, new WeakRef(remoteEl)];
            ao.addEventListener('value', async e => {
                //debugger;
                for(const prop in aos){
                    const [ao, ref] = aos[prop];
                    const val = await ao.getValue(ref.deref());
                    console.log({enhancedElement, val});
                    enhancedElement['$' + prop] = val;
                }
                
                enhancedElement.dispatchEvent(new Event(eventTypeToListen))
            });
        }
        return {
            resolved: true
        }
    }

    handleEvent(object) {
        const self = /** @type {BAP} *//** @type {any} */ (this);
        const {enhancedElement, defaultEventType} = self;
        
        console.log({self});
    }

}

await BeCalculating.bootUp();
export {BeCalculating};