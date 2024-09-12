// @ts-check
import { MountObserver, seed, BeHive } from 'be-hive/be-hive.js';
import { emc as baseEMC } from './behivior.js';
import {Registry} from 'be-hive/Registry.js';
import {CalcEvent} from './Events.js';

export const emc = {
    ...baseEMC,
    base: '🧮',
    enhPropKey: '🧮',
    handlerKey: '🧮'
};
const mose = seed(emc);
MountObserver.synthesize(document, BeHive, mose);


Registry.register(emc, '+', e => e.r = e.args.reduce((acc, arg) => acc + arg));
Registry.register(emc, '*', e => e.r = e.args.reduce((acc, arg) => acc * arg));
Registry.register(emc, 'max', e => e.r = e.args.reduce((acc, arg) => Math.max(acc, arg)));
Registry.register(emc, 'min', e => e.r = e.args.reduce((acc, arg) => Math.min(acc, arg)));


