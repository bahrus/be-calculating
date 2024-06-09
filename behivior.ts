import './behance.js';
import {BeHive} from 'be-hive/be-hive.js';

BeHive.registry.register({
    base: 'be-calculating',
    enhPropKey: 'beCalculating',
    map: {
        '0.0': 'ni'
    },
    do: {
        mount:{
            import: async() => {
                const {BeCalculating} = await import('./be-calculating.js');
                return BeCalculating;
            }
        }
    }
});