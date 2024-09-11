// @ts-check
import { BE } from 'be-enhanced/BE.js';
import { propInfo } from 'be-enhanced/cc.js';

/** @import {BEConfig, IEnhancement, BEAllProps} from './ts-refs/be-enhanced/types.d.ts' */
/** @import {Actions, PAP,  AP, BAP} from './ts-refs/be-calculating/types' */;
/** @import {CustomHandlers, EnhancementInfo} from './ts-refs/trans-render/be/types.d.ts' */
/** @import {AbsorbingObject, SharingObject} from './ts-refs/trans-render/asmr/types.d.ts' */
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
            checkedRegistry: {},
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
                ifAllOf: ['checkedRegistry', 'propToAO', 'handlerObj']
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
        //console.log({handlerKey})
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
        const checkedRegistry = true;
        if(handler === undefined){
            return /** @type {BAP} */ ({
                checkedRegistry
            });
        }
        
        let handlerObj = this.#customHandlers.get(handler);
        if(handlerObj === undefined) return /** @type {BAP} */ ({
            checkedRegistry
        });
        if(handlerObj.toString().substring(0, 5) === 'class'){
            handlerObj = new handlerObj();
        }
        return /** @type {BAP} */({
            handlerObj,
            checkedRegistry
        });
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
    /** @type {SharingObject | undefined} */
    #so;
    async handleEvent() {
        const self = /** @type {BAP} */(/** @type {any} */ (this));
        const {enhancedElement, propToAO, handlerObj, isOutputEl} = self;
        //console.log({enhancedElement, propToAO, handlerObj});
        const obj = {};
        const args = [];
        for(const prop in propToAO){
            const ao = propToAO[prop];
            const val = await ao.getValue();
            args.push(val);
            obj[prop] = val;
        }
        const event = new CalcEvent(args, obj);
        if(handlerObj !== undefined){
            if('handleEvent' in handlerObj){
                handlerObj.handleEvent(event);
            }else{
                handlerObj(event);
            }
        }

        this.channelEvent(event);
        const {r} = event;
        if(r !== rguid){
            if(isOutputEl){
                /** @type {HTMLOutputElement} */(enhancedElement).value = r;
            }else{
                if(this.#so === undefined){
                    const {ASMR} = await import('trans-render/asmr/asmr.js');
                    this.#so =  await ASMR.getSO(enhancedElement);
                }
                this.#so.setValue(r);
            }
            
        }
        
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

const rguid = 'XM5dz7tqZkeFCtytNXHPzw';
export class CalcEvent extends Event {
    static eventName = 'calculate';
    /** @type {any} */
    r = rguid;
    /** @type {Array<any>} */
    args;
    /** 
     * Event view model
     * @type {{[key: string]: any}} 
    */
    evm;
    /**
     * 
     * @param {Array<any>} args 
     * @param {{[key: string]: any}} evm 
     */
    constructor(args, evm){
        super(CalcEvent.eventName);
        this.args = args;
        this.evm = evm;
    }
}