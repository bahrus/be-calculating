import {BeHive, EMC, seed, MountObserver} from 'be-hive/be-hive.js';

export const emc: EMC = {
    base: 'be-calculating',
    branches: ['', 'assign-to'],
    enhPropKey: 'beCalculating',
    map: {
        '0.0': {
            instanceOf: 'DSSArray',
            arrValMapsTo: 'remoteSpecifiers'
        },
        '1.0': {
            instanceOf: 'DSSArray',
            arrValMapsTo: 'assignTo'
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
        const {BeCalculating} = await import('./be-calculating.js');
        return BeCalculating;
    }

};

const mose = seed(emc);

MountObserver.synthesize(document, BeHive, mose);