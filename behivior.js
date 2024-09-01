// @ts-check
import { BeHive, seed, MountObserver } from 'be-hive/be-hive.js';
/** @import {EMC} from './ts-refs/trans-render/be/types.d.ts' */
/** @import {Actions, PAP,  AP} from './ts-refs/be-calculating/types' */;

/**
 * @type {EMC<any, AP>}
 */
export const emc = {
    hostInstanceOf: [HTMLElement],
    base: 'be-calculating',
    branches: ['', 'name-of-calculator', 'event-arg'],
    enhPropKey: 'beCalculating',
    map: {
        '0.0': {
            instanceOf: 'DSSArray',
            arrValMapsTo: 'remoteSpecifiers'
        },
        '1.0': {
            instanceOf: 'String',
            mapsTo: 'nameOfCalculator'
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
