// @ts-check
import { resolved, rejected, propInfo} from 'be-enhanced/cc.js';
import { BE } from 'be-enhanced/BE.js';

/** @import {BEConfig, IEnhancement, BEAllProps} from './ts-refs/be-enhanced/types.d.ts' */
/** @import {Actions, PAP,  AP, BAP} from './ts-refs/be-calculating/types' */;
/** @import {EnhancementInfo} from './ts-refs/trans-render/be/types.d.ts' */
/** @import {AbsorbingObject} from './ts-refs/trans-render/asmr/types.d.ts' */

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
            propToAO: {},
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
            seek: {
                ifAllOf: ['defaultEventType', 'remSpecifierLen']
            },
            hydrate: {
                ifAllOf: ['propToAO']
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
    async seek(self){
        const {remoteSpecifiers, enhancedElement, defaultEventType} = self;
        const {find} = await import('trans-render/dss/find.js');
        const {ASMR} = await import('trans-render/asmr/asmr.js');
        const eventTypeToListen = defaultEventType !== 'load' ? defaultEventType || 'input' : 'input';
        /**
         * @type {{[key: string]: AbsorbingObject}}
         */
        const propToAO = {};
        for(const remoteSpecifier of remoteSpecifiers){
            const remoteEl = await find(enhancedElement, remoteSpecifier);
            if(!(remoteEl instanceof Element)) continue;
            const {prop} = remoteSpecifier;
            if(prop === undefined) throw 'NI';
            const ao = await ASMR.getAO(remoteEl, {
                evt: eventTypeToListen
            });
            propToAO[prop] = ao;
        }
        return {
            propToAO
        };
    }

    /**
     * 
     * @param {BAP} self 
     */
    async hydrate(self){
        const {propToAO} = self;
        const aos = Object.values(propToAO);
        for(const ao of aos){
            //TODO abort controller
            ao.addEventListener('value', this);
        }
        this.handleEvent();
        return {
            resolved: true
        }
    }

    async handleEvent() {
        const self = /** @type {BAP} */(/** @type {any} */ (this));
        const {enhancedElement, defaultEventType, propToAO, isOutputEl} = self;
        for(const prop in propToAO){
            const ao = propToAO[prop];
            const val = await ao.getValue();
            if(isOutputEl){
                const key = '$' + prop;
                if(key in enhancedElement) throw 500;
                enhancedElement[key] = val;
            }
        }
        self.channelEvent(new Event(defaultEventType));
        if(isOutputEl){
            for(const prop in propToAO){
                const key = '$' + prop;
                delete enhancedElement[key];
            }
        }
    }

}

await BeCalculating.bootUp();
export {BeCalculating};