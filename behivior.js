import { BeHive, seed, MountObserver } from 'be-hive/be-hive.js';
export const emc = {
    base: 'be-calculating',
    branches: ['', 'assign-to', 'name-of-calculator'],
    enhPropKey: 'beCalculating',
    map: {
        '0.0': {
            instanceOf: 'DSSArray',
            arrValMapsTo: 'remoteSpecifiers'
        },
        '1.0': {
            instanceOf: 'DSSArray',
            arrValMapsTo: 'assignTo'
        },
        '2.0': {
            instanceOf: 'String',
            mapsTo: 'nameOfCalculator'
        }
    },
    osotas: [
        {
            name: 'for',
            mapsTo: 'forAttr',
        },
        {
            name: 'oninput',
            mapsTo: 'onInput',
        },
        {
            name: 'onchange',
            mapsTo: 'onChange',
        },
        {
            name: 'onload',
            mapsTo: 'onLoad',
        }
    ],
    importEnh: async () => {
        const { BeCalculating } = await import('./be-calculating.js');
        return BeCalculating;
    }
};
const mose = seed(emc);
MountObserver.synthesize(document, BeHive, mose);
