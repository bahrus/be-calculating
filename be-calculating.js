// @ts-check
import { BE } from 'be-enhanced/BE.js';
import { propInfo } from 'be-enhanced/cc.js';

/** @import {BEConfig, IEnhancement, BEAllProps} from './ts-refs/be-enhanced/types.d.ts' */
/** @import {Actions, PAP,  AP, BAP} from './ts-refs/be-calculating/types' */;
/** @import {CustomHandlers, EnhancementInfo} from './ts-refs/trans-render/be/types.d.ts' */
/** @import {AbsorbingObject} from './ts-refs/trans-render/asmr/types.d.ts' */
/** @import {AllProps as BeExportableAllProps} from  './ts-refs/be-exportable/types.d.ts' */

let cnt = 0;
/**
 * @implements {Actions}
 * @implements {EventListenerObject}
 * 
 */
class BeCalculating extends BE {
    /**
     * @type {BEConfig<AP & BEAllProps, Actions & IEnhancement, any>}
     */
    static config = {
        propInfo:{
            ...propInfo,
            categorized: {},
            forAttr: {},
            forArgs: {},
            handler: {},
            handlerObj: {},
            defaultEventType: {},
            remoteSpecifiers: {},
            remSpecifierLen: {},
            enhElLocalName: {},
            propToAO: {},
            isOutputEl: {},
        },
        compacts: {
            when_enhElLocalName_changes_invoke_categorizeEl: 0,
            when_handler_changes_invoke_getEvtHandler: 0,
            pass_length_of_remoteSpecifiers_to_remSpecifierLen: 0,
        },
        actions: {
            getDefltEvtType: {
                ifAllOf: ['enhElLocalName', 'categorized']
            },
            parseForAttr: {
                ifAllOf: ['forAttr', 'isOutputEl']
            },
            genRemoteSpecifiers:{
                ifAllOf: ['forArgs', 'defaultEventType']
            },
            seek: {
                ifAllOf: ['defaultEventType', 'remSpecifierLen']
            },
            hydrate: {
                ifAllOf: ['propToAO', 'handlerObj']
            }
        }
    }

    /**
     * @type {CustomHandlers}
     */
    #customHandlers;

    /**
     * @param {Element} enhancedElement
     * @param {EnhancementInfo} enhancementInfo 
     * @override
     */
    async attach(enhancedElement, enhancementInfo){
        super.attach(enhancedElement, enhancementInfo);
        const {synConfig, mountCnfg} = enhancementInfo;
        const {handlerKey} = synConfig;
        console.log({handlerKey})
        const {registeredHandlers} = await import('be-hive/be-hive.js');
        const cluster = registeredHandlers.get(synConfig);
        if(cluster === undefined) throw 404;
        const {enhPropKey} = mountCnfg;
        const handlers = cluster.get(enhPropKey);
        if(handlers === undefined){
            console.warn(404);
            return
        }
        this.#customHandlers = handlers;
    }

    /**
     * 
     * @param {BAP} self 
     */
    getDefltEvtType(self){
        const {enhElLocalName, enhancedElement} = self;
        const deflt = /** @type {PAP} */({
            //publishEventType: 'load',
            defaultEventType: 'input'
        });

        // switch(enhElLocalName){
        //     case 'output':
        //         if(self.forAttr === undefined){
        //             return deflt;
        //         }else{
        //             if(enhancedElement.oninput){
        //                 return /** @type {PAP} */({
        //                     publishEventType: 'input',
        //                     defaultEventType: 'input',
        //                 });
        //             }else if(enhancedElement.onchange){
        //                 return /** @type {PAP} */({
        //                     publishEventType: 'change',
        //                     defaultEventType: 'change'
        //                 });
        //             }

        //         }

        // }
        return deflt;
    }

    #ignoreForAttr = false;
    /**
     * 
     * @param {BAP} self 
     */
    parseForAttr(self) {
        if(this.#ignoreForAttr){
            this.#ignoreForAttr = false;
            return {};
        }
        const {enhancedElement} = self;
        return {
            forArgs: Array.from(/** @type {HTMLOutputElement} */(enhancedElement).htmlFor)
        }
    }

    /**
     * 
     * @param {BAP} self 
     */
    categorizeEl(self){
        //TODO Make this logic compactible?
        const {enhElLocalName, enhancedElement} = self;

        return /** @type {PAP} */({
            isOutputEl: enhElLocalName === 'output',
            categorized: true,
        });
    }

    /**
     * 
     * @param {BAP} self 
     */
    getEvtHandler(self){
        const {handler} = self;
        const handlerObj = this.#customHandlers.get(handler);
        console.log({handlerObj});
        return {
            handlerObj
        }
    }

    /**
     * 
     * @param {BAP} self 
     */
    genRemoteSpecifiers(self){
        const {forArgs, defaultEventType} = self;
        return /** @type {PAP} */ ({
            remoteSpecifiers: forArgs.map(fa  => ({
                elS: fa,
                prop: fa,
                s: '#',
                evt: defaultEventType
            })),
        });
    }

    /**
     * 
     * @param {BAP} self 
     */
    async seek(self){
        const {remoteSpecifiers, enhancedElement, defaultEventType} = self;
        const {find} = await import('trans-render/dss/find.js');
        const {ASMR} = await import('trans-render/asmr/asmr.js');
        //const eventTypeToListen = publishEventType !== 'load' ? publishEventType || 'input' : 'input';
        /**
         * @type {{[key: string]: AbsorbingObject}}
         */
        const propToAO = {};

        for(const remoteSpecifier of remoteSpecifiers){
            const remoteEl = await find(enhancedElement, remoteSpecifier);
            if(!(remoteEl instanceof Element)) continue;
            if(enhancedElement instanceof HTMLOutputElement && !remoteEl.id){
                const id = `be-calculating-${cnt}`;
                remoteEl.id = id;
                enhancedElement.htmlFor.add(id);
                cnt++;
            }
            const {prop} = remoteSpecifier;
            if(prop === undefined) throw 'NI';
            const ao = await ASMR.getAO(remoteEl, {
                evt: remoteSpecifier.evt || defaultEventType,
                selfIsVal: remoteSpecifier.path === '$0',
            });
            propToAO[prop] = ao;
        }
        return {
            propToAO
        };
    }
    /**
     * @type {AbortController | undefined}
     */
    #ac
    /**
     * 
     * @param {BAP} self 
     */
    async hydrate(self){
        this.disconnect();
        const ac = this.#ac = new AbortController();
        const {propToAO} = self;
        const aos = Object.values(propToAO);
        for(const ao of aos){
            ao.addEventListener('.', this, {signal: ac.signal});
        }
        this.handleEvent();
        return {
            resolved: true
        }
    }
    async handleEvent() {
        const self = /** @type {BAP} */(/** @type {any} */ (this));
        const {enhancedElement, propToAO, eventArg} = self;
        console.log({enhancedElement, propToAO, eventArg})
    }

        /**
     * @param {Element} enhancedElement
     * @override
     */
    async detach(enhancedElement){
        await super.detach(enhancedElement);
        this.disconnect();
    }
    
    disconnect(){
        if(this.#ac !== undefined){
            this.#ac.abort();
        };

    }
}

await BeCalculating.bootUp();
export {BeCalculating};