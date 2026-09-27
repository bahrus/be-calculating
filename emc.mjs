// @ts-check

/** @import {EMC} from './types/mount-observer/types' */;
/** @import {AllProps, Actions} from './types/be-calculating/types' */
/** @import {RAConfig} from './types/roundabout/types' */

/**
 * @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions>>}
 */
export const emc = {
    enhConfig: {
        enhKey: 'beCalculating',
        spawn: 'be-calculating/be-calculating.js',
        withAttrs: {
            base: 'be-calculating',
            _base: {
                instanceOf: 'String',
                mapsTo: 'handler'
            },
            forAttr: '${base}-for',
            eventArg: '${base}-on',
            js: '${base}-js',
            format: '${base}-format',
            raw: '${base}-raw',
        }
    },
    customData: {
        weakRef: {
            properties: ['enhancedElement']
        },
        actions: {
            getDefltEvtType: {
                // eventArg is listed so roundabout monitors it -- otherwise an
                // imperatively set eventArg is clobbered by defaultPropVals.
                ifAllOf: ['enhElLocalName', 'categorized', 'eventArg']
            },
            // Runs once initialized (a handler set imperatively before roundabout
            // finishes never registers as a change), then on every handler change.
            // It is the only action that sets checkedRegistry, so hydrate never
            // runs before the handler is resolved.
            getEvtHandler: {
                ifKeyIn: ['initialized', 'handler'],
                ifAllOf: ['initialized']
            },
            parseForAttr: {
                ifAllOf: ['forAttr', 'isOutputEl']
            },
            parseForAttrDSS: {
                ifAllOf: ['forAttr', 'categorized', 'defaultEventType'],
                ifNoneOf: ['isOutputEl']
            },
            genRemoteSpecifiers: {
                ifAllOf: ['forArgs', 'defaultEventType']
            },
            seek: {
                ifAllOf: ['defaultEventType', 'remSpecifierLen']
            },
            hydrate: {
                ifAllOf: ['checkedRegistry', 'propToInfer', 'initialized'],
                ifNotAllOf: ['js', 'notYetParsedJS']
            },
            parseJS: {
                ifAllOf: ['js', 'notYetParsedJS', 'initialized']
            }
        },
        compacts: {
            when_enhElLocalName_changes_call_categorizeEl: 0,
            pass_length_of_remoteSpecifiers_to_remSpecifierLen: 0,
        },
        defaultPropVals: {
            eventArg: 'input',
            notYetParsedJS: true,
        }
    }
};

export function render() {
    return JSON.stringify(emc, null, 4);
}
