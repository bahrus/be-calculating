import {BeHive, EMC, seed, MountObserver} from 'be-hive/be-hive.js';

export const emc: EMC = {
    base: 'be-calculating',
    enhPropKey: 'beCalculating',
    // map: {
    //     '0.0': 'ni'
    // },
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
        const {BeCalculating} = await import('./be-calculating.js');
        return BeCalculating;
    }

};

const mose = seed(emc);

MountObserver.synthesize(document, BeHive, mose);