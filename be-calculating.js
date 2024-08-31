// @ts-check
import { resolved, rejected, propInfo} from 'be-enhanced/cc.js';
import { BE } from 'be-enhanced/BE.js';

/** @import {BEConfig, IEnhancement, BEAllProps} from './ts-refs/be-enhanced/types.d.ts' */
/** @import {Actions, PAP,  AP} from './ts-refs/be-calculating/types' */;
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
            when_forAttr_changes_invoke_parseForAttr: 0
        }
    }
    /**
     * 
     * @param {AP & BEAllProps} self 
     * @returns {PAP}
     */
    getDefltEvtType(self){
        const {enhancedElement} = self;
        const {localName} = enhancedElement;
        switch(localName){
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
     * @param {AP & BEAllProps} self 
     */
    parseForAttr(self) {
        if(this.#ignoreForAttr){
            this.#ignoreForAttr = false;
            return {};
        }
        const {forAttr} = self;
        return {
            forArgs: forAttr?.split(' ').map(s => s.trim()),
        }
    }

}

await BeCalculating.bootUp();
export {BeCalculating};