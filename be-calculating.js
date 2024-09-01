// @ts-check
import { resolved, rejected, propInfo} from 'be-enhanced/cc.js';
import { BE } from 'be-enhanced/BE.js';

/** @import {BEConfig, IEnhancement, BEAllProps} from './ts-refs/be-enhanced/types.d.ts' */
/** @import {Actions, PAP,  AP, BAP} from './ts-refs/be-calculating/types' */;
/** @import {EnhancementInfo} from './ts-refs/trans-render/be/types.d.ts' */
/** @import {AbsorbingObject} from './ts-refs/trans-render/asmr/types.d.ts' */

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
            nameOfCalculator: 'calculator',
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
        },
        compacts: {
            when_enhElLocalName_changes_invoke_categorizeEl: 0,
            pass_length_of_remoteSpecifiers_to_remSpecifierLen: 0,
        },
        actions: {
            getDefltEvtType: {
                ifAllOf: ['enhElLocalName', 'categorized'],
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
                ifAllOf: ['propToAO']
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
            hasInlineEvent: !!(enhancedElement.onload || enhancedElement.oninput || enhancedElement.onload),
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
                            defaultEventType: 'input'
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
    genRemoteSpecifiers(self){
        const {forArgs, publishEventType} = self;
        return /** @type {PAP} */ ({
            remoteSpecifiers: forArgs.map(fa  => ({
                elS: fa,
                prop: fa,
                s: '#',
                evt: publishEventType
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
            this.#acs?.push(ac);
            //TODO:  remove line below
            ao.addEventListener('value', this, {signal: ac.signal});
            ao.addEventListener('.', this, {signal: ac.signal});
        }
        this.handleEvent();
        return {
            resolved: true
        }
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

    /**
     * @param {Element} enhancedElement
     * @override
     */
    async detach(enhancedElement){
        await super.detach(enhancedElement);
        this.disconnect();
    }

    async handleEvent() {
        const self = /** @type {BAP} */(/** @type {any} */ (this));
        const {enhancedElement, publishEventType, propToAO, eventArg} = self;
        if(eventArg in enhancedElement){
            throw `${eventArg} classes with existing element.  Specify alternative eventArg.`;
        }
        const arg = {};
        for(const prop in propToAO){
            const ao = propToAO[prop];
            const val = await ao.getValue();
            arg[prop] = val;
        }
        enhancedElement[eventArg] = arg;
        try{
            self.channelEvent(new Event(publishEventType));
        }finally{
            delete enhancedElement[eventArg];
        }
        
        
    }

}

await BeCalculating.bootUp();
export {BeCalculating};