// @ts-check
import { BeHive, seed, MountObserver } from 'be-hive/be-hive.js';
import {Registry} from 'be-hive/Registry.js';
import {aggs} from 'be-hive/aggEvt.js';
/** @import {EMC, EventListenerOrFn} from './ts-refs/trans-render/be/types.d.ts' */
/** @import {Actions, PAP,  AP} from './ts-refs/be-calculating/types' */;
/** @import {CSSQuery} from './ts-refs/trans-render/types.js' */

/**
 * @type {Partial<EMC<any, AP>>}
 */
export const emc = {
    hostInstanceOf: [HTMLElement],
    base: 'be-calculating',
    branches: ['', 'for', 'on'],
    enhPropKey: 'beCalculating',
    map: {
        '0.0': {
            instanceOf: 'String',
            mapsTo: 'handler'
        },
        '1.0': {
            instanceOf: 'DSSArray',
            arrValMapsTo: 'remoteSpecifiers'
        },
        '2.0': {
            instanceOf: 'String',
            mapsTo: 'eventArg'
        }
    },
    osotas: [
        {
            name: 'for',
            mapsTo: 'forAttr',
        },
    ],
    importEnh: async () => {
        const { BeCalculating } = 
        /** @type {{new(): IEnhancement<Element>}} */ 
        /** @type {any} */
        (await import('./be-calculating.js'));
        return BeCalculating;
    },
    mapLocalNameTo: 'enhElLocalName'
};
const mose = seed(emc);
MountObserver.synthesize(document, BeHive, mose);

for(const key in aggs){
    Registry.register(emc, key, aggs[key]);
}

/**
 * 
 * @param {string} handlerName 
 * @param {EventListenerOrFn} handler 
 */
export function register(handlerName, handler){
    Registry.register(emc, handlerName, handler);
}

/**
 * 
 * @param {CSSQuery} q 
 * @param {string} handlerName 
 * @param {EventListenerOrFn} handler 
 */
export function within(q, handlerName, handler){
    Registry.within(emc, q, handlerName, handler);
}