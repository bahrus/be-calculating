import {BeCalculating} from './be-calculating.js';
import {def} from 'trans-render/lib/def.js';

await BeCalculating.bootUp();

def('be-calculating', BeCalculating);