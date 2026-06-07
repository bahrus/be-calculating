// @ts-check
/** @import {Actions, PAP, AllProps, AP, RemoteSpecifier, AbsorbingObject} from './types/be-calculating/types' */;
/** @import {RoundaboutOptions} from './types/roundabout/types' */;
/** @import {ElementEnhancementGateway, SpawnContext} from './types/assign-gingerly/types' */;
/** @import {EMC} from './types/mount-observer/types' */;
/** @import {RAConfig} from './types/roundabout/types' */;

import {CalcEvent, rguid, Registry, aggs} from 'be-calculating/CalcRegistry.js';

let cnt = 0;

/**
 * @implements {Actions}
 * @implements {EventListenerObject}
 */
class BeCalculating {

    /**
     * @this {AllProps & Actions}
     * @param {Element & ElementEnhancementGateway} enhancedElement
     * @param {SpawnContext} ctx
     * @param {PAP} initVals
     */
    constructor(enhancedElement, ctx, initVals) {
        this.init(this, enhancedElement, ctx, initVals);
    }

    /**
     * @param {AllProps} self
     * @param {Element & ElementEnhancementGateway} enhancedElement
     * @param {SpawnContext} ctx
     * @param {PAP} initVals
     */
    async init(self, enhancedElement, ctx, initVals) {
        const {customData} = /** @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions>>} */ (ctx.emc);
        // For output elements, read the native 'for' attribute as forAttr
        const isOutput = enhancedElement.localName === 'output';
        const nativeFor = isOutput && enhancedElement.hasAttribute('for') 
            ? enhancedElement.getAttribute('for') 
            : undefined;
        /** @type {RoundaboutOptions} */
        const raOptions = {
            ...customData,
            vm: self,
            initialPropVals: {
                enhancedElement,
                ...customData?.defaultPropVals,
                enhElLocalName: enhancedElement.localName,
                enhKey: ctx.emc?.enhConfig?.enhKey || 'be-calculating',
                customHandlers: Registry.getHandlers(),
                ...(nativeFor ? {forAttr: nativeFor} : {}),
                ...initVals
            }
        };
        (await import('roundabout-lib/roundabout.js')).roundabout(raOptions);
    }

    /**
     * @param {AP} self
     * @returns {PAP}
     */
    getDefltEvtType(self) {
        const {eventArg} = self;
        return /** @type {PAP} */ ({
            defaultEventType: eventArg
        });
    }

    #ignoreForAttr = false;
    /**
     * @param {AP} self
     * @returns {PAP}
     */
    parseForAttr(self) {
        if (this.#ignoreForAttr) {
            this.#ignoreForAttr = false;
            return {};
        }
        const {enhancedElement} = self;
        return {
            forArgs: Array.from(/** @type {HTMLOutputElement} */ (enhancedElement).htmlFor)
        };
    }

    /**
     * Parse the 🧮-for attribute for non-output elements using DSS syntax.
     * @param {AP} self
     * @returns {Promise<PAP>}
     */
    async parseForAttrDSS(self) {
        const {forAttr, defaultEventType} = self;
        const {DSSArray} = await import('trans-render/DSSArray.js');
        const remoteSpecifiers = await DSSArray.parse(forAttr);
        // Ensure each specifier has an event name
        for (const spec of remoteSpecifiers) {
            if (!spec.evtName) spec.evtName = defaultEventType;
        }
        return /** @type {PAP} */ ({
            remoteSpecifiers
        });
    }

