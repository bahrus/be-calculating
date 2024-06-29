import {BeHive, EMC, seed, MountObserver} from 'be-hive/be-hive.js';

export const emc: EMC = {
    base: 'be-calculating',
    enhPropKey: 'beCalculating',
    map: {
        '0.0': 'ni'
    },
    importEnh: async () => {
        const {BeCalculating} = await import('./be-calculating.js');
        return BeCalculating;
    }

};