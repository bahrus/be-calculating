// @ts-check
import { BeHive, seed, MountObserver } from 'be-hive/be-hive.js';
import {Registry} from 'be-hive/Registry.js';
import {CalcEvent} from './Events.js';
/** @import {EMC} from './ts-refs/trans-render/be/types.d.ts' */
/** @import {Actions, PAP,  AP} from './ts-refs/be-calculating/types' */;

/**
 * @type {EMC<any, AP>}
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

Registry.register(emc, '+', e => e.r = e.args.reduce((acc, arg) => acc + arg));
Registry.register(emc, '*', e => e.r = e.args.reduce((acc, arg) => acc * arg));
Registry.register(emc, 'max', e => e.r = e.args.reduce((acc, arg) => Math.max(acc, arg)));
Registry.register(emc, 'min', e => e.r = e.args.reduce((acc, arg) => Math.min(acc, arg)));