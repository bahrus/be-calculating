// @ts-check
import { resolved, rejected, propInfo} from 'be-enhanced/cc.js';
import { BE } from 'be-enhanced/BE.js';

/** @import {BEConfig, IEnhancement, BEAllProps} from './ts-refs/be-enhanced/types.d.ts' */
/** @import {Actions, PAP,  AP, BAP} from './ts-refs/be-calculating/types' */;
/** @import {EnhancementInfo} from './ts-refs/trans-render/be/types.d.ts' */
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
        propDefaults: {
            nameOfCalculator: 'Calculator',
            isAttached: true,
            categorized: false,
            remSpecifierLen: 0,
            eventArg: '$',
            hasInlineEvent: false,
        },
        propInfo:{
            ...propInfo,
            forAttr: {},
            forArgs: {},
            remoteSpecifiers: {},
            publishEventType: {},
            defaultEventType: {},
            scriptEl: {},
            isOutputEl: {},
            enhElLocalName: {},
            propToAO: {},
            calculator: {},
        },
        compacts: {
            when_enhElLocalName_changes_invoke_categorizeEl: 0,
            pass_length_of_remoteSpecifiers_to_remSpecifierLen: 0,
        },
        actions: {
            getDefltEvtType: {
                ifAllOf: ['enhElLocalName', 'categorized'],
            },
            findScriptEl: {
                ifAllOf: ['categorized'],
                ifNoneOf: ['hasInlineEvent']
            },
            importSymbols: {
                ifAllOf: ['scriptEl']
            },
            parseForAttr: {
                ifAllOf: ['forAttr', 'isOutputEl']
            },
            genRemoteSpecifiers: {
                ifAllOf: ['forArgs', 'publishEventType']
            },
            seek: {
                ifAllOf: ['publishEventType', 'defaultEventType', 'remSpecifierLen']
            },
            hydrate: {
                ifAllOf: ['propToAO'],
                ifAtLeastOneOf: ['hasInlineEvent', 'calculator']
            }
        },
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
            hasInlineEvent: !!(
                enhancedElement.onload || enhancedElement.oninput || enhancedElement.onchange
            ),
            categorized: true,
        });
    }

    /**
     * 
     * @param {BAP} self 
     */
    getDefltEvtType(self){
        const {enhElLocalName, enhancedElement, hasInlineEvent} = self;
        const deflt = /** @type {PAP} */({
            publishEventType: 'load',
            defaultEventType: 'input'
        })
        if(!hasInlineEvent){
            return deflt;            
        }
        switch(enhElLocalName){
            case 'output':
                if(self.forAttr === undefined){
                    return deflt;
                }else{
                    if(enhancedElement.oninput){
                        return /** @type {PAP} */({
                            publishEventType: 'input',
                            defaultEventType: 'input',
                        });
                    }else if(enhancedElement.onchange){
                        return /** @type {PAP} */({
                            publishEventType: 'change',
                            defaultEventType: 'change'
                        });
                    }

                }

        }
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
    findScriptEl(self) {
        const {enhancedElement} = self;
        const scriptEl = enhancedElement.previousElementSibling;
        if(!(scriptEl instanceof HTMLScriptElement)) throw 404;
        return /** @type {PAP} */ ({
            scriptEl
        });
    }

    /**
     * 
     * @param {BAP} self 
     */
    async importSymbols(self){
        const {scriptEl, nameOfCalculator, forAttr} = self;
        const {emc} = await import('be-exportable/behivior.js');
        const exportable = 
            /** @type {BeExportableAllProps} */
            (await /** @type {any} */(scriptEl).beEnhanced.whenResolved(emc));
        return /** @type {PAP} */ {
            calculator: exportable.exports[nameOfCalculator]
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
                evt: remoteSpecifier.evt || defaultEventType
            });
            propToAO[prop] = ao;
        }
        return {
            propToAO
        };
    }

    /**
     * @type {Array<AbortController> | undefined}
     */
    #acs;

    /**
     * 
     * @param {BAP} self 
     */
    async hydrate(self){
        this.disconnect();
        const {propToAO} = self;
        const aos = Object.values(propToAO);
        for(const ao of aos){
            const ac = new AbortController();
            //TODO:  share one abort controller
            this.#acs?.push(ac);
            //TODO:  remove line below
            //ao.addEventListener('value', this, {signal: ac.signal});
            ao.addEventListener('.', this, {signal: ac.signal});

        }
        this.handleEvent();
        return {
            resolved: true
        }
    }




    /**
     * @type {EventListenerObject | undefined}
     */
    #calculatorInstance;
    async handleEvent() {
        const self = /** @type {BAP} */(/** @type {any} */ (this));
        const {enhancedElement, calculator, propToAO, eventArg, hasInlineEvent, publishEventType} = self;
        if(eventArg in enhancedElement){
            throw `${eventArg} classes with existing element.  Specify alternative eventArg.`;
        }
        const factors = {};
        for(const prop in propToAO){
            const ao = propToAO[prop];
            const val = await ao.getValue();
            factors[prop] = val;
        }
        enhancedElement[eventArg] = factors;
        /**
         * @type {Event}
         */
        let event;
        if(hasInlineEvent && publishEventType !== 'load'){
            event = new Event(publishEventType);
        }else{
            event = new LoadEvent(enhancedElement, factors);
        }
        try{
            self.channelEvent(event);
        }finally{
            delete enhancedElement[eventArg];
        }
        if(calculator !== undefined && this.#calculatorInstance === undefined){
            const c = new calculator();
            this.#calculatorInstance = c;
        }
        this.#calculatorInstance?.handleEvent(event);
        
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
        const acs = this.#acs;
        if(acs !== undefined){
            for(const ac of acs){
                ac.abort();
            }
        }
        this.#acs = [];
    }

}

await BeCalculating.bootUp();
export {BeCalculating};

export class LoadEvent extends Event{
    static EventName = 'load';
    /**
     * @type {any}
     */
    factors;
    /**
     * @type {Element}
     */
    target;
    /**
     * 
     * @param {Element} target 
     * @param {any} factors 
     */
    constructor (
        target,
        factors
    ){
        super(LoadEvent.EventName);
        this.factors = factors;
        this.target = target;
    }
}