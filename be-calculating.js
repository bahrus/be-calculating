// @ts-check
import { BE } from 'be-enhanced/BE.js';

/** @import {BEConfig, IEnhancement, BEAllProps} from './ts-refs/be-enhanced/types.d.ts' */
/** @import {Actions, PAP,  AP, BAP} from './ts-refs/be-calculating/types' */;
/** @import {EnhancementInfo} from './ts-refs/trans-render/be/types.d.ts' */
/** @import {AbsorbingObject} from './ts-refs/trans-render/asmr/types.d.ts' */
/** @import {AllProps as BeExportableAllProps} from  './ts-refs/be-exportable/types.d.ts' */

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
    }

    /**
     * 
     * @param {BAP} self 
     */
    categorizeEl(self){
        //TODO Make this logic compactible?
        const {enhElLocalName, enhancedElement} = self;
        let hasInlineEvent = false;
        try{
            hasInlineEvent = !!(
                enhancedElement.onload || enhancedElement.oninput || enhancedElement.onchange
            )
        }catch(e){

        }
        finally{}
        return /** @type {PAP} */({
            isOutputEl: enhElLocalName === 'output',
            hasInlineEvent,
            categorized: true,
        });
    }


    async handleEvent() {
    }
}

await BeCalculating.bootUp();
export {BeCalculating};