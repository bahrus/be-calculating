// @ts-check
import { resolved, rejected, propInfo} from 'be-enhanced/cc.js';
import { BE } from 'be-enhanced/BE.js';

/** @import {BEConfig, IEnhancement, BEAllProps} from './ts-refs/be-enhanced/types.d.ts' */
/** @import {Actions, PAP,  AP, BAP} from './ts-refs/be-calculating/types' */;
/** @import {EnhancementInfo} from './ts-refs/trans-render/be/types.d.ts' */

/**
 * @implements {Actions}
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
        },
        propInfo:{
            ...propInfo,
            forAttr: {},
            forArgs: {},
            remoteSpecifiers: {},
            defaultEventType: {},
            scriptEl: {},
            isOutputEl: {},
        },
        compacts: {
            //when_forAttr_changes_invoke_parseForAttr: 0
        },
        actions: {
            genRemoteSpecifiers: {
                ifAllOf: ['forArgs', 'defaultEventType']
            },
            parseForAttr: {
                ifAllOf: ['forAttr', 'isOutputEl']
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
            isOutputEl: enhElLocalName === 'output'
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
        return {
            resolved: true
        }
    }

}

await BeCalculating.bootUp();
export {BeCalculating};