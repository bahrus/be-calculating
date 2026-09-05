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
                ifAllOf: ['enhElLocalName', 'categorized']
            },
            getEvtHandler: {
                ifAtLeastOneOf: ['handler', 'js']
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
                ifAllOf: ['checkedRegistry', 'propToInfer'],
                ifNotAllOf: ['js', 'notYetParsedJS']
            },
            parseJS: {
                ifAllOf: ['js', 'notYetParsedJS']
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
