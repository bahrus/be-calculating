// @ts-check
import {Registry} from 'be-calculating/CalcRegistry.js';

/**
 * Register a custom calculation handler globally.
 * @param {string} handlerName
 * @param {Function} handler
 */
export function register(handlerName, handler) {
    Registry.register(handlerName, handler);
}