    /**
     * @param {AP} self
     * @returns {Promise<PAP>}
     */
    async parseJS(self) {
        const {enhKey, enhancedElement, js} = self;
        const fullExpr = `const {f, args} = e;
e.r = ${js};
        `;
        const handler = (await import('trans-render/lib/activate.js')).activate(fullExpr);
        if (this.#ac === undefined) this.#ac = new AbortController();
        enhancedElement.addEventListener(enhKey, handler, {signal: this.#ac.signal});
        return /** @type {PAP} */ ({
            notYetParsedJS: false,
        });
    }

    /**
     * @param {AP} self
     * @returns {PAP}
     */
    categorizeEl(self) {
        const {enhElLocalName} = self;
        return /** @type {PAP} */ ({
            isOutputEl: enhElLocalName === 'output',
            categorized: true,
        });
    }

    /**
     * @param {AP} self
     * @returns {PAP}
     */
    getEvtHandler(self) {
        const {handler, handlerObj: ho, customHandlers} = self;
        const checkedRegistry = true;
        if (!handler || ho) {
            return /** @type {PAP} */ ({
                checkedRegistry
            });
        }
        let handlerObj = customHandlers?.get(handler);
        if (handlerObj === undefined) return /** @type {PAP} */ ({
            checkedRegistry
        });
        if (handlerObj.toString().substring(0, 5) === 'class') {
            handlerObj = new handlerObj();
        }
        return /** @type {PAP} */ ({
            handlerObj,
            checkedRegistry
        });
    }

    /**
     * @param {AP} self
     * @returns {PAP}
     */
    genRemoteSpecifiers(self) {
        const {forArgs, defaultEventType} = self;
        return /** @type {PAP} */ ({
            remoteSpecifiers: forArgs.map(fa => ({
                id: fa,
                evtName: defaultEventType,
            })),
        });
    }

    /**
     * @param {AP} self
     * @returns {Promise<PAP>}
     */
    async seek(self) {
        const {remoteSpecifiers, enhancedElement, defaultEventType} = self;
        const {find} = await import('trans-render/dss/find.js');
        const {ASMR} = await import('trans-render/asmr/asmr.js');
        /** @type {{[key: string]: AbsorbingObject}} */
        const propToAO = {};

        for (const remoteSpecifier of remoteSpecifiers) {
            const remoteEl = await find(enhancedElement, remoteSpecifier);
            if (!(remoteEl instanceof HTMLElement)) continue;
            if (!remoteEl.id && (enhancedElement instanceof HTMLOutputElement) && !enhancedElement.matches(`[for~="${remoteEl.id}"]`)) {
                const id = `be-calculating-${cnt}`;
                remoteEl.id = id;
                enhancedElement.htmlFor.add(id);
                cnt++;
            }
            let nameOfVariable =
                remoteSpecifier.prop === '$0' ? remoteEl.dataset.id || remoteEl.id
                : remoteSpecifier.prop || remoteEl.dataset.id || remoteEl.id;
            if (nameOfVariable === undefined) throw 'NI';
            const {prop} = remoteSpecifier;
            const ao = await ASMR.getAO(remoteEl, {
                evt: remoteSpecifier.evtName || defaultEventType,
                selfIsVal: remoteSpecifier.prop === '$0',
                propToAbsorb: prop
            });
            propToAO[nameOfVariable] = ao;
        }
        return {
            propToAO
        };
    }

    /** @type {AbortController | undefined} */
    #ac;

    /**
     * @param {AP} self
     * @returns {Promise<PAP>}
     */
    async hydrate(self) {
        if (this.#ac === undefined) {
            this.#ac = new AbortController();
        }
        const ac = this.#ac;
        const {propToAO} = self;
        const aos = Object.values(propToAO);
        for (const ao of aos) {
            ao.addEventListener('.', this, {signal: ac.signal});
        }
        this.handleEvent();
        return {
            resolved: true
        };
    }

    /** @type {any} */
    #so;

    async handleEvent() {
        const self = /** @type {AP} */ (/** @type {any} */ (this));
        const {enhancedElement, propToAO, handlerObj, isOutputEl, enhKey} = self;
        const obj = {};
        const args = [];
        for (const prop in propToAO) {
            const ao = propToAO[prop];
            const val = await ao.getValue();
            args.push(val);
            obj[prop] = val;
        }
        const event = new CalcEvent(enhKey, args, obj, enhancedElement);
        if (handlerObj !== undefined) {
            if ('handleEvent' in handlerObj) {
                /** @type {EventListenerObject} */ (handlerObj).handleEvent(event);
            } else {
                handlerObj(event);
            }
        }

        this.channelEvent(event);
        const {r} = event;
        if (r !== rguid) {
            if (isOutputEl) {
                /** @type {HTMLOutputElement} */ (enhancedElement).value = r;
                enhancedElement.dispatchEvent(new Event('output'));
            } else {
                if (this.#so === undefined) {
                    const {ASMR} = await import('trans-render/asmr/asmr.js');
                    this.#so = await ASMR.getSO(enhancedElement);
                }
                this.#so.setValue(r);
            }
        }
    }

    /**
     * @param {CalcEvent} event
     */
    channelEvent(event) {
        const self = /** @type {AP} */ (/** @type {any} */ (this));
        const {enhancedElement, enhKey} = self;
        enhancedElement.dispatchEvent(event);
    }
}

export {BeCalculating, CalcEvent};
