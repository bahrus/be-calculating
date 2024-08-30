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
    }

}